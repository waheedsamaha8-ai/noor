export type CitationType = 'quran' | 'hadith' | 'poetry' | 'wisdom';

export interface SupportingCitation {
  type: CitationType;
  label: string;
  prefix?: string;
  text: string;
  source?: string;
}

export const CITATION_TYPE_LABELS: Record<CitationType, string> = {
  quran: 'آية قرآنية',
  hadith: 'حديث نبوي شريف',
  poetry: 'أبيات شعر',
  wisdom: 'حكمة وأثر مأثور',
};

/**
 * Formats a supporting citation into natural, pause-balanced Arabic narration
 * so TTS reads Hadiths, two-hemistich poetry, and wisdom gracefully alongside the main reflection.
 */
export function formatCitationForSpeech(citation: SupportingCitation): string {
  const cleanText = citation.text
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '')
    .trim();
  if (!cleanText) return '';

  const prefix = citation.prefix?.trim() || '';
  const source = citation.source?.trim() || '';

  if (citation.type === 'poetry') {
    const hemistichs = cleanText
      .split(/\s*\/\s*/)
      .map((part) => part.trim())
      .filter(Boolean);
    const spokenVerse = hemistichs.join('، ');
    const intro = prefix
      ? prefix
      : source
      ? `وكما قال ${source}:`
      : 'وكما قال الشاعر:';
    return `${intro} ${spokenVerse}.`.replace(/\s+/g, ' ').trim();
  }

  if (citation.type === 'hadith') {
    const intro = prefix || 'وفي الحديث الشريف:';
    const tail = source ? ` ${source}.` : '.';
    return `${intro} ${cleanText}${tail}`.replace(/\s+/g, ' ').trim();
  }

  if (citation.type === 'quran') {
    const intro = prefix || 'قال تعالى:';
    return `${intro} ${cleanText}.`.replace(/\s+/g, ' ').trim();
  }

  // wisdom
  const intro = prefix || (source ? `ويقول ${source}:` : 'ومن روائع الحكم:');
  const tail = !prefix && source ? '.' : source ? `، ${source}.` : '.';
  return `${intro} ${cleanText}${tail}`.replace(/\s+/g, ' ').trim();
}

export function buildReflectionWithCitationSpeech(
  reflectionText: string,
  citation?: SupportingCitation | null,
  includeCitation = true
): string {
  const main = reflectionText.trim();
  if (!includeCitation || !citation) return main;
  const spokenCitation = formatCitationForSpeech(citation);
  if (!spokenCitation) return main;
  if (!main) return spokenCitation;
  const sep = /[.!؟؛]$/.test(main) ? ' ' : '. ';
  return `${main}${sep}${spokenCitation}`;
}

export interface CategoryEditorialProfile {
  id: string;
  narrationStyleName: string;
  narrationSummary: string;
  narrationBlueprint: string;
  citationFocusSummary: string;
  preferredCitations: CitationType[];
  topicPromptGuidance: string;
}

export const CATEGORY_EDITORIAL_PROFILES: Record<string, CategoryEditorialProfile> = {
  "موضوع تلقائي": {
    id: "موضوع تلقائي",
    narrationStyleName: "سرد إيماني وجداني متكامل",
    narrationSummary: "يفتتح بومضة وجدانية تلامس القلب، ثم يتدرج بتأمل عميق وصورة بلاغية حيّة، ويختم ببشارة ويقين.",
    narrationBlueprint:
      "اكتب بأسلوب وجداني بليغ يجمع بين حرارة الشعور وصفاء الفكرة: افتتح بجملة آسرة تلتقط لحظة إنسانية حقيقية، ثم قدّم زاوية تدبّرية مبتكرة بصورة أدبية حية، واختم بومضة يقين تبقى في الذاكرة.",
    citationFocusSummary: "آية قرآنية · حديث نبوي · بيت شعر · حكمة مأثورة",
    preferredCitations: ['quran', 'hadith', 'poetry', 'wisdom'],
    topicPromptGuidance:
      "عناوين إيمانية متنوعة وعميقة تجمع بين لطائف القرآن، أنوار السيرة، جبر الخواطر، فقه السكينة، والحكمة البليغة.",
  },
  "خواطر قرآنية": {
    id: "خواطر قرآنية",
    narrationStyleName: "سرد تدبّري غائص في أسرار الآية",
    narrationSummary: "يقف عند لفظة أو لفتة قرآنية دقيقة، يكشف جمالها البلاغي والنفسي ويربطها بحياة القارئ اليومية.",
    narrationBlueprint:
      "ابدأ بالوقوف المتأمل عند سرّ لفظة أو صورة في الآية القرآنية (مثلاً: لماذا قال الله كذا ولم يقل كذا؟)، ثم اكشف أثر هذا المعنى في طمأنة القلب وترميم الروح، واختم بدعوة هادئة للعيش بظل هذه الآية.",
    citationFocusSummary: "آية قرآنية محورية · حديث نبوي شارح · حكمة لأهل التدبر · بيت شعر",
    preferredCitations: ['quran', 'hadith', 'wisdom', 'poetry'],
    topicPromptGuidance:
      "عناوين تدبّرية تستوقف القارئ عند آية قرآنية محددة أو لفتة بيانية مدهشة في القرآن الكريم.",
  },
  "السكينة وجبر الخواطر": {
    id: "السكينة وجبر الخواطر",
    narrationStyleName: "سرد حانٍ دافئ يربّت على القلوب",
    narrationSummary: "يخاطب القلب المتعب بلغة إنسانية رفيقة تحوّل الانكسار إلى أمان ويقين بلطف الله الخفي.",
    narrationBlueprint:
      "تحدّث بنبرة رفيقة قريبة كأنك تخاطب إنساناً مثقلاً بالهم في لحظة صدق: اعترف بثقل اللحظة دون تهوين، ثم افتح له نافذة الأمل بلطف الله وجبره الذي يتجاوز التوقعات، واختم بمسحة أمان تريح الصدر.",
    citationFocusSummary: "آية السكينة · حديث جبر الخواطر · بيت شعر شفيف · حكمة دافئة",
    preferredCitations: ['quran', 'hadith', 'poetry', 'wisdom'],
    topicPromptGuidance:
      "عناوين حانية حول جبر الخواطر، طمأنينة القلب، اللطف الخفي، وترميم الأرواح المتعبة بالإيمان.",
  },
  "الأدعية والمناجاة": {
    id: "الأدعية والمناجاة",
    narrationStyleName: "سرد مناجاتي خاشع بأسلوب الهمس الروحي",
    narrationSummary: "يمزج بين أدب الوقوف بين يدي الله وجمال الافتقار والرجاء مع صياغة دعاء وجداني مؤثر.",
    narrationBlueprint:
      "اكتب بروح الخلوة والمناجاة الصادقة: ابدأ بوصف جمال اللجوء إلى الله حين تضيق الأسباب، ثم كاشف الروح بأسرار الدعاء واليقين بالإجابة، واختم بدعاء عذب بليغ يردده القارئ بقلبه.",
    citationFocusSummary: "آية دعاء قرآني · دعاء نبوي مأثور · بيت مناجاة شعري · قول مأثور",
    preferredCitations: ['quran', 'hadith', 'poetry', 'wisdom'],
    topicPromptGuidance:
      "عناوين خاشعة عن أسرار المناجاة، أدعية الأنبياء، ساعات الإجابة، وجمال الافتقار إلى الله.",
  },
  "مواسم الخير ورمضان": {
    id: "مواسم الخير ورمضان",
    narrationStyleName: "سرد احتفائي روحاني يستشعر نفحات الزمان",
    narrationSummary: "يرسم أجواء المواسم المباركة (رمضان، عرفة، الجمعة، العيد) بحسّ بصري وروحاني يشعل الشوق للطاعة.",
    narrationBlueprint:
      "ارسم المشهد الزماني بوضوح (نسيم السحر، سكون الفجر، غروب عرفة، فرحة العيد) وكأن القارئ يعيشه الآن، ثم أبرز فرصة الموسم في تجديد القلب ورفع الهمة، واختم بدعوة صادقة لاغتنام النفحات.",
    citationFocusSummary: "آية عن الموسم · حديث في فضله · بيت شعر روحاني · حكمة عن اغتنام الأوقات",
    preferredCitations: ['quran', 'hadith', 'poetry', 'wisdom'],
    topicPromptGuidance:
      "عناوين شاعرية عن رمضان، ليلة القدر، عشر ذي الحجة، يوم عرفة، يوم الجمعة، وليالي القيام.",
  },
  "أحاديث نبوية": {
    id: "أحاديث نبوية",
    narrationStyleName: "سرد نبوي بياني يكشف جوامع الكلم",
    narrationSummary: "يشرح اللمسة التربوية والإنسانية في الحديث الشريف بأسلوب عصري قريب يكشف عمق الهدي النبوي.",
    narrationBlueprint:
      "استهلّ بمشهد من واقعنا اليومي يحتاج إلى هذا التوجيه النبوي، ثم أبرِز بلاغة جوامع الكلم في الحديث الشريف ولطافته النفسية والاجتماعية، واختم بتطبيق عملي بسيط يحيي به القارئ هذه السنة اليوم.",
    citationFocusSummary: "حديث نبوي صحيح · آية قرآنية مؤيدة · حكمة من شروح العلماء · بيت شعر",
    preferredCitations: ['hadith', 'quran', 'wisdom', 'poetry'],
    topicPromptGuidance:
      "عناوين تبرز جماليات الأحاديث النبوية الصحيحة وأثرها العميق في النفس والعلاقات والحياة.",
  },
  "سيرة نبوية": {
    id: "سيرة نبوية",
    narrationStyleName: "سرد سِيَري حيّ يقرّب صورة الحبيب ﷺ",
    narrationSummary: "ينقل موقفاً نبوياً بتفاصيله الإنسانية الراقية (الرحمة، الوفاء، التواضع، الحكمة) وكأنك تشاهده.",
    narrationBlueprint:
      "انقل القارئ مباشرة إلى قلب الموقف النبوي بتفاصيله الهادئة (المكان، الكلمة، النظرة، الرفق)، ثم تأمّل كيف تتجلى فيه رحمة النبوة وسمو الخلق، واختم بصلة حية تربط الموقف بحياتنا المعاصرة.",
    citationFocusSummary: "آية في الثناء النبوي · رواية أو حديث من السيرة · بيت شعر في مدح النبي ﷺ · حكمة",
    preferredCitations: ['quran', 'hadith', 'poetry', 'wisdom'],
    topicPromptGuidance:
      "عناوين مواقف إنسانية وتربوية مؤثرة من حياة النبي ﷺ مع أهله وصحابته والأطفال والناس.",
  },
  "قصص قرآنية ونبوية": {
    id: "قصص قرآنية ونبوية",
    narrationStyleName: "سرد قصصي درامي يبني ذروة المشهد والعبرة",
    narrationSummary: "يصوغ القصة بإيقاع مشهدي متصاعد: لحظة الاختبار، نقطة التحول باليقين، والدرس الخالد.",
    narrationBlueprint:
      "ابدأ مباشرة من ذروة المشهد القصصي (أمام البحر، في ظلمة الجُبّ، عند اشتداد البلاء) لتشدّ انتباه القارئ، ثم صوّر لحظة التحول الإيماني حين انتصر اليقين على الأسباب، واختم بالقاعدة الربانية الخالدة التي تخرج بها من القصة.",
    citationFocusSummary: "آية القصة القرآنية · حديث نبوي ذو صلة · بيت شعر بليغ · عبرة وحكمة",
    preferredCitations: ['quran', 'hadith', 'poetry', 'wisdom'],
    topicPromptGuidance:
      "عناوين قصصية مشوقة من قصص الأنبياء والصالحين في القرآن والسنة بزاوية تدبرية حية.",
  },
  "أخلاق الإسلام": {
    id: "أخلاق الإسلام",
    narrationStyleName: "سرد قِيَمي راقٍ يبرز جمال الخلق وأثره",
    narrationSummary: "يقارن بين قسوة التسرّع وجمال الخلق الإسلامي (الستر، الرفق، الإحسان، العفو) بأمثلة ملموسة.",
    narrationBlueprint:
      "افتتح بمفارقة إنسانية تبرز قيمة الخلق في زمننا، ثم أظهر كيف يرفع هذا الخلق صاحبه ويجمّل الحياة حوله دون تكلّف، واختم بمعيار عملي راقٍ يرسّخ الخلق في السلوك اليومي.",
    citationFocusSummary: "آية أخلاقية · حديث نبوي في الفضيلة · بيت شعر في مكارم الأخلاق · حكمة عربية/إسلامية",
    preferredCitations: ['quran', 'hadith', 'poetry', 'wisdom'],
    topicPromptGuidance:
      "عناوين عميقة عن الستر، الرفق، العفو، الأمانة، الكلمة الطيبة، والإحسان الخفي.",
  },
  "بر الوالدين والأسرة": {
    id: "بر الوالدين والأسرة",
    narrationStyleName: "سرد أسري عاطفي صادق يلامس الحنين والوفاء",
    narrationSummary: "يستحضر تفاصيل الأم والأب ودفء البيت المسلم بلغة شاعرية تبعث على الشكر والمبادرة بالبر.",
    narrationBlueprint:
      "ابدأ بصورة يومية دافئة نكاد نغفل عن قيمتها (دعاء أمٍ في الفجر، تعب أبٍ صامت، مودة البيت)، ثم بيّن مكانة البر والرحمة الأسرية كأوسع أبواب البركة، واختم بنداء حنون للمبادرة اليوم قبل فوات الأوان.",
    citationFocusSummary: "آية البر والمودة · حديث نبوي عن الوالدين/الأهل · بيت شعر مؤثر · حكمة عن العائلة",
    preferredCitations: ['quran', 'hadith', 'poetry', 'wisdom'],
    topicPromptGuidance:
      "عناوين مؤثرة عن بر الأم والأب، دفء البيوت الإيمانية، صلة الرحم، والرحمة بين الأهل.",
  },
  "تطوير الذات الإيماني": {
    id: "تطوير الذات الإيماني",
    narrationStyleName: "سرد عملي ملهم يمزج الهمة بالتوكل",
    narrationSummary: "يربط بين بناء النفس وإدارة القلق والانضباط اليومي وبين معاني التوكل والإخلاص والاستعانة بالله.",
    narrationBlueprint:
      "افتتح بتحدٍّ نفسي أو حياتي حقيقي (القلق، التشتت، الفتور، الخوف من المستقبل)، ثم قدّم تحوّلاً ذهنياً وإيمانياً واضحاً يجمع بين السعي الجاد والتفويض الصادق، واختم بقاعدة عملية قصيرة تقود للتغيير.",
    citationFocusSummary: "آية في السعي والتوكل · حديث في الهمة والاستعانة · حكمة عملية · بيت شعر محفّز",
    preferredCitations: ['quran', 'hadith', 'wisdom', 'poetry'],
    topicPromptGuidance:
      "عناوين عملية ملهمة تجمع بين التزكية وبناء الصلابة النفسية والإنجاز بروح التوكل.",
  },
  "فضائل الأعمال": {
    id: "فضائل الأعمال",
    narrationStyleName: "سرد ترغيبي مشوّق يكشف عظمة الأعمال اليسيرة",
    narrationSummary: "يبرز كيف تصنع العبادات اليومية الهادئة (الفجر، الصدقة الخفية، الذكر، الضحى) أثراً هائلاً في الميزان.",
    narrationBlueprint:
      "ابدأ بتصوير المفارقة بين يسر العمل في الدنيا وعظم ثوابه وأثره في البركة والرزق، ثم بيّن سرّ هذا العمل في تزكية القلب، واختم بتحفيز رقيق يدفع القارئ للبدء به فوراً.",
    citationFocusSummary: "آية في المسارعة للخير · حديث نبوي في الأجر · حكمة من السلف · بيت شعر",
    preferredCitations: ['hadith', 'quran', 'wisdom', 'poetry'],
    topicPromptGuidance:
      "عناوين مشوّقة حول صلاة الفجر، الصدقة الخفية، الصلاة على النبي، سورة الكهف، وقيام الليل.",
  },
  "تربية إيمانية": {
    id: "تربية إيمانية",
    narrationStyleName: "سرد تربوي حكيم يغرس المعنى بالقدوة والبصيرة",
    narrationSummary: "يقدّم بصيرة تربوية هادئة في تزكية النفس وتربية الأبناء ومراقبة القلب بعيداً عن التنظير الجاف.",
    narrationBlueprint:
      "ابدأ بملاحظة تربوية دقيقة تمسّ بناء النفس أو تربية الجيل، ثم ارسم الطريق الهادئ لتزكية القلب بالقدوة والرفق والمحاسبة الصادقة، واختم بوصية تربوية مركّزة قابلة للتطبيق.",
    citationFocusSummary: "آية في التزكية والتربية · حديث نبوي تربوي · حكمة لأئمة التربية · بيت شعر حكيم",
    preferredCitations: ['quran', 'hadith', 'wisdom', 'poetry'],
    topicPromptGuidance:
      "عناوين تربوية عن سلامة القلب، القدوة الحسنة، غرس محبة القرآن، والصحبة الصالحة.",
  },
  "القدس والمسجد الأقصى": {
    id: "القدس والمسجد الأقصى",
    narrationStyleName: "سرد وجداني تاريخي يجمع بين القداسة والوفاء",
    narrationSummary: "يستحضر مكانة أولى القبلتين ومسرى النبي ﷺ بروح عزيزة شاعرية تربط القلب ببركة الأرض والسماء.",
    narrationBlueprint:
      "ابدأ بصورة مهيبة لمآذن القدس وأغصان زيتونها وارتباطها بليلة الإسراء، ثم أبرز مكانتها العقائدية والتاريخية في وجدان الأمة، واختم بعهد وفاء ودعاء صادق بالبركة والسكينة.",
    citationFocusSummary: "آية الإسراء والبركة · حديث في فضل المسجد الأقصى · بيت شعر عن القدس · مقولة تاريخية",
    preferredCitations: ['quran', 'hadith', 'poetry', 'wisdom'],
    topicPromptGuidance:
      "عناوين راقية عن مكانة المسجد الأقصى، ليلة الإسراء، بركة القدس، وتاريخها الإيماني.",
  },
  "حكايات من التاريخ الإسلامي": {
    id: "حكايات من التاريخ الإسلامي",
    narrationStyleName: "سرد تاريخي سينمائي يستحضر المشهد والحدث",
    narrationSummary: "يروي موقفاً تاريخياً موثوقاً بعناصر الزمان والمكان والحوار الحي، ثم يستخلص منه درساً حضارياً ملهماً.",
    narrationBlueprint:
      "ابدأ برسم المشهد التاريخي مباشرة (المدينة، الزمن، تفاصيل الموقف والحوار المختصر الموثوق)، ثم اكشف القيمة الحضارية أو الأخلاقية التي صنعت روعة الحدث، واختم بعبرة حيّة تضيء حاضرنا.",
    citationFocusSummary: "آية قرآنية تؤصل القيمة · حديث نبوي مساند · مقولة تاريخية مأثورة · بيت شعر عربي",
    preferredCitations: ['quran', 'wisdom', 'hadith', 'poetry'],
    topicPromptGuidance:
      "عناوين حكايات تاريخية موثوقة ومُلهمة عن العدل والأمانة والعلم والتكافل في الحضارة الإسلامية.",
  },
  "بطولات إسلامية": {
    id: "بطولات إسلامية",
    narrationStyleName: "سرد ملحمي عزيز يبرز الثبات والشجاعة والإيمان",
    narrationSummary: "يصوّر مواقف الثبات ونبل الفروسية الإسلامية بإيقاع جزل قوي يجمع بين الشجاعة والرحمة واليقين.",
    narrationBlueprint:
      "اكتب بلغة عربية جزلة مهيبة: افتتح بلحظة التحدي الفارقة التي اختُبر فيها الثبات، ثم صوّر كيف انتصر الإيمان والعزة ونُبل المبدأ على الخوف والعدد، واختم بحكمة خالدة عن الشجاعة الحقيقية.",
    citationFocusSummary: "آية في الثبات والنصر · حديث في الشجاعة والقوة · بيت شعر حماسي أصيل · قول قائد/بطل",
    preferredCitations: ['quran', 'poetry', 'hadith', 'wisdom'],
    topicPromptGuidance:
      "عناوين بطولات ومواقف ثبات ونبل تاريخية للصحابة والقادة والنساء المسلمات عبر التاريخ.",
  },
  "شخصيات إسلامية": {
    id: "شخصيات إسلامية",
    narrationStyleName: "سرد بورتريه أدبي يكشف جوهر الشخصية وأثرها",
    narrationSummary: "يرسم ملامح الشخصية عبر موقف واحد كاشف يختصر عظمتها، بدلاً من سرد سيرة جافة بالتواريخ.",
    narrationBlueprint:
      "لا تكتب سيرة ذاتية جافة! افتتح بسمة فارقة أو موقف واحد كاشف يختصر روح الشخصية، ثم أظهر كيف صاغ الإيمان والعلم والورع أثرها الخالد، واختم بما يمكن أن نستلهمه منها اليوم.",
    citationFocusSummary: "آية تصف أهل الفضل · حديث أو أثر عن الشخصية · مقولة خالدة لها · بيت شعر",
    preferredCitations: ['quran', 'wisdom', 'hadith', 'poetry'],
    topicPromptGuidance:
      "عناوين لشخصيات مؤثرة من الصحابة والتابعيات والعلماء بأسلوب يركز على أبرز ميزة وموقف.",
  },
  "عظماء الإسلام": {
    id: "عظماء الإسلام",
    narrationStyleName: "سرد حضاري مُلهِم يجمع بين العبقرية والإخلاص",
    narrationSummary: "يضيء إنجازات العلماء والمجددين والمفكرين المسلمين وكيف جمعوا بين الإبداع الحضاري وروح العبادة.",
    narrationBlueprint:
      "افتتح بسؤال أو حقيقة مدهشة عن أثر هذا العالم أو المجدّد في الحضارة الإنسانية، ثم اربط بين همّته العلمية وإخلاصه الإيماني، واختم بومضة تُحيي روح الطموح والإتقان في نفس القارئ.",
    citationFocusSummary: "آية في رفعة العلم والعمل · حديث في فضل العلم والإتقان · مقولة مأثورة للعظيم · بيت شعر",
    preferredCitations: ['quran', 'wisdom', 'hadith', 'poetry'],
    topicPromptGuidance:
      "عناوين مُلهمة عن علماء ومبدعي الحضارة الإسلامية (البخاري، ابن الهيثم، فاطمة الفهرية، الشافعي، الخوارزمي).",
  },
  "شعر إسلامي": {
    id: "شعر إسلامي",
    narrationStyleName: "سرد أدبي شاعري يتذوق موسيقى البيت وعمق المعنى",
    narrationSummary: "يستلهم بيتاً أو بيتين من روائع الشعر العربي الإسلامي، يتأمل جمال صورهما ويحولهما إلى خاطرة روحية آسرة.",
    narrationBlueprint:
      "اكتب بلغة شاعرية مصقولة ذات إيقاع عذب: افتتح بالمعنى الوجداني الذي أشعل قصيدة الشاعر (الشافعي، البوصيري، أبو العتاهية، حسان بن ثابت، ابن القيم)، ثم حلّل جمال الصورة ودفء الإيمان فيها، واختم بإشراقة روحية تليق بجمال القصيدة.",
    citationFocusSummary: "أبيات شعر عربية أصيلة (صدر وعجز) · آية قرآنية موافقة للمعنى · حديث نبوي أو حكمة",
    preferredCitations: ['poetry', 'quran', 'wisdom', 'hadith'],
    topicPromptGuidance:
      "عناوين أدبية شاعرية مستلهمة من روائع الشعر الإسلامي والحكمة والزهد والمديح النبوي.",
  },
};

export function getCategoryEditorialProfile(category?: string): CategoryEditorialProfile {
  if (category && CATEGORY_EDITORIAL_PROFILES[category]) {
    return CATEGORY_EDITORIAL_PROFILES[category];
  }
  return CATEGORY_EDITORIAL_PROFILES["موضوع تلقائي"];
}
