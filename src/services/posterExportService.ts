import { GeneratedPost } from './geminiService';
import { SupportingCitation } from '../utils/categoryEditorial';

export type PosterExportFormat = 'whatsapp-9x16' | 'facebook-4x5' | 'portrait-3x4';
export type PosterDesignStyle = 'royal-editorial' | 'cinema-vertical' | 'manuscript-parchment';

export interface PosterFormatSpec {
  id: PosterExportFormat;
  label: string;
  ratioLabel: string;
  platformHint: string;
  width: number;
  height: number;
}

export const POSTER_EXPORT_FORMATS: PosterFormatSpec[] = [
  {
    id: 'whatsapp-9x16',
    label: 'حالة واتساب / ستوري',
    ratioLabel: '9:16',
    platformHint: '1080×1920 · عمودي كامل للواتس والريلز',
    width: 1080,
    height: 1920,
  },
  {
    id: 'facebook-4x5',
    label: 'منشور فيسبوك عمودي',
    ratioLabel: '4:5',
    platformHint: '1080×1350 · المقاس المثالي لفيسبوك وإنستغرام',
    width: 1080,
    height: 1350,
  },
  {
    id: 'portrait-3x4',
    label: 'بطاقة عمودية كلاسيكية',
    ratioLabel: '3:4',
    platformHint: '1080×1440 · عمودي متوازن للمشاركة والطباعة',
    width: 1080,
    height: 1440,
  },
];

export const POSTER_DESIGN_STYLES: Array<{
  id: PosterDesignStyle;
  label: string;
  hint: string;
}> = [
  {
    id: 'royal-editorial',
    label: 'تحريري فاخر',
    hint: 'مشهد علوي + بطاقة عاجية مذهّبة',
  },
  {
    id: 'cinema-vertical',
    label: 'سينمائي غامر',
    hint: 'خلفية كاملة مع لوحة زجاجية داكنة',
  },
  {
    id: 'manuscript-parchment',
    label: 'مخطوطة تراثية',
    hint: 'نافذة قوس إسلامي + ورق مخطوطة مذهّب',
  },
];

export interface PosterRenderConfig {
  post: GeneratedPost;
  imageUrl: string;
  format: PosterExportFormat;
  style: PosterDesignStyle;
  fontFamily: string;
  fontFamilyCss: string;
  cardAccentColor: string;
  cardFrameStyle: 'clean' | 'gold-border';
  showTopic: boolean;
  showReflection?: boolean;
  showVersePrefix: boolean;
  showVerseText: boolean;
  showVerseReference: boolean;
  showSupportingCitation: boolean;
  activeCitation: SupportingCitation | null;
  pageSignature: string;
  overlayOpacity?: number;
}

export function getPosterFormatSpec(format: PosterExportFormat): PosterFormatSpec {
  return POSTER_EXPORT_FORMATS.find((f) => f.id === format) || POSTER_EXPORT_FORMATS[0];
}

async function ensurePosterFontsReady(fontFamily: string): Promise<void> {
  if (typeof document === 'undefined' || !('fonts' in document)) return;
  try {
    await document.fonts.ready;
    const primary = fontFamily.split(',')[0].replace(/['"]/g, '').trim();
    if (primary) {
      await Promise.allSettled([
        document.fonts.load(`400 36px "${primary}"`),
        document.fonts.load(`600 40px "${primary}"`),
        document.fonts.load(`700 48px "${primary}"`),
      ]);
    }
  } catch {
    // Proceed gracefully if font API is restricted
  }
}

function loadPosterImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.referrerPolicy = 'no-referrer';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('تعذر تحميل صورة الخلفية لتصدير البطاقة.'));
    img.src = url;
  });
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function drawImageCoverRect(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  dx: number,
  dy: number,
  dw: number,
  dh: number
) {
  const iw = img.naturalWidth || img.width || 1080;
  const ih = img.naturalHeight || img.height || 1080;
  const imgRatio = iw / ih;
  const boxRatio = dw / dh;

  let sx = 0;
  let sy = 0;
  let sw = iw;
  let sh = ih;

  if (imgRatio > boxRatio) {
    sw = ih * boxRatio;
    sx = (iw - sw) / 2;
  } else {
    sh = iw / boxRatio;
    sy = (ih - sh) / 2;
  }

  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
}

function wrapArabic(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number
): string[] {
  const paragraphs = text
    .split('\n')
    .map((p) => p.trim())
    .filter(Boolean);
  const allLines: string[] = [];

  for (const para of paragraphs) {
    const words = para.split(/\s+/);
    let current = '';

    for (const word of words) {
      const test = current ? `${current} ${word}` : word;
      if (ctx.measureText(test).width <= maxWidth || !current) {
        current = test;
      } else {
        allLines.push(current);
        current = word;
      }
    }
    if (current) allLines.push(current);
  }

  if (allLines.length <= maxLines) return allLines;
  const trimmed = allLines.slice(0, maxLines);
  const last = trimmed[trimmed.length - 1];
  trimmed[trimmed.length - 1] = last.length > 3 ? `${last.slice(0, -2)}…` : `${last}…`;
  return trimmed;
}

function splitPoetryLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const hemistichs = text
    .split('/')
    .map((s) => s.trim())
    .filter(Boolean);
  if (hemistichs.length >= 2) {
    const out: string[] = [];
    for (const h of hemistichs.slice(0, 2)) {
      out.push(...wrapArabic(ctx, h, maxWidth, 2));
    }
    return out;
  }
  return wrapArabic(ctx, text, maxWidth, 3);
}

function drawIslamicCornerFiligree(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string
) {
  const arm = Math.min(w, h) * 0.068;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 2.6;
  ctx.lineCap = 'round';

  const corners: Array<[number, number, number, number]> = [
    [x, y, 1, 1],
    [x + w, y, -1, 1],
    [x, y + h, 1, -1],
    [x + w, y + h, -1, -1],
  ];

  for (const [cx, cy, dx, dy] of corners) {
    ctx.beginPath();
    ctx.moveTo(cx + dx * arm, cy);
    ctx.lineTo(cx, cy);
    ctx.lineTo(cx, cy + dy * arm);
    ctx.stroke();

    // Inner nested corner bracket
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(cx + dx * (arm * 0.62), cy + dy * 10);
    ctx.lineTo(cx + dx * 10, cy + dy * 10);
    ctx.lineTo(cx + dx * 10, cy + dy * (arm * 0.62));
    ctx.stroke();
    ctx.lineWidth = 2.6;

    // Small golden diamond rosette
    const mx = cx + dx * 20;
    const my = cy + dy * 20;
    ctx.beginPath();
    ctx.moveTo(mx, my - 5.5);
    ctx.lineTo(mx + 5.5, my);
    ctx.lineTo(mx, my + 5.5);
    ctx.lineTo(mx - 5.5, my);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function drawOrnamentalDivider(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  y: number,
  spanWidth: number,
  color: string
) {
  ctx.save();
  const half = spanWidth / 2;
  const grad = ctx.createLinearGradient(centerX - half, y, centerX + half, y);
  grad.addColorStop(0, 'rgba(212, 175, 55, 0)');
  grad.addColorStop(0.35, color);
  grad.addColorStop(0.65, color);
  grad.addColorStop(1, 'rgba(212, 175, 55, 0)');

  ctx.strokeStyle = grad;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(centerX - half, y);
  ctx.lineTo(centerX - 16, y);
  ctx.moveTo(centerX + 16, y);
  ctx.lineTo(centerX + half, y);
  ctx.stroke();

  // Center 4-point diamond
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(centerX, y - 6);
  ctx.lineTo(centerX + 7, y);
  ctx.lineTo(centerX, y + 6);
  ctx.lineTo(centerX - 7, y);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawSubtleEightPointStarWatermark(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  color: string
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;

  for (let rot = 0; rot < 2; rot++) {
    ctx.save();
    ctx.rotate((rot * Math.PI) / 4);
    ctx.strokeRect(-radius * 0.68, -radius * 0.68, radius * 1.36, radius * 1.36);
    ctx.restore();
  }

  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.44, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

interface MeasuredPosterTypography {
  titlePx: number;
  bodyPx: number;
  prefixPx: number;
  versePx: number;
  refPx: number;
  citLabelPx: number;
  citBodyPx: number;
  citSourcePx: number;
  topicLines: string[];
  bodyLines: string[];
  verseLines: string[];
  citationLines: string[];
  hasPrefix: boolean;
  refText: string;
  totalHeight: number;
  verseBlockHeight: number;
  citationBlockHeight: number;
}

function measurePosterTypography(
  ctx: CanvasRenderingContext2D,
  config: PosterRenderConfig,
  maxWidth: number,
  isTallStory: boolean,
  scale: number
): MeasuredPosterTypography {
  const baseTitle = (isTallStory ? 50 : 44) * scale;
  const baseBody = (isTallStory ? 34 : 30) * scale;
  const basePrefix = (isTallStory ? 26 : 23) * scale;
  const baseVerse = (isTallStory ? 40 : 35) * scale;
  const baseRef = (isTallStory ? 23 : 21) * scale;
  const baseCitLabel = (isTallStory ? 24 : 21) * scale;
  const baseCitBody = (isTallStory ? 30 : 27) * scale;
  const baseCitSource = (isTallStory ? 21 : 19) * scale;

  const titlePx = Math.round(baseTitle);
  const bodyPx = Math.round(baseBody);
  const prefixPx = Math.round(basePrefix);
  const versePx = Math.round(baseVerse);
  const refPx = Math.round(baseRef);
  const citLabelPx = Math.round(baseCitLabel);
  const citBodyPx = Math.round(baseCitBody);
  const citSourcePx = Math.round(baseCitSource);

  ctx.font = `700 ${titlePx}px ${config.fontFamilyCss}`;
  const topicLines =
    config.showTopic && config.post.topic?.trim()
      ? wrapArabic(ctx, config.post.topic.trim(), maxWidth, 2)
      : [];

  ctx.font = `500 ${bodyPx}px ${config.fontFamilyCss}`;
  const bodyLines =
    config.showReflection !== false && config.post.content?.trim()
      ? wrapArabic(ctx, config.post.content.trim(), maxWidth, isTallStory ? 9 : 7)
      : [];

  const rawVerse = config.post.verseText?.trim() || '';
  const hasVerse = Boolean(rawVerse) && config.showVerseText;
  const hasPrefix = hasVerse && config.showVersePrefix;
  const formattedVerse = hasVerse ? `﴿ ${rawVerse.replace(/[﴿﴾]/g, '').trim()} ﴾` : '';
  ctx.font = `700 ${versePx}px ${config.fontFamilyCss}`;
  const verseLines = hasVerse ? wrapArabic(ctx, formattedVerse, maxWidth - 34, 5) : [];

  const refText =
    hasVerse && config.showVerseReference
      ? config.post.verseReference ||
        (config.post.surahName ? `(${config.post.surahName} : ${config.post.verseNumber || ''})` : '')
      : '';

  const citation = config.showSupportingCitation ? config.activeCitation : null;
  let citationLines: string[] = [];
  if (citation?.text?.trim()) {
    ctx.font = `600 ${citBodyPx}px ${config.fontFamilyCss}`;
    citationLines =
      citation.type === 'poetry'
        ? splitPoetryLines(ctx, citation.text.trim(), maxWidth - 20)
        : wrapArabic(ctx, citation.text.trim(), maxWidth - 20, 4);
  }

  const gap = Math.round(24 * scale);

  const topicH = topicLines.length > 0 ? topicLines.length * (titlePx * 1.42) + gap : 0;
  const bodyH = bodyLines.length > 0 ? bodyLines.length * (bodyPx * 1.66) + gap : 0;

  let verseBlockHeight = 0;
  if (verseLines.length > 0) {
    verseBlockHeight =
      Math.round(44 * scale) +
      (hasPrefix ? prefixPx * 1.55 + Math.round(8 * scale) : 0) +
      verseLines.length * (versePx * 1.64) +
      (refText ? refPx * 1.5 + Math.round(10 * scale) : 0);
  }

  let citationBlockHeight = 0;
  if (citation && citationLines.length > 0) {
    citationBlockHeight =
      Math.round(30 * scale) +
      citLabelPx * 1.5 +
      Math.round(8 * scale) +
      citationLines.length * (citBodyPx * 1.62) +
      (citation.source ? citSourcePx * 1.45 + Math.round(8 * scale) : 0);
  }

  const totalHeight =
    topicH +
    bodyH +
    (verseBlockHeight > 0 ? verseBlockHeight + gap : 0) +
    (citationBlockHeight > 0 ? citationBlockHeight + Math.round(14 * scale) : 0);

  return {
    titlePx,
    bodyPx,
    prefixPx,
    versePx,
    refPx,
    citLabelPx,
    citBodyPx,
    citSourcePx,
    topicLines,
    bodyLines,
    verseLines,
    citationLines,
    hasPrefix,
    refText,
    totalHeight,
    verseBlockHeight,
    citationBlockHeight,
  };
}

function fitPosterTypography(
  ctx: CanvasRenderingContext2D,
  config: PosterRenderConfig,
  maxWidth: number,
  maxAllowedHeight: number,
  isTallStory: boolean
): MeasuredPosterTypography {
  const scales = [1, 0.92, 0.85, 0.78, 0.72, 0.66];
  let best = measurePosterTypography(ctx, config, maxWidth, isTallStory, scales[scales.length - 1]);
  for (const s of scales) {
    const measured = measurePosterTypography(ctx, config, maxWidth, isTallStory, s);
    best = measured;
    if (measured.totalHeight <= maxAllowedHeight) {
      return measured;
    }
  }
  return best;
}

function paintTypographyStack(params: {
  ctx: CanvasRenderingContext2D;
  config: PosterRenderConfig;
  layout: MeasuredPosterTypography;
  centerX: number;
  startY: number;
  contentWidth: number;
  isDarkSurface: boolean;
}) {
  const { ctx, config, layout, centerX, startY, contentWidth, isDarkSurface } = params;
  const accent = isDarkSurface ? '#E6C66A' : config.cardAccentColor || '#5A5A40';
  const gold = isDarkSurface ? '#E6C66A' : '#B58D2E';
  const titleColor = isDarkSurface ? '#F0D37A' : config.cardAccentColor || '#5A5A40';
  const bodyColor = isDarkSurface ? 'rgba(255, 255, 255, 0.95)' : '#25221D';
  const verseColor = isDarkSurface ? '#FFFFFF' : '#171511';
  const mutedColor = isDarkSurface ? 'rgba(255, 255, 255, 0.74)' : 'rgba(55, 50, 42, 0.68)';

  let y = startY;

  ctx.save();
  ctx.direction = 'rtl';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  if (isDarkSurface) {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 2;
  }

  // 1. Topic Title
  if (layout.topicLines.length > 0) {
    ctx.font = `700 ${layout.titlePx}px ${config.fontFamilyCss}`;
    ctx.fillStyle = titleColor;
    for (const line of layout.topicLines) {
      y += layout.titlePx * 0.7;
      ctx.fillText(line, centerX, y);
      y += layout.titlePx * 0.72;
    }
    y += 6;
    drawOrnamentalDivider(
      ctx,
      centerX,
      y,
      Math.min(240, contentWidth * 0.34),
      isDarkSurface ? 'rgba(230, 198, 106, 0.72)' : 'rgba(181, 141, 46, 0.55)'
    );
    y += 22;
  }

  // 2. Reflection Body
  if (layout.bodyLines.length > 0) {
    ctx.font = `500 ${layout.bodyPx}px ${config.fontFamilyCss}`;
    ctx.fillStyle = bodyColor;
    for (const line of layout.bodyLines) {
      y += layout.bodyPx * 0.82;
      ctx.fillText(line, centerX, y);
      y += layout.bodyPx * 0.84;
    }
    y += 20;
  }

  // 3. Quranic Verse Medallion Card
  if (layout.verseLines.length > 0) {
    const boxW = contentWidth;
    const boxX = centerX - boxW / 2;
    const boxH = layout.verseBlockHeight;

    ctx.save();
    ctx.shadowBlur = 0;
    drawRoundedRect(ctx, boxX, y, boxW, boxH, 24);
    ctx.fillStyle = isDarkSurface ? 'rgba(212, 175, 55, 0.08)' : 'rgba(181, 141, 46, 0.075)';
    ctx.fill();
    ctx.strokeStyle = isDarkSurface ? 'rgba(230, 198, 106, 0.34)' : 'rgba(181, 141, 46, 0.32)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    let vy = y + 22;
    if (layout.hasPrefix) {
      ctx.font = `700 ${layout.prefixPx}px ${config.fontFamilyCss}`;
      ctx.fillStyle = accent;
      vy += layout.prefixPx * 0.72;
      ctx.fillText(config.post.versePrefix || 'قال تعالى:', centerX, vy);
      vy += layout.prefixPx * 0.82 + 6;
    }

    ctx.font = `700 ${layout.versePx}px ${config.fontFamilyCss}`;
    ctx.fillStyle = verseColor;
    for (const line of layout.verseLines) {
      vy += layout.versePx * 0.8;
      ctx.fillText(line, centerX, vy);
      vy += layout.versePx * 0.84;
    }

    if (layout.refText) {
      ctx.font = `600 ${layout.refPx}px ${config.fontFamilyCss}`;
      ctx.fillStyle = mutedColor;
      vy += 8 + layout.refPx * 0.72;
      ctx.fillText(layout.refText, centerX, vy);
    }

    y += boxH + 22;
  }

  // 4. Supporting Citation (Hadith / Two-Hemistich Poetry / Islamic Wisdom)
  const citation = config.showSupportingCitation ? config.activeCitation : null;
  if (citation && layout.citationLines.length > 0) {
    drawOrnamentalDivider(
      ctx,
      centerX,
      y,
      Math.min(280, contentWidth * 0.4),
      isDarkSurface ? 'rgba(230, 198, 106, 0.55)' : 'rgba(181, 141, 46, 0.45)'
    );
    y += 24;

    const headerLabel = citation.prefix ? `${citation.label}  ·  ${citation.prefix}` : citation.label;
    ctx.font = `700 ${layout.citLabelPx}px ${config.fontFamilyCss}`;
    ctx.fillStyle = gold;
    y += layout.citLabelPx * 0.72;
    ctx.fillText(headerLabel, centerX, y);
    y += layout.citLabelPx * 0.78 + 8;

    ctx.font = `600 ${layout.citBodyPx}px ${config.fontFamilyCss}`;
    ctx.fillStyle = isDarkSurface ? 'rgba(255, 255, 255, 0.94)' : '#231F1A';
    for (const line of layout.citationLines) {
      y += layout.citBodyPx * 0.8;
      ctx.fillText(line, centerX, y);
      y += layout.citBodyPx * 0.82;
    }

    if (citation.source) {
      ctx.font = `600 ${layout.citSourcePx}px ${config.fontFamilyCss}`;
      ctx.fillStyle = mutedColor;
      y += 8 + layout.citSourcePx * 0.7;
      ctx.fillText(citation.source, centerX, y);
    }
  }

  ctx.restore();
}

export async function renderVerticalSocialPosterCanvas(
  config: PosterRenderConfig
): Promise<HTMLCanvasElement> {
  const spec = getPosterFormatSpec(config.format);
  const { width, height } = spec;
  const isTallStory = height / width > 1.5;

  await ensurePosterFontsReady(config.fontFamily);
  const imageEl = await loadPosterImage(config.imageUrl);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  ctx.direction = 'rtl';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const headerTag =
    config.post.category && config.post.category !== 'موضوع تلقائي'
      ? config.post.category
      : config.post.surahName
      ? `سورة ${config.post.surahName}`
      : 'إشراقة إيمانية';

  const footerText = config.pageSignature.trim() || 'نور · خواطر وبطاقات إيمانية';

  if (config.style === 'cinema-vertical') {
    // Full-bleed vertical artwork with luxury dark frosted editorial card
    drawImageCoverRect(ctx, imageEl, 0, 0, width, height);

    const scrim = ctx.createLinearGradient(0, 0, 0, height);
    scrim.addColorStop(0, 'rgba(8, 10, 14, 0.45)');
    scrim.addColorStop(0.28, 'rgba(8, 10, 14, 0.16)');
    scrim.addColorStop(0.58, 'rgba(8, 10, 14, 0.56)');
    scrim.addColorStop(1, 'rgba(8, 10, 14, 0.86)');
    ctx.fillStyle = scrim;
    ctx.fillRect(0, 0, width, height);

    // Double antique-gold frame & Islamic corner filigree
    const inset = 34;
    drawRoundedRect(ctx, inset, inset, width - inset * 2, height - inset * 2, 34);
    ctx.strokeStyle = 'rgba(218, 182, 74, 0.72)';
    ctx.lineWidth = 3;
    ctx.stroke();

    drawRoundedRect(ctx, inset + 12, inset + 12, width - (inset + 12) * 2, height - (inset + 12) * 2, 26);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    drawIslamicCornerFiligree(ctx, inset + 20, inset + 20, width - (inset + 20) * 2, height - (inset + 20) * 2, 'rgba(230, 198, 106, 0.76)');

    // Top calligraphic category header (no pill bloat — clean diamond ornament)
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.75)';
    ctx.shadowBlur = 10;
    ctx.font = `700 ${isTallStory ? 28 : 25}px ${config.fontFamilyCss}`;
    ctx.fillStyle = '#F0D37A';
    ctx.fillText(`✦   ${headerTag}   ✦`, width / 2, inset + (isTallStory ? 72 : 56));
    ctx.restore();

    // Frosted dark glass editorial panel anchored gracefully in lower 66%-74%
    const panelMarginX = 76;
    const panelW = width - panelMarginX * 2;
    const textW = panelW - 92;
    const maxPanelH = height * (isTallStory ? 0.67 : 0.74);

    const layout = fitPosterTypography(ctx, config, textW, maxPanelH - 110, isTallStory);
    const panelPadY = isTallStory ? 54 : 42;
    const panelH = Math.min(maxPanelH, layout.totalHeight + panelPadY * 2);
    const bottomFooterSafe = isTallStory ? 116 : 92;
    const panelY = Math.max(inset + 115, height - bottomFooterSafe - panelH);

    ctx.save();
    drawRoundedRect(ctx, panelMarginX, panelY, panelW, panelH, 32);
    const alpha = Math.max(0.56, Math.min(0.84, (config.overlayOpacity ?? 0.45) + 0.24));
    ctx.fillStyle = `rgba(9, 11, 15, ${alpha.toFixed(2)})`;
    ctx.fill();
    ctx.strokeStyle = 'rgba(230, 198, 106, 0.46)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    const startY = panelY + (panelH - layout.totalHeight) / 2;
    paintTypographyStack({
      ctx,
      config,
      layout,
      centerX: width / 2,
      startY,
      contentWidth: textW,
      isDarkSurface: true,
    });

    // Footer signature
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 8;
    ctx.font = `700 24px ${config.fontFamilyCss}`;
    ctx.fillStyle = 'rgba(240, 211, 122, 0.92)';
    ctx.fillText(footerText, width / 2, height - inset - (isTallStory ? 44 : 34));
    ctx.restore();
    return canvas;
  }

  if (config.style === 'manuscript-parchment') {
    // Illuminated warm ivory parchment manuscript with Islamic arched artwork window
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#FBF8F0');
    bgGrad.addColorStop(0.5, '#F5EFE1');
    bgGrad.addColorStop(1, '#EFE6D2');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Subtle geometric 8-point rosette watermark in lower center
    drawSubtleEightPointStarWatermark(
      ctx,
      width / 2,
      height * 0.65,
      isTallStory ? 260 : 210,
      'rgba(181, 141, 46, 0.08)'
    );

    // Double golden manuscript border
    const inset = 34;
    drawRoundedRect(ctx, inset, inset, width - inset * 2, height - inset * 2, 28);
    ctx.strokeStyle = 'rgba(181, 141, 46, 0.72)';
    ctx.lineWidth = 3.2;
    ctx.stroke();

    drawRoundedRect(ctx, inset + 12, inset + 12, width - (inset + 12) * 2, height - (inset + 12) * 2, 22);
    ctx.strokeStyle = 'rgba(90, 90, 64, 0.25)';
    ctx.lineWidth = 1.4;
    ctx.stroke();

    drawIslamicCornerFiligree(ctx, inset + 22, inset + 22, width - (inset + 22) * 2, height - (inset + 22) * 2, 'rgba(181, 141, 46, 0.72)');

    // Top Header Ornament
    ctx.font = `700 ${isTallStory ? 27 : 24}px ${config.fontFamilyCss}`;
    ctx.fillStyle = config.cardAccentColor || '#5A5A40';
    ctx.fillText(`✦   ${headerTag}   ✦`, width / 2, inset + (isTallStory ? 68 : 54));

    // Arched Sacred Artwork Window at Top
    const artW = width - 196;
    const artH = Math.round(height * (isTallStory ? 0.27 : 0.25));
    const artX = (width - artW) / 2;
    const artY = inset + (isTallStory ? 106 : 86);
    const archR = artW / 2;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(artX, artY + artH);
    ctx.lineTo(artX, artY + Math.min(archR * 0.42, artH * 0.46));
    ctx.quadraticCurveTo(artX, artY, width / 2, artY);
    ctx.quadraticCurveTo(artX + artW, artY, artX + artW, artY + Math.min(archR * 0.42, artH * 0.46));
    ctx.lineTo(artX + artW, artY + artH);
    ctx.closePath();
    ctx.save();
    ctx.clip();
    drawImageCoverRect(ctx, imageEl, artX, artY, artW, artH);
    ctx.restore();

    ctx.strokeStyle = 'rgba(181, 141, 46, 0.78)';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();

    // Typography stack below the arched window
    const textAreaTop = artY + artH + (isTallStory ? 44 : 30);
    const textAreaBottom = height - inset - (isTallStory ? 96 : 82);
    const availableH = Math.max(360, textAreaBottom - textAreaTop);
    const textW = width - 176;

    const layout = fitPosterTypography(ctx, config, textW, availableH, isTallStory);
    const startY = textAreaTop + Math.max(0, (availableH - layout.totalHeight) / 2);

    paintTypographyStack({
      ctx,
      config,
      layout,
      centerX: width / 2,
      startY,
      contentWidth: textW,
      isDarkSurface: false,
    });

    // Footer signature
    ctx.font = `700 24px ${config.fontFamilyCss}`;
    ctx.fillStyle = config.cardAccentColor || '#5A5A40';
    ctx.fillText(footerText, width / 2, height - inset - (isTallStory ? 46 : 36));
    return canvas;
  }

  // Default: 'royal-editorial' (Top artwork showcase + seamless ivory luxury editorial card)
  const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
  bgGrad.addColorStop(0, '#FCFBF8');
  bgGrad.addColorStop(1, '#F6F1E6');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  const artHeight = Math.round(height * (isTallStory ? 0.36 : 0.33));
  ctx.save();
  drawImageCoverRect(ctx, imageEl, 0, 0, width, artHeight);

  // Elegant bottom vignette blending into golden accent seam
  const topScrim = ctx.createLinearGradient(0, 0, 0, artHeight);
  topScrim.addColorStop(0, 'rgba(8, 10, 14, 0.42)');
  topScrim.addColorStop(0.5, 'rgba(8, 10, 14, 0.08)');
  topScrim.addColorStop(1, 'rgba(8, 10, 14, 0.52)');
  ctx.fillStyle = topScrim;
  ctx.fillRect(0, 0, width, artHeight);
  ctx.restore();

  // Golden seam divider with central diamond clasp
  ctx.fillStyle = '#D4AF37';
  ctx.fillRect(0, artHeight - 3, width, 5);

  // Subtle geometric rosette watermark on ivory editorial half
  drawSubtleEightPointStarWatermark(
    ctx,
    width / 2,
    artHeight + (height - artHeight) * 0.5,
    isTallStory ? 240 : 195,
    'rgba(181, 141, 46, 0.065)'
  );

  // Outer dignified editorial border
  const inset = 28;
  drawRoundedRect(ctx, inset, inset, width - inset * 2, height - inset * 2, 28);
  ctx.strokeStyle =
    config.cardFrameStyle === 'gold-border'
      ? 'rgba(212, 175, 55, 0.85)'
      : 'rgba(181, 141, 46, 0.52)';
  ctx.lineWidth = config.cardFrameStyle === 'gold-border' ? 3.5 : 2;
  ctx.stroke();

  // Lower corner ornaments on ivory card
  drawIslamicCornerFiligree(
    ctx,
    inset + 18,
    artHeight + 24,
    width - (inset + 18) * 2,
    height - artHeight - inset - 44,
    'rgba(181, 141, 46, 0.55)'
  );

  // Top subtle category/surah heading over the artwork sky
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.72)';
  ctx.shadowBlur = 10;
  ctx.font = `700 ${isTallStory ? 28 : 25}px ${config.fontFamilyCss}`;
  ctx.fillStyle = '#F2D77E';
  ctx.fillText(`✦   ${headerTag}   ✦`, width / 2, inset + (isTallStory ? 58 : 48));
  ctx.restore();

  // Center golden diamond medallion resting on the seam
  ctx.save();
  ctx.fillStyle = '#FAF6EC';
  ctx.strokeStyle = '#D4AF37';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(width / 2, artHeight - 20);
  ctx.lineTo(width / 2 + 20, artHeight);
  ctx.lineTo(width / 2, artHeight + 20);
  ctx.lineTo(width / 2 - 20, artHeight);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#D4AF37';
  ctx.beginPath();
  ctx.arc(width / 2, artHeight, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Typography Stack inside the ivory editorial section
  const textAreaTop = artHeight + (isTallStory ? 54 : 38);
  const textAreaBottom = height - inset - (isTallStory ? 96 : 80);
  const availableH = Math.max(360, textAreaBottom - textAreaTop);
  const textW = width - 160;

  const layout = fitPosterTypography(ctx, config, textW, availableH, isTallStory);
  const startY = textAreaTop + Math.max(0, (availableH - layout.totalHeight) / 2);

  paintTypographyStack({
    ctx,
    config,
    layout,
    centerX: width / 2,
    startY,
    contentWidth: textW,
    isDarkSurface: false,
  });

  // Footer signature
  ctx.font = `700 24px ${config.fontFamilyCss}`;
  ctx.fillStyle = config.cardAccentColor || '#5A5A40';
  ctx.fillText(footerText, width / 2, height - inset - (isTallStory ? 46 : 36));

  return canvas;
}

export async function exportVerticalPosterBlob(config: PosterRenderConfig): Promise<Blob> {
  const canvas = await renderVerticalSocialPosterCanvas(config);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png', 1));
  if (!blob) {
    throw new Error('تعذر توليد ملف الصورة عالية الدقة.');
  }
  return blob;
}
