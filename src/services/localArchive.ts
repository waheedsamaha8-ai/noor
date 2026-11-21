import { AspectRatio, GeneratedPost } from './geminiService';
import {
  SupportingCitation,
  getCategoryEditorialProfile,
} from '../utils/categoryEditorial';

import heroLanternImg from '../assets/images/noor_hero_lantern_1794700200550.jpg';
import mosqueDawnImg from '../assets/images/noor_mosque_dawn_1794700199262.jpg';
import islamicTasbihImg from '../assets/images/noor_islamic_tasbih_1794700217621.jpg';
import desertCrescentImg from '../assets/images/noor_desert_crescent_1794700202103.jpg';
import kaabaNightImg from '../assets/images/noor_kaaba_night_1795213620534.jpg';
import aqsaGoldenImg from '../assets/images/noor_aqsa_golden_1795213619423.jpg';
import nabawiArchesImg from '../assets/images/noor_nabawi_arches_1795213621523.jpg';
import quranSunlightImg from '../assets/images/noor_quran_sunlight_1795213620580.jpg';
import andalusianArchImg from '../assets/images/noor_andalusian_arch_1795213621958.jpg';
import ramadanCourtyardImg from '../assets/images/noor_ramadan_courtyard_1795213620772.jpg';
import oliveGardenImg from '../assets/images/noor_olive_garden_1795213622214.jpg';
import starryMihrabImg from '../assets/images/noor_starry_mihrab_1795213622211.jpg';
import hiraDawnImg from '../assets/images/noor_hira_dawn_1795261838200.jpg';
import prayerNicheImg from '../assets/images/noor_prayer_niche_1795261835998.jpg';
import rainCourtyardImg from '../assets/images/noor_rain_courtyard_1795261837044.jpg';
import ottomanDomeImg from '../assets/images/noor_ottoman_dome_1795261836955.jpg';
import manuscriptInkImg from '../assets/images/noor_manuscript_ink_1795261840528.jpg';
import seaSunsetDuaImg from '../assets/images/noor_sea_sunset_dua_1795261841562.jpg';
import medinaUmbrellasImg from '../assets/images/noor_medina_umbrellas_1795265905841.jpg';
import makkahMinaretsImg from '../assets/images/noor_makkah_minarets_1795265899235.jpg';
import crescentRamadanNightImg from '../assets/images/noor_crescent_ramadan_night_1795265898360.jpg';
import arafahMercyImg from '../assets/images/noor_arafah_mercy_1795265919438.jpg';
import eidLanternsDawnImg from '../assets/images/noor_eid_lanterns_dawn_1795265908747.jpg';
import moroccanZelligeImg from '../assets/images/noor_moroccan_zellige_1795265914013.jpg';
import astrolabeLibraryImg from '../assets/images/noor_astrolabe_library_1795265898360.jpg';
import calligraphyScrollImg from '../assets/images/noor_calligraphy_scroll_1795265900226.jpg';
import mountainMistFajrImg from '../assets/images/noor_mountain_mist_fajr_1795265899517.jpg';
import palmOasisDuskImg from '../assets/images/noor_palm_oasis_dusk_1795265900692.jpg';
import alAzharCourtyardImg from '../assets/images/noor_al_azhar_courtyard_1795277534264.jpg';
import qubaMosqueDawnImg from '../assets/images/noor_quba_mosque_dawn_1795277579364.jpg';
import roseGardenFountainImg from '../assets/images/noor_rose_garden_fountain_1795277534230.jpg';
import mashrabiyaMorningImg from '../assets/images/noor_mashrabiya_morning_1795277534341.jpg';
import damascusUmayyadImg from '../assets/images/noor_damascus_umayyad_1795277534678.jpg';
import sahabaCaravanStarsImg from '../assets/images/noor_sahaba_caravan_stars_1795277533626.jpg';

// 21 new bespoke photorealistic Islamic scenes
import photoKaabaFajrMistImg from '../assets/images/photo_kaaba_fajr_mist_1795278869508.jpg';
import photoKaabaKiswahGoldImg from '../assets/images/photo_kaaba_kiswah_gold_1795278863586.jpg';
import photoNabawiGreenDomeSunsetImg from '../assets/images/photo_nabawi_green_dome_sunset_1795278862695.jpg';
import photoNabawiLanternArchImg from '../assets/images/photo_nabawi_lantern_arch_1795278867924.jpg';
import photoAqsaBlueTwilightImg from '../assets/images/photo_aqsa_blue_twilight_1795278863232.jpg';
import photoAqsaArchesOliveImg from '../assets/images/photo_aqsa_arches_olive_1795278873837.jpg';
import photoMadinahPalmsSunriseImg from '../assets/images/photo_madinah_palms_sunrise_1795278861919.jpg';
import photoMakkahRainMarbleImg from '../assets/images/photo_makkah_rain_marble_1795278861989.jpg';
import photoQiblatainWhiteMinaretsImg from '../assets/images/photo_qiblatain_white_minarets_1795278871692.jpg';
import photoJerusalemOldLanternArchImg from '../assets/images/photo_jerusalem_old_lantern_arch_1795278862697.jpg';
import photoZamzamBrassVesselImg from '../assets/images/photo_zamzam_brass_vessel_1795278989839.jpg';
import photoQuranRehalCandlelightImg from '../assets/images/photo_quran_rehal_candlelight_1795278870216.jpg';
import photoPrayerBeadsVelvetDawnImg from '../assets/images/photo_prayer_beads_velvet_dawn_1795278861859.jpg';
import photoMosqueSunbeamsCarpetImg from '../assets/images/photo_mosque_sunbeams_carpet_1795278873954.jpg';
import photoOudIncenseLanternImg from '../assets/images/photo_oud_incense_lantern_1795278862818.jpg';
import photoTahajjudWindowMoonImg from '../assets/images/photo_tahajjud_window_moon_1795278872536.jpg';
import photoQuranStainedGlassGlowImg from '../assets/images/photo_quran_stained_glass_glow_1795278873359.jpg';
import photoWoodenMinbarLightImg from '../assets/images/photo_wooden_minbar_light_1795278987889.jpg';
import photoFajrPrayerRugCourtyardImg from '../assets/images/photo_fajr_prayer_rug_courtyard_1795278989780.jpg';
import photoSuhoorLanternTableImg from '../assets/images/photo_suhoor_lantern_table_1795278987638.jpg';
import photoEidCrescentMinaretsImg from '../assets/images/photo_eid_crescent_minarets_1795278988541.jpg';

// 57 verified real-world Islamic landmark, manuscript, and nature photographs
import wikKaabaMasjidHaramImg from '../assets/images/wik_kaaba_masjid_haram.jpg';
import wikNabawiCourtyardUmbrellasImg from '../assets/images/wik_nabawi_courtyard_umbrellas.jpg';
import wikAqsaQibliMosqueImg from '../assets/images/wik_aqsa_qibli_mosque.jpg';
import wikDomeOfRockGoldenImg from '../assets/images/wik_dome_of_rock_golden.jpg';
import wikDomeOfChainJerusalemImg from '../assets/images/wik_dome_of_chain_jerusalem.jpg';
import wikCaveHiraMakkahImg from '../assets/images/wik_cave_hira_makkah.jpg';
import wikDamascusUmayyadCourtyardImg from '../assets/images/wik_ibrahimi_mosque_hebron.jpg';
import wikMountSinaiSunriseImg from '../assets/images/wik_mount_uhud_madinah.jpg';
import wikSheikhZayedSilhouetteImg from '../assets/images/wik_sheikh_zayed_night.jpg';
import wikSheikhZayedArchesImg from '../assets/images/wik_sheikh_zayed_arches.jpg';
import wikBlueMosqueIstanbulImg from '../assets/images/wik_blue_mosque_istanbul.jpg';
import wikSuleymaniyeMosqueImg from '../assets/images/wik_suleymaniye_mosque.jpg';
import wikHassanIICasablancaImg from '../assets/images/wik_hassan_ii_casablanca.jpg';
import wikAlhambraCourtyardImg from '../assets/images/wik_alhambra_courtyard.jpg';
import wikCordobaMezquitaArchesImg from '../assets/images/wik_cordoba_mezquita_arches.jpg';
import wikSamarkandRegistanImg from '../assets/images/wik_samarkand_registan.jpg';
import wikNasirAlMulkLightImg from '../assets/images/wik_nasir_al_mulk_light.jpg';
import wikSultanQaboosOmanImg from '../assets/images/wik_sultan_qaboos_oman.jpg';
import wikIbnTulunCairoImg from '../assets/images/wik_ibn_tulun_cairo.jpg';
import wikSultanHassanLampImg from '../assets/images/wik_sultan_hassan_cairo.jpg';
import wikKairouanTunisiaImg from '../assets/images/wik_kairouan_tunisia.jpg';
import wikKulSharifKazanImg from '../assets/images/wik_kul_sharif_kazan.jpg';
import wikPutraMosqueMalaysiaImg from '../assets/images/wik_putra_mosque_malaysia.jpg';
import wikFaisalMosqueIslamabadImg from '../assets/images/wik_faisal_mosque_islamabad.jpg';
import wikOrtakoyBosphorusImg from '../assets/images/wik_arabic_coffee_dallah.jpg';
import wikHagiaSophiaDomeImg from '../assets/images/wik_hagia_sophia_dome.jpg';
import wikJamaMasjidDelhiImg from '../assets/images/wik_taj_mahal_mosque_dawn.jpg';
import wikMuhammadAliLampsImg from '../assets/images/wik_muhammad_ali_lamps.jpg';
import wikMihrabCordobaGoldImg from '../assets/images/wik_mihrab_cordoba_gold.jpg';
import wikShahMosqueDomeImg from '../assets/images/wik_shah_mosque_dome.jpg';
import wikAlRifaiExteriorImg from '../assets/images/wik_al_rifai_interior.jpg';
import wikBouInaniaFezImg from '../assets/images/wik_sultan_qalawun_arch.jpg';
import wikBadshahiMosqueSunsetImg from '../assets/images/wik_badshahi_mosque_arches.jpg';
import wikKoutoubiaMarrakechImg from '../assets/images/wik_koutoubia_marrakech.jpg';
import wikZaytunaMosqueTunisImg from '../assets/images/wik_zaytuna_mosque_tunis.jpg';
import wikRamadanLanternCairoImg from '../assets/images/wik_ramadan_lantern_cairo.jpg';
import wikCrescentMoonSunsetImg from '../assets/images/wik_crescent_moon_mosque.jpg';
import wikMoroccanLanternGlowImg from '../assets/images/wik_moroccan_lantern_glow.jpg';
import wikSelimiyeEdirneImg from '../assets/images/wik_mosque_night_lights.jpg';
import wikDatePalmGroveImg from '../assets/images/wik_dates_palm_harvest.jpg';
import wikBlueQuranManuscriptImg from '../assets/images/wik_blue_quran_manuscript.jpg';
import wikKuficQuranFolioImg from '../assets/images/wik_kufic_quran_folio.jpg';
import wikMamlukQuranRahmanImg from '../assets/images/wik_mamluk_quran_illumination.jpg';
import wikOttomanQuranGoldImg from '../assets/images/wik_ottoman_quran_gold.jpg';
import wikIslamicAstrolabeBrassImg from '../assets/images/wik_islamic_astrolabe_brass.jpg';
import wikIslamicWoodCarvingImg from '../assets/images/wik_islamic_calligraphy_wood.jpg';
import wikAlhambraMuqarnasImg from '../assets/images/wik_alhambra_muqarnas_ceiling.jpg';
import wikAttarineMadrasaFezImg from '../assets/images/wik_fez_al_qarawiyyin.jpg';
import wikAlMuayyadInlayImg from '../assets/images/wik_qaitbay_mosque_cairo.jpg';
import wikSaharaErgChebbiImg from '../assets/images/wik_sahara_dunes_sunrise.jpg';
import wikMilkyWayDesertImg from '../assets/images/wik_milky_way_desert.jpg';
import wikOliveBranchSkyImg from '../assets/images/wik_olive_grove_sunlight.jpg';
import wikWadiRumSunsetImg from '../assets/images/wik_wadi_rum_sunset.jpg';
import wikMountainSeaCloudsImg from '../assets/images/wik_mountain_sea_clouds.jpg';
import wikCalmOceanSunsetImg from '../assets/images/wik_calm_ocean_golden_sunset.jpg';
import wikUbariOasisLakeImg from '../assets/images/wik_date_palm_oasis_water.jpg';
import wikForestMorningSunbeamsImg from '../assets/images/wik_cedar_forest_morning_mist.jpg';

export type ArtworkCategory =
  | 'all'
  | 'sanctuaries'
  | 'spirituality'
  | 'seasons'
  | 'architecture'
  | 'heritage'
  | 'contemplation';

export type ArtworkKind = 'photo' | 'art';

export interface IslamicArtwork {
  id: string;
  label: string;
  subtitle: string;
  category: Exclude<ArtworkCategory, 'all'>;
  categoryLabel: string;
  kind?: ArtworkKind;
  src: string;
  keywords: string[];
}

export const ARTWORK_CATEGORIES: { id: ArtworkCategory; label: string }[] = [
  { id: 'all', label: 'جميع اللوحات' },
  { id: 'sanctuaries', label: 'الحرمان والأقصى' },
  { id: 'spirituality', label: 'قرآن وروحانيات' },
  { id: 'seasons', label: 'مواسم الخير ورمضان' },
  { id: 'architecture', label: 'مساجد وعمارة' },
  { id: 'heritage', label: 'مخطوطات وتراث' },
  { id: 'contemplation', label: 'تأمل وطبيعة' },
];

export const HERO_PREVIEW_IMAGE = heroLanternImg;

const PHOTO_ISLAMIC_ARTWORKS: IslamicArtwork[] = [
  // الحرمان والأقصى (6)
  {
    id: 'kaaba-night',
    label: 'رحاب الكعبة المشرفة',
    subtitle: 'سكينة المسجد الحرام وانعكاس الأنوار الذهبية في الغسق',
    category: 'sanctuaries',
    categoryLabel: 'الحرمان والأقصى',
    src: kaabaNightImg,
    keywords: ['مكة', 'الكعبة', 'الحرام', 'حج', 'عمرة', 'طواف', 'توحيد', 'قبلة'],
  },
  {
    id: 'medina-umbrellas',
    label: 'ساحات الحرم النبوي عند الفجر',
    subtitle: 'المظلات المضيئة والقبة الخضراء تحت سماء السحر الصافية',
    category: 'sanctuaries',
    categoryLabel: 'الحرمان والأقصى',
    src: medinaUmbrellasImg,
    keywords: ['المدينة', 'النبوي', 'القبة الخضراء', 'صلاة على النبي', 'سيرة', 'رحمة', 'سكينة'],
  },
  {
    id: 'nabawi-arches',
    label: 'أروقة القبة الخضراء',
    subtitle: 'أقواس رخامية مضيئة في طمأنينة المسجد النبوي الشريف',
    category: 'sanctuaries',
    categoryLabel: 'الحرمان والأقصى',
    src: nabawiArchesImg,
    keywords: ['المدينة', 'النبوي', 'النبي', 'رسول', 'سيرة', 'محمد', 'أخلاق'],
  },
  {
    id: 'makkah-minarets',
    label: 'مآذن مكة وهلال السحر',
    subtitle: 'مآذن حجرية مهيبة تتألق بنور دافئ تحت هلال الفجر',
    category: 'sanctuaries',
    categoryLabel: 'الحرمان والأقصى',
    src: makkahMinaretsImg,
    keywords: ['مآذن', 'أذان', 'مكة', 'فجر', 'سحر', 'هلال', 'نداء', 'صلاة'],
  },
  {
    id: 'aqsa-golden',
    label: 'إشراقة القدس والأقصى',
    subtitle: 'قبة الصخرة المباركة بين أغصان الزيتون في فجر ذهبي',
    category: 'sanctuaries',
    categoryLabel: 'الحرمان والأقصى',
    src: aqsaGoldenImg,
    keywords: ['القدس', 'الأقصى', 'مسرى', 'فلسطين', 'إسراء', 'زيتون', 'بركة'],
  },
  {
    id: 'hira-dawn',
    label: 'قمة جبل النور عند الفجر',
    subtitle: 'أشعة الشروق تخترق سحب الصباح فوق رحاب مكة ومهبط الوحي',
    category: 'sanctuaries',
    categoryLabel: 'الحرمان والأقصى',
    src: hiraDawnImg,
    keywords: ['حراء', 'وحي', 'اقرأ', 'جبل', 'النور', 'بداية', 'شروق', 'همة'],
  },

  // قرآن وروحانيات (5)
  {
    id: 'quran-sunlight',
    label: 'نور التلاوة في المحراب',
    subtitle: 'مصحف شريف مفتوح تغمره أشعة الشمس عبر المشربية',
    category: 'spirituality',
    categoryLabel: 'قرآن وروحانيات',
    src: quranSunlightImg,
    keywords: ['قرآن', 'تلاوة', 'تدبر', 'آية', 'آيات', 'علم', 'هداية', 'نور', 'خشوع'],
  },
  {
    id: 'prayer-niche',
    label: 'محراب الخشوع وضوء الصباح',
    subtitle: 'سجادة صلاة أمام محراب حجري عتيق تتسلل إليه خيوط الفجر',
    category: 'spirituality',
    categoryLabel: 'قرآن وروحانيات',
    src: prayerNicheImg,
    keywords: ['صلاة', 'سجود', 'محراب', 'خشوع', 'خلوة', 'قرب', 'مناجاة', 'طمأنينة'],
  },
  {
    id: 'islamic-tasbih',
    label: 'مصحف ومسبحة الذكر',
    subtitle: 'أجواء هادئة للذكر والاستغفار وتزكية النفس',
    category: 'spirituality',
    categoryLabel: 'قرآن وروحانيات',
    src: islamicTasbihImg,
    keywords: ['ذكر', 'استغفار', 'تسبيح', 'دعاء', 'طمأنينة', 'قلب', 'سكينة'],
  },
  {
    id: 'hero-lantern',
    label: 'فانوس الضياء الأندلسي',
    subtitle: 'ضوء دافئ يرمز إلى الأمل والهداية واليقين',
    category: 'spirituality',
    categoryLabel: 'قرآن وروحانيات',
    src: heroLanternImg,
    keywords: ['أمل', 'فرج', 'توكل', 'يقين', 'تفاؤل', 'رحمة', 'فضل', 'جبر'],
  },
  {
    id: 'starry-mihrab',
    label: 'قيام الليل تحت النجوم',
    subtitle: 'مسجد حجري أصيل تحت سماء صافية مرصعة بالنجوم وهلال ذهبي',
    category: 'spirituality',
    categoryLabel: 'قرآن وروحانيات',
    src: starryMihrabImg,
    keywords: ['ليل', 'قيام', 'تهجد', 'وتر', 'مناجاة', 'مساء', 'سماء', 'نجوم'],
  },

  // مواسم الخير ورمضان (4)
  {
    id: 'crescent-ramadan-night',
    label: 'هلال رمضان وأقواس الفوانيس',
    subtitle: 'فوانيس نحاسية مضيئة تطل عبر قوس حجري على القباب والهلال',
    category: 'seasons',
    categoryLabel: 'مواسم الخير ورمضان',
    src: crescentRamadanNightImg,
    keywords: ['رمضان', 'هلال', 'تراويح', 'ليلة القدر', 'صيام', 'قيام', 'فانوس', 'خير'],
  },
  {
    id: 'ramadan-courtyard',
    label: 'فوانيس ليالي رمضان',
    subtitle: 'فوانيس نحاسية مخرّمة في فناء تراثي تحت هلال الليل',
    category: 'seasons',
    categoryLabel: 'مواسم الخير ورمضان',
    src: ramadanCourtyardImg,
    keywords: ['رمضان', 'صيام', 'قيام', 'تراويح', 'ليلة القدر', 'هلال', 'صدقة', 'جود'],
  },
  {
    id: 'arafah-mercy',
    label: 'جبل الرحمة وغروب عرفة',
    subtitle: 'أشعة الغروب الذهبية تغمر صعيد عرفة في مشهد خاشع للدعاء والمغفرة',
    category: 'seasons',
    categoryLabel: 'مواسم الخير ورمضان',
    src: arafahMercyImg,
    keywords: ['عرفة', 'حج', 'ذو الحجة', 'عشر', 'تلبية', 'دعاء', 'مغفرة', 'رحمة', 'غروب'],
  },
  {
    id: 'eid-lanterns-dawn',
    label: 'إشراقة فجر العيد والياسمين',
    subtitle: 'نسائم الصباح المشرق مع الفانوس النحاسي والياسمين الأبيض الدافئ',
    category: 'seasons',
    categoryLabel: 'مواسم الخير ورمضان',
    src: eidLanternsDawnImg,
    keywords: ['عيد', 'فرح', 'جمعة', 'صباح', 'تهنئة', 'صلة رحم', 'بر الوالدين', 'أسرة', 'بشاشة'],
  },

  // مساجد وعمارة (5)
  {
    id: 'ottoman-dome',
    label: 'قبة النور والزخارف المذهّبة',
    subtitle: 'قبة إسلامية بديعة بالفيروز والذهب تتعانق فيها أشعة السماء',
    category: 'architecture',
    categoryLabel: 'مساجد وعمارة',
    src: ottomanDomeImg,
    keywords: ['قبة', 'عمارة', 'زخرفة', 'عظمة', 'جمال', 'مسجد', 'نور', 'سمو'],
  },
  {
    id: 'moroccan-zellige',
    label: 'فسيفساء الزليج وفناء الأندلس',
    subtitle: 'زخارف الزليج المغربي والأقواس المنحوتة المنعكسة في نافورة الرخام',
    category: 'architecture',
    categoryLabel: 'مساجد وعمارة',
    src: moroccanZelligeImg,
    keywords: ['المغرب', 'الأندلس', 'زليج', 'فسيفساء', 'حضارة', 'إتقان', 'جمال', 'عمارة'],
  },
  {
    id: 'rain-courtyard',
    label: 'رحمة الغيث في فناء المسجد',
    subtitle: 'رخام نديّ بعد المطر يعكس دفء الفوانيس في سكون المساء',
    category: 'architecture',
    categoryLabel: 'مساجد وعمارة',
    src: rainCourtyardImg,
    keywords: ['مطر', 'غيث', 'دعاء', 'استجابة', 'رحمة', 'مساء', 'جبر', 'فرج'],
  },
  {
    id: 'mosque-dawn',
    label: 'رحاب المسجد عند الفجر',
    subtitle: 'مآذن وقباب تعانق أنوار الصباح الأولى في سكون',
    category: 'architecture',
    categoryLabel: 'مساجد وعمارة',
    src: mosqueDawnImg,
    keywords: ['فجر', 'صلاة', 'مسجد', 'صباح', 'أذكار الصباح', 'جمعة', 'عبادة'],
  },
  {
    id: 'andalusian-arch',
    label: 'بهاء العمارة الأندلسية',
    subtitle: 'أقواس وزخارف إسلامية منعكسة في صفاء الماء',
    category: 'architecture',
    categoryLabel: 'مساجد وعمارة',
    src: andalusianArchImg,
    keywords: ['تاريخ', 'الأندلس', 'حضارة', 'عظماء', 'شعر', 'أدب', 'حكمة', 'بطولات'],
  },

  // مخطوطات وتراث (3)
  {
    id: 'astrolabe-library',
    label: 'إسطرلاب ومكتبة بيت الحكمة',
    subtitle: 'إسطرلاب نحاسي عتيق ومجلدات تراثية في ضوء سراج هادئ',
    category: 'heritage',
    categoryLabel: 'مخطوطات وتراث',
    src: astrolabeLibraryImg,
    keywords: ['تاريخ', 'علم', 'علماء', 'بيت الحكمة', 'حضارة', 'عظماء', 'شخصيات', 'فلك', 'تفكر'],
  },
  {
    id: 'calligraphy-scroll',
    label: 'أقلام القصب والرق المذهّب',
    subtitle: 'أدوات الخط العربي الأصيل ومحبَرة فخارية ولفائف الرق في ضوء ذهبي',
    category: 'heritage',
    categoryLabel: 'مخطوطات وتراث',
    src: calligraphyScrollImg,
    keywords: ['خط', 'قلم', 'كتابة', 'شعر', 'أدب', 'حكمة', 'مخطوطة', 'علم', 'تراث'],
  },
  {
    id: 'manuscript-ink',
    label: 'مخطوطة الحكمة وريشة الذكر',
    subtitle: 'كتاب مزخرف ومحبَرة نحاسية وفانوس دافئ عند نافذة الغروب',
    category: 'heritage',
    categoryLabel: 'مخطوطات وتراث',
    src: manuscriptInkImg,
    keywords: ['علم', 'حكمة', 'قلم', 'مخطوطة', 'شعر', 'أدب', 'تفكر', 'كتابة'],
  },

  // تأمل وطبيعة (5)
  {
    id: 'mountain-mist-fajr',
    label: 'قمم الجبال بين سحب الفجر',
    subtitle: 'جبال شامخة يلفها الضباب الفضي مع تسلل أول خيط من نور الصباح',
    category: 'contemplation',
    categoryLabel: 'تأمل وطبيعة',
    src: mountainMistFajrImg,
    keywords: ['جبال', 'عظمة', 'خلق', 'ثبات', 'همة', 'فجر', 'تفكر', 'يقين', 'تطوير'],
  },
  {
    id: 'palm-oasis-dusk',
    label: 'واحة النخيل وانعكاس الهلال',
    subtitle: 'صفاء الماء الساكن بين النخيل يعكس هلال الغسق في سكون عميق',
    category: 'contemplation',
    categoryLabel: 'تأمل وطبيعة',
    src: palmOasisDuskImg,
    keywords: ['واحة', 'نخيل', 'هلال', 'سكون', 'خلوة', 'صفاء', 'طمأنينة', 'بركة', 'أذكار المساء'],
  },
  {
    id: 'sea-sunset-dua',
    label: 'تأمل البحر عند الغروب',
    subtitle: 'نافذة قوسية تطل على بحر ساكن يغمره شفق الامتنان واليقين',
    category: 'contemplation',
    categoryLabel: 'تأمل وطبيعة',
    src: seaSunsetDuaImg,
    keywords: ['بحر', 'غروب', 'شفق', 'سكون', 'امتنان', 'موسى', 'توكل', 'أمل', 'رزق'],
  },
  {
    id: 'olive-garden',
    label: 'بستان الزيتون وجدول الفجر',
    subtitle: 'طبيعة هادئة تدعو إلى التفكر في بديع صنع الله',
    category: 'contemplation',
    categoryLabel: 'تأمل وطبيعة',
    src: oliveGardenImg,
    keywords: ['شكر', 'نعمة', 'جنة', 'طبيعة', 'تفكر', 'رزق', 'بر الوالدين', 'عائلة', 'رحمة'],
  },
  {
    id: 'desert-crescent',
    label: 'هلال الصحراء الهادئة',
    subtitle: 'امتداد الكثبان تحت الهلال في سكينة وصبر وتأمل',
    category: 'contemplation',
    categoryLabel: 'تأمل وطبيعة',
    src: desertCrescentImg,
    keywords: ['صبر', 'صحراء', 'هجرة', 'قصص', 'أنبياء', 'أيوب', 'يوسف', 'ثبات'],
  },
  // 6 مشاهد فوتوغرافية جديدة حصرية
  {
    id: 'quba-mosque-dawn',
    label: 'مسجد قباء ونخيل الفجر',
    subtitle: 'القباب البيضاء النقية ومآذن قباء بين النخيل في شروق وردي خاشع',
    category: 'sanctuaries',
    categoryLabel: 'الحرمان والأقصى',
    kind: 'photo',
    src: qubaMosqueDawnImg,
    keywords: ['قباء', 'المدينة', 'تقوى', 'هجرة', 'فجر', 'نخيل', 'صباح'],
  },
  {
    id: 'al-azhar-courtyard',
    label: 'صحن الجامع الأزهر الشريف',
    subtitle: 'رخام الصحن المشرق والمآذن التاريخية في رحاب العلم والسكينة',
    category: 'architecture',
    categoryLabel: 'مساجد وعمارة',
    kind: 'photo',
    src: alAzharCourtyardImg,
    keywords: ['الأزهر', 'القاهرة', 'علم', 'علماء', 'مسجد', 'صباح', 'عمارة'],
  },
  {
    id: 'damascus-umayyad',
    label: 'أروقة الجامع الأموي عند الغروب',
    subtitle: 'العقود الحجرية المخططة والقناديل المضيئة في دفء الغسق الشامي',
    category: 'architecture',
    categoryLabel: 'مساجد وعمارة',
    kind: 'photo',
    src: damascusUmayyadImg,
    keywords: ['دمشق', 'الأموي', 'أروقة', 'غروب', 'حضارة', 'قناديل', 'تاريخ'],
  },
  {
    id: 'mashrabiya-morning',
    label: 'أشعة الفجر عبر المشربية',
    subtitle: 'خيوط الشمس الذهبية تخترق الزخارف الخشبية نحو سجادة الخشوع',
    category: 'spirituality',
    categoryLabel: 'قرآن وروحانيات',
    kind: 'photo',
    src: mashrabiyaMorningImg,
    keywords: ['خشوع', 'صلاة', 'مشربية', 'نور', 'فجر', 'خلوة', 'طمأنينة'],
  },
  {
    id: 'rose-garden-fountain',
    label: 'روضة الأندلس ونافورة الرخام',
    subtitle: 'فناء إسلامي مزهر بالورد الدمشقي والسرو في صفاء الصباح',
    category: 'contemplation',
    categoryLabel: 'تأمل وطبيعة',
    kind: 'photo',
    src: roseGardenFountainImg,
    keywords: ['جنة', 'روضة', 'ورد', 'أندلس', 'شكر', 'نعمة', 'تفكر', 'جمال'],
  },
  {
    id: 'sahaba-caravan-stars',
    label: 'درب التبانة وهلال الصحراء',
    subtitle: 'سماء مرصعة بالنجوم فوق الكثبان الهادئة وسراج مضيء في الأفق',
    category: 'contemplation',
    categoryLabel: 'تأمل وطبيعة',
    kind: 'photo',
    src: sahabaCaravanStarsImg,
    keywords: ['نجوم', 'ليل', 'تفكر', 'خلق', 'صحراء', 'تهجد', 'هلال', 'عظمة'],
  },

  // --- 78 مشهداً فوتوغرافياً جديداً عالي الجودة ---

  // الحرمان والأقصى — مشاهد فوتوغرافية إضافية
  {
    id: 'photo-kaaba-fajr-mist',
    label: 'صحن الطواف عند نسائم الفجر',
    subtitle: 'الكعبة المشرفة ورخام المسجد الحرام المضيء في هدوء الفجر الساحر',
    category: 'sanctuaries',
    categoryLabel: 'الحرمان والأقصى',
    kind: 'photo',
    src: photoKaabaFajrMistImg,
    keywords: ['الكعبة', 'مكة', 'طواف', 'فجر', 'الحرم', 'سكينة', 'توحيد', 'حج'],
  },
  {
    id: 'photo-kaaba-kiswah-gold',
    label: 'كسوة الكعبة المطرزة بالذهب',
    subtitle: 'تفاصيل حريرية سوداء مطرزة بخيوط الذهب الخالص في نور دافئ',
    category: 'sanctuaries',
    categoryLabel: 'الحرمان والأقصى',
    kind: 'photo',
    src: photoKaabaKiswahGoldImg,
    keywords: ['كسوة', 'الكعبة', 'ذهب', 'تعظيم', 'توحيد', 'ذكر', 'مكة', 'الحرام'],
  },
  {
    id: 'photo-nabawi-green-dome-sunset',
    label: 'القبة الخضراء عند شفق الغروب',
    subtitle: 'إطلالة مهيبة على المسجد النبوي الشريف ومآذنه تحت سماء ذهبية',
    category: 'sanctuaries',
    categoryLabel: 'الحرمان والأقصى',
    kind: 'photo',
    src: photoNabawiGreenDomeSunsetImg,
    keywords: ['المدينة', 'القبة الخضراء', 'النبوي', 'غروب', 'صلاة على النبي', 'سيرة'],
  },
  {
    id: 'photo-nabawi-lantern-arch',
    label: 'أروقة الرخام وثريات النور',
    subtitle: 'عقود رخامية بيضاء مذهبة تتدلى منها الثريات النحاسية في صفاء الصباح',
    category: 'sanctuaries',
    categoryLabel: 'الحرمان والأقصى',
    kind: 'photo',
    src: photoNabawiLanternArchImg,
    keywords: ['أروقة', 'ثريات', 'النبوي', 'المدينة', 'رخام', 'سكينة', 'صلاة'],
  },
  {
    id: 'photo-aqsa-blue-twilight',
    label: 'قبة الصخرة تحت نجوم المساء',
    subtitle: 'توهّج القبة الذهبية في القدس الشريف وسط زرقة الليل والنجوم',
    category: 'sanctuaries',
    categoryLabel: 'الحرمان والأقصى',
    kind: 'photo',
    src: photoAqsaBlueTwilightImg,
    keywords: ['القدس', 'الأقصى', 'قبة الصخرة', 'ليل', 'نجوم', 'إسراء', 'بركة'],
  },
  {
    id: 'photo-aqsa-arches-olive',
    label: 'الأقصى عبر عقود الحجر والزيتون',
    subtitle: 'إشراقة الصباح الذهبية على قبة الصخرة وأغصان الزيتون المبارك',
    category: 'sanctuaries',
    categoryLabel: 'الحرمان والأقصى',
    kind: 'photo',
    src: photoAqsaArchesOliveImg,
    keywords: ['القدس', 'الأقصى', 'زيتون', 'فجر', 'فلسطين', 'عقود', 'سلام'],
  },
  {
    id: 'photo-madinah-palms-sunrise',
    label: 'بساتين نخيل المدينة عند الشروق',
    subtitle: 'واحات النخيل المشرقة ومآذن طيبة الطيبة تعانق ضباب الفجر الذهبي',
    category: 'sanctuaries',
    categoryLabel: 'الحرمان والأقصى',
    kind: 'photo',
    src: photoMadinahPalmsSunriseImg,
    keywords: ['المدينة', 'نخيل', 'شروق', 'طيبة', 'بركة', 'سيرة', 'صباح'],
  },
  {
    id: 'photo-makkah-rain-marble',
    label: 'غيث الرحمة على رخام الحرم',
    subtitle: 'انعكاس أضواء المآذن والأقواس الذهبية على الرخام النديّ تحت المطر ليلاً',
    category: 'sanctuaries',
    categoryLabel: 'الحرمان والأقصى',
    kind: 'photo',
    src: photoMakkahRainMarbleImg,
    keywords: ['مطر', 'غيث', 'دعاء', 'استجابة', 'مكة', 'الحرم', 'ليل', 'رحمة'],
  },
  {
    id: 'photo-qiblatain-white-minarets',
    label: 'مسجد القبلتين والقباب البيضاء',
    subtitle: 'مئذنتان شامختان وقباب ناصعة البياض تحت سماء المدينة الصافية',
    category: 'sanctuaries',
    categoryLabel: 'الحرمان والأقصى',
    kind: 'photo',
    src: photoQiblatainWhiteMinaretsImg,
    keywords: ['القبلتين', 'المدينة', 'مسجد', 'قباب', 'صباح', 'صفاء', 'سيرة'],
  },
  {
    id: 'photo-jerusalem-old-lantern-arch',
    label: 'قنطرة القدس القديمة وسراج المساء',
    subtitle: 'قوس حجري عتيق يضيئه مصباح دافئ في أزقة البلدة القديمة بالقدس',
    category: 'sanctuaries',
    categoryLabel: 'الحرمان والأقصى',
    kind: 'photo',
    src: photoJerusalemOldLanternArchImg,
    keywords: ['القدس', 'تاريخ', 'حجر', 'سراج', 'مساء', 'أصالة', 'أمل'],
  },
  {
    id: 'photo-zamzam-brass-vessel',
    label: 'إبريق النور وماء البركة',
    subtitle: 'إبريق فضي ونحاسي منقوش بالزخارف الإسلامية على الرخام في ضوء الصباح',
    category: 'sanctuaries',
    categoryLabel: 'الحرمان والأقصى',
    kind: 'photo',
    src: photoZamzamBrassVesselImg,
    keywords: ['زمزم', 'ماء', 'طهارة', 'بركة', 'كرم', 'ضيافة', 'شكر', 'نعمة'],
  },
  {
    id: 'wik-kaaba-masjid-haram',
    label: 'الطواف في رحاب البيت العتيق',
    subtitle: 'لقطة فوتوغرافية حقيقية لجموع الطائفين حول الكعبة المشرفة بالمسجد الحرام',
    category: 'sanctuaries',
    categoryLabel: 'الحرمان والأقصى',
    kind: 'photo',
    src: wikKaabaMasjidHaramImg,
    keywords: ['الكعبة', 'مكة', 'طواف', 'عمرة', 'حج', 'الحرم', 'المسجد الحرام'],
  },
  {
    id: 'wik-nabawi-courtyard-umbrellas',
    label: 'ظلال مظلات المسجد النبوي',
    subtitle: 'ساحات الحرم النبوي الشريف تحت المظلات الواسعة في روحانية جامعة',
    category: 'sanctuaries',
    categoryLabel: 'الحرمان والأقصى',
    kind: 'photo',
    src: wikNabawiCourtyardUmbrellasImg,
    keywords: ['المدينة', 'النبوي', 'مظلات', 'صلاة', 'جماعة', 'سكينة', 'رحمة'],
  },
  {
    id: 'wik-aqsa-qibli-mosque',
    label: 'الجامع القبلي بالمسجد الأقصى',
    subtitle: 'واجهة المصلى القبلي المبارك وقبته الرصاصية تحت سماء القدس الصافية',
    category: 'sanctuaries',
    categoryLabel: 'الحرمان والأقصى',
    kind: 'photo',
    src: wikAqsaQibliMosqueImg,
    keywords: ['الأقصى', 'الجامع القبلي', 'القدس', 'فلسطين', 'مسرى', 'صلاة'],
  },
  {
    id: 'wik-dome-of-rock-golden',
    label: 'إطلالة القدس وقبة الصخرة',
    subtitle: 'بانوراما فوتوغرافية للبلدة القديمة وسور القدس وقبة الصخرة المشرفة',
    category: 'sanctuaries',
    categoryLabel: 'الحرمان والأقصى',
    kind: 'photo',
    src: wikDomeOfRockGoldenImg,
    keywords: ['القدس', 'قبة الصخرة', 'الأقصى', 'فلسطين', 'تاريخ', 'بركة'],
  },
  {
    id: 'wik-dome-of-chain-jerusalem',
    label: 'قبة السلسلة في رحاب الأقصى',
    subtitle: 'الفسيفساء الزرقاء والأعمدة الرخامية التاريخية في صحن المسجد الأقصى',
    category: 'sanctuaries',
    categoryLabel: 'الحرمان والأقصى',
    kind: 'photo',
    src: wikDomeOfChainJerusalemImg,
    keywords: ['قبة السلسلة', 'الأقصى', 'القدس', 'فسيفساء', 'تراث', 'عمارة'],
  },
  {
    id: 'wik-cave-hira-makkah',
    label: 'جبل النور ومهبط الوحي بمكة',
    subtitle: 'شموخ جبل النور حيث غار حراء وبداية نور الرسالة الخالدة',
    category: 'sanctuaries',
    categoryLabel: 'الحرمان والأقصى',
    kind: 'photo',
    src: wikCaveHiraMakkahImg,
    keywords: ['جبل النور', 'حراء', 'مكة', 'وحي', 'اقرأ', 'سيرة', 'همة'],
  },

  // قرآن وروحانيات — مشاهد فوتوغرافية إضافية
  {
    id: 'photo-quran-rehal-candlelight',
    label: 'مصحف التلاوة على ضوء الفانوس',
    subtitle: 'مصحف مذهب مفتوح على حامل خشبي محفور بجوار فانوس نحاسي في سكون الليل',
    category: 'spirituality',
    categoryLabel: 'قرآن وروحانيات',
    kind: 'photo',
    src: photoQuranRehalCandlelightImg,
    keywords: ['قرآن', 'تلاوة', 'تدبر', 'ليل', 'خلوة', 'طمأنينة', 'ذكر', 'خشوع'],
  },
  {
    id: 'photo-prayer-beads-velvet-dawn',
    label: 'مسبحة الكهرمان على سجادة الزمرد',
    subtitle: 'حبات الذكر الذهبية والفيروزية فوق سجادة صلاة مطرزة في ضوء الصباح',
    category: 'spirituality',
    categoryLabel: 'قرآن وروحانيات',
    kind: 'photo',
    src: photoPrayerBeadsVelvetDawnImg,
    keywords: ['تسبيح', 'استغفار', 'ذكر', 'مسبحة', 'صباح', 'أذكار', 'سكينة'],
  },
  {
    id: 'photo-mosque-sunbeams-carpet',
    label: 'أشعة الهداية في رحاب المسجد',
    subtitle: 'خيوط الشمس الذهبية تتدفق من النوافذ الملونة على سجاد الصلاة العريق',
    category: 'spirituality',
    categoryLabel: 'قرآن وروحانيات',
    kind: 'photo',
    src: photoMosqueSunbeamsCarpetImg,
    keywords: ['نور', 'خشوع', 'مسجد', 'صلاة', 'هداية', 'طمأنينة', 'روحانيات'],
  },
  {
    id: 'photo-oud-incense-lantern',
    label: 'طيب العود ونقوش المشربية',
    subtitle: 'مبخرة نحاسية عربية يتصاعد منها عبير العود وسط ظلال الشمس الدافئة',
    category: 'spirituality',
    categoryLabel: 'قرآن وروحانيات',
    kind: 'photo',
    src: photoOudIncenseLanternImg,
    keywords: ['عود', 'طيب', 'جمعة', 'ضيافة', 'سكينة', 'مشربية', 'أصالة'],
  },
  {
    id: 'photo-tahajjud-window-moon',
    label: 'نافذة التهجد وهلال السحر',
    subtitle: 'سجادة صلاة وسراج مضيء عند نافذة قوسية تطل على هلال الليل والنجوم',
    category: 'spirituality',
    categoryLabel: 'قرآن وروحانيات',
    kind: 'photo',
    src: photoTahajjudWindowMoonImg,
    keywords: ['تهجد', 'قيام الليل', 'سحر', 'مناجاة', 'وتر', 'دعاء', 'هلال', 'خلوة'],
  },
  {
    id: 'photo-quran-stained-glass-glow',
    label: 'أطياف الزجاج المعشّق والمصحف',
    subtitle: 'ألوان الزجاج الإسلامي تنثر ضياءها الساحر فوق المصحف الشريف بالمحراب',
    category: 'spirituality',
    categoryLabel: 'قرآن وروحانيات',
    kind: 'photo',
    src: photoQuranStainedGlassGlowImg,
    keywords: ['قرآن', 'نور', 'ألوان', 'محراب', 'تدبر', 'آيات', 'جمال'],
  },
  {
    id: 'photo-wooden-minbar-light',
    label: 'المنبر الخشبي ونور الجمعة',
    subtitle: 'منبر خشبي تاريخي محفور بالنجوم الهندسية تغمره أشعة الشمس الخاشعة',
    category: 'spirituality',
    categoryLabel: 'قرآن وروحانيات',
    kind: 'photo',
    src: photoWoodenMinbarLightImg,
    keywords: ['منبر', 'جمعة', 'خطبة', 'موعظة', 'مسجد', 'علم', 'هداية'],
  },
  {
    id: 'photo-fajr-prayer-rug-courtyard',
    label: 'سجادة الفجر في صحن المسجد',
    subtitle: 'سجادة خضراء مطرزة تحت زرقة الفجر وقناديل الرواق الحجري الهادئ',
    category: 'spirituality',
    categoryLabel: 'قرآن وروحانيات',
    kind: 'photo',
    src: photoFajrPrayerRugCourtyardImg,
    keywords: ['فجر', 'صلاة', 'سجود', 'خلوة', 'طمأنينة', 'بداية', 'قرب'],
  },
  {
    id: 'wik-muhammad-ali-lamps',
    label: 'قناديل مسجد محمد علي بالقاهرة',
    subtitle: 'حلقات القناديل المضيئة المعلقة تحت القباب الشاهقة في رحاب الخشوع',
    category: 'spirituality',
    categoryLabel: 'قرآن وروحانيات',
    kind: 'photo',
    src: wikMuhammadAliLampsImg,
    keywords: ['قناديل', 'القاهرة', 'مسجد', 'خشوع', 'صلاة', 'نور', 'روحانيات'],
  },
  {
    id: 'wik-mihrab-cordoba-gold',
    label: 'محراب قرطبة المذهّب بالفسيفساء',
    subtitle: 'إبداع الفسيفساء الذهبية والعقود المفصصة في محراب جامع قرطبة التاريخي',
    category: 'spirituality',
    categoryLabel: 'قرآن وروحانيات',
    kind: 'photo',
    src: wikMihrabCordobaGoldImg,
    keywords: ['محراب', 'قرطبة', 'الأندلس', 'ذهب', 'خشوع', 'حضارة', 'إبداع'],
  },
  {
    id: 'wik-nasir-al-mulk-light',
    label: 'أضواء الزجاج الملون في قاعة الصلاة',
    subtitle: 'انسياب ألوان الصباح الزاهية فوق الأعمدة والسجاد في مشهد إيماني ساحر',
    category: 'spirituality',
    categoryLabel: 'قرآن وروحانيات',
    kind: 'photo',
    src: wikNasirAlMulkLightImg,
    keywords: ['ألوان', 'نور', 'صلاة', 'صباح', 'مسجد', 'تأمل', 'بهجة'],
  },
  {
    id: 'wik-sultan-qaboos-oman',
    label: 'الثريا الكبرى بجامع السلطان قابوس',
    subtitle: 'تألّق الكريستال والزخارف المعمارية الدقيقة في قاعة الصلاة الرحبة بعُمان',
    category: 'spirituality',
    categoryLabel: 'قرآن وروحانيات',
    kind: 'photo',
    src: wikSultanQaboosOmanImg,
    keywords: ['عمان', 'ثريا', 'مسجد', 'نور', 'عظمة', 'عمارة', 'إتقان'],
  },
  {
    id: 'wik-sultan-hassan-lamp',
    label: 'قنديل المسجد الأثري بالخط العربي',
    subtitle: 'مشكاة زجاجية مملوكية مزدانة بالخط العربي الأصيل رمزاً لنور الإيمان',
    category: 'spirituality',
    categoryLabel: 'قرآن وروحانيات',
    kind: 'photo',
    src: wikSultanHassanLampImg,
    keywords: ['مشكاة', 'قنديل', 'نور', 'سورة النور', 'خط عربي', 'تراث', 'إيمان'],
  },

  // مواسم الخير ورمضان — مشاهد فوتوغرافية إضافية
  {
    id: 'photo-suhoor-lantern-table',
    label: 'سكينة السحور وتلاوة السحر',
    subtitle: 'فانوس مضيء ومصحف وتمر على شرفة تطل على المآذن تحت سماء مرصعة بالنجوم',
    category: 'seasons',
    categoryLabel: 'مواسم الخير ورمضان',
    kind: 'photo',
    src: photoSuhoorLanternTableImg,
    keywords: ['سحور', 'رمضان', 'بركة', 'صيام', 'قيام', 'فانوس', 'قرآن', 'ليل'],
  },
  {
    id: 'photo-eid-crescent-minarets',
    label: 'صباح العيد والقباب البيضاء',
    subtitle: 'فرحة العيد وإشراقة القباب البيضاء المزدانة بالزهور في نسائم الفجر',
    category: 'seasons',
    categoryLabel: 'مواسم الخير ورمضان',
    kind: 'photo',
    src: photoEidCrescentMinaretsImg,
    keywords: ['عيد', 'فرح', 'تهنئة', 'صباح', 'أضحى', 'فطر', 'أسرة', 'بشاشة'],
  },
  {
    id: 'wik-ramadan-lantern-cairo',
    label: 'فوانيس رمضان الملونة في القاهرة',
    subtitle: 'أضواء الفوانيس التقليدية المزركشة تبشر بقدوم شهر الخير والرحمات',
    category: 'seasons',
    categoryLabel: 'مواسم الخير ورمضان',
    kind: 'photo',
    src: wikRamadanLanternCairoImg,
    keywords: ['رمضان', 'فانوس', 'القاهرة', 'بهجة', 'صيام', 'تراويح', 'خير'],
  },
  {
    id: 'wik-moroccan-lantern-glow',
    label: 'عناقيد الفوانيس النحاسية الدافئة',
    subtitle: 'تشكيلة ساحرة من الفوانيس المخرّمة تنشر دفء الضياء في ليالي الذكر',
    category: 'seasons',
    categoryLabel: 'مواسم الخير ورمضان',
    kind: 'photo',
    src: wikMoroccanLanternGlowImg,
    keywords: ['فوانيس', 'رمضان', 'نور', 'دفء', 'ليل', 'ضياء', 'مغرب'],
  },
  {
    id: 'wik-crescent-moon-mosque',
    label: 'هلال الشهر الكريم في شفق الغروب',
    subtitle: 'بزوغ الهلال الرقيق في أفق الشفق البرتقالي بشارةً بمواسم الطاعة',
    category: 'seasons',
    categoryLabel: 'مواسم الخير ورمضان',
    kind: 'photo',
    src: wikCrescentMoonSunsetImg,
    keywords: ['هلال', 'رمضان', 'شعبان', 'ذو الحجة', 'عيد', 'شفق', 'غروب', 'مواسم'],
  },
  {
    id: 'wik-faisal-mosque-islamabad',
    label: 'تألق مسجد فيصل في ليالي القيام',
    subtitle: 'إضاءة ليلية مهيبة لجامع فيصل وسط الجبال الساكنة في ليالي رمضان',
    category: 'seasons',
    categoryLabel: 'مواسم الخير ورمضان',
    kind: 'photo',
    src: wikFaisalMosqueIslamabadImg,
    keywords: ['ليل', 'تراويح', 'قيام', 'رمضان', 'مسجد', 'نور', 'إسلام آباد'],
  },
  {
    id: 'wik-zaytuna-mosque-tunis',
    label: 'أضواء جامع الزيتونة بتونس ليلاً',
    subtitle: 'صحن جامع الزيتونة العريق متألقاً بالأنوار الزرقاء والذهبية في المساء',
    category: 'seasons',
    categoryLabel: 'مواسم الخير ورمضان',
    kind: 'photo',
    src: wikZaytunaMosqueTunisImg,
    keywords: ['الزيتونة', 'تونس', 'ليل', 'تراويح', 'علم', 'مسجد', 'رمضان'],
  },

  // مساجد وعمارة إسلامية عالمية — مشاهد فوتوغرافية إضافية
  {
    id: 'wik-sheikh-zayed-night',
    label: 'ظلال جامع الشيخ زايد عند الغروب',
    subtitle: 'المآذن والقباب الشاهقة في مشهد شاعري ذهبي ينعكس فوق صفحة الماء',
    category: 'architecture',
    categoryLabel: 'مساجد وعمارة',
    kind: 'photo',
    src: wikSheikhZayedSilhouetteImg,
    keywords: ['الشيخ زايد', 'غروب', 'مآذن', 'قباب', 'ماء', 'سكينة', 'مسجد'],
  },
  {
    id: 'wik-sheikh-zayed-arches',
    label: 'أقواس الرخام الأبيض والمئذنة',
    subtitle: 'نقاء العمارة الإسلامية البيضاء في صحن مشرق تحت السماء الزرقاء',
    category: 'architecture',
    categoryLabel: 'مساجد وعمارة',
    kind: 'photo',
    src: wikSheikhZayedArchesImg,
    keywords: ['رخام', 'مئذنة', 'أقواس', 'صفاء', 'مسجد', 'صباح', 'عمارة'],
  },
  {
    id: 'wik-blue-mosque-istanbul',
    label: 'الجامع الأزرق (السلطان أحمد)',
    subtitle: 'تدرج القباب العثمانية والمآذن السامقة في ضوء العصر الذهبي بإسطنبول',
    category: 'architecture',
    categoryLabel: 'مساجد وعمارة',
    kind: 'photo',
    src: wikBlueMosqueIstanbulImg,
    keywords: ['إسطنبول', 'السلطان أحمد', 'قباب', 'مآذن', 'عمارة', 'مسجد', 'تاريخ'],
  },
  {
    id: 'wik-suleymaniye-mosque',
    label: 'إطلالة جامع السليمانية والخليج',
    subtitle: 'مآذن السليمانية تشرف على صفحة البحر الصافية في مشهد تاريخي مهيب',
    category: 'architecture',
    categoryLabel: 'مساجد وعمارة',
    kind: 'photo',
    src: wikSuleymaniyeMosqueImg,
    keywords: ['السليمانية', 'إسطنبول', 'بحر', 'حضارة', 'مسجد', 'تاريخ', 'عمارة'],
  },
  {
    id: 'wik-ortakoy-bosphorus',
    label: 'مسجد أورتاكوي على ضفاف البوسفور',
    subtitle: 'جمال المسجد الأبيض المزخرف وهو يعانق أمواج البوسفور الفيروزية',
    category: 'architecture',
    categoryLabel: 'مساجد وعمارة',
    kind: 'photo',
    src: wikOrtakoyBosphorusImg,
    keywords: ['البوسفور', 'إسطنبول', 'بحر', 'مسجد', 'جمال', 'صفاء', 'صباح'],
  },
  {
    id: 'wik-selimiye-edirne',
    label: 'جامع السليمية المهيب في أدرنة',
    subtitle: 'درة العمارة الإسلامية بمآذنها الأربع الشاهقة وقبتها المتناسقة',
    category: 'architecture',
    categoryLabel: 'مساجد وعمارة',
    kind: 'photo',
    src: wikSelimiyeEdirneImg,
    keywords: ['السليمية', 'عمارة', 'مآذن', 'إتقان', 'مسجد', 'حضارة', 'سمو'],
  },
  {
    id: 'wik-hassan-ii-casablanca',
    label: 'مسجد الحسن الثاني بالدار البيضاء',
    subtitle: 'المئذنة الشاهقة والصحن الفسيح يغمرهما ضياء الغروب على شاطئ الأطلسي',
    category: 'architecture',
    categoryLabel: 'مساجد وعمارة',
    kind: 'photo',
    src: wikHassanIICasablancaImg,
    keywords: ['المغرب', 'الحسن الثاني', 'مئذنة', 'غروب', 'مسجد', 'شموخ'],
  },
  {
    id: 'wik-koutoubia-marrakech',
    label: 'صومعة الكتبية في مراكش عند الشفق',
    subtitle: 'مئذنة الكتبية التراثية الشامخة بين النخيل والسرو في دفء المساء',
    category: 'architecture',
    categoryLabel: 'مساجد وعمارة',
    kind: 'photo',
    src: wikKoutoubiaMarrakechImg,
    keywords: ['الكتبية', 'مراكش', 'المغرب', 'شفق', 'تاريخ', 'صومعة', 'حضارة'],
  },
  {
    id: 'wik-alhambra-courtyard',
    label: 'بهو الريحان في قصر الحمراء',
    subtitle: 'الأقواس الأندلسية المنحوتة تنعكس بصفاء تام فوق بركة الماء الساكنة',
    category: 'architecture',
    categoryLabel: 'مساجد وعمارة',
    kind: 'photo',
    src: wikAlhambraCourtyardImg,
    keywords: ['الحمراء', 'غرناطة', 'الأندلس', 'ماء', 'انعكاس', 'تاريخ', 'حضارة', 'شعر'],
  },
  {
    id: 'wik-cordoba-mezquita-arches',
    label: 'غابة الأعمدة بجامع قرطبة الكبير',
    subtitle: 'العقود المزدوجة الحمراء والبيضاء تحكي مجد الحضارة الإسلامية في الأندلس',
    category: 'architecture',
    categoryLabel: 'مساجد وعمارة',
    kind: 'photo',
    src: wikCordobaMezquitaArchesImg,
    keywords: ['قرطبة', 'الأندلس', 'أعمدة', 'عقود', 'تاريخ', 'حضارة', 'عظماء'],
  },
  {
    id: 'wik-samarkand-registan',
    label: 'ميدان ريغستان والقباب الفيروزية بسمرقند',
    subtitle: 'مدارس العلم الإسلامية العريقة وزخارف القاشاني الأزرق في آسيا الوسطى',
    category: 'architecture',
    categoryLabel: 'مساجد وعمارة',
    kind: 'photo',
    src: wikSamarkandRegistanImg,
    keywords: ['سمرقند', 'علم', 'علماء', 'البخاري', 'حضارة', 'فيروز', 'تاريخ'],
  },
  {
    id: 'wik-ibn-tulun-cairo',
    label: 'أقواس جامع أحمد بن طولون بالقاهرة',
    subtitle: 'أروقة عريقة مضاءة بنور الشمس تحفظ ذاكرة أكثر من ألف عام من الصلاة',
    category: 'architecture',
    categoryLabel: 'مساجد وعمارة',
    kind: 'photo',
    src: wikIbnTulunCairoImg,
    keywords: ['ابن طولون', 'القاهرة', 'أقواس', 'تاريخ', 'أصالة', 'مسجد', 'سكينة'],
  },
  {
    id: 'wik-al-rifai-exterior',
    label: 'مآذن السلطان حسن والرفاعي بالقاهرة',
    subtitle: 'صرحان معماريان مملوكيان يرويان قصة الإتقان والعراقة في القاهرة التاريخية',
    category: 'architecture',
    categoryLabel: 'مساجد وعمارة',
    kind: 'photo',
    src: wikAlRifaiExteriorImg,
    keywords: ['السلطان حسن', 'الرفاعي', 'القاهرة', 'مآذن', 'حضارة', 'عظمة', 'عمارة'],
  },
  {
    id: 'wik-damascus-umayyad-courtyard',
    label: 'صحن الجامع الأموي الكبير بدمشق',
    subtitle: 'الرخام اللامع وقبة الخزنة التاريخية والأروقة الشامية المهيبة',
    category: 'architecture',
    categoryLabel: 'مساجد وعمارة',
    kind: 'photo',
    src: wikDamascusUmayyadCourtyardImg,
    keywords: ['دمشق', 'الجامع الأموي', 'الشام', 'تاريخ', 'صحن', 'مسجد', 'عراقة'],
  },
  {
    id: 'wik-kairouan-tunisia',
    label: 'جامع عقبة بن نافع بالقيروان',
    subtitle: 'أقدم منارة إسلامية في المغرب العربي تشهد على فتوحات الخير والعلم',
    category: 'architecture',
    categoryLabel: 'مساجد وعمارة',
    kind: 'photo',
    src: wikKairouanTunisiaImg,
    keywords: ['القيروان', 'عقبة', 'تونس', 'بطولات', 'تاريخ', 'مئذنة', 'عظماء'],
  },
  {
    id: 'wik-kul-sharif-kazan',
    label: 'جامع كول شريف والقباب الزرقاء',
    subtitle: 'تحفة معمارية بيضاء وزرقاء سماوية ترتفع مآذنها في صفاء بديع',
    category: 'architecture',
    categoryLabel: 'مساجد وعمارة',
    kind: 'photo',
    src: wikKulSharifKazanImg,
    keywords: ['قازان', 'قباب', 'أزرق', 'مسجد', 'عمارة', 'نقاء', 'جمال'],
  },
  {
    id: 'wik-putra-mosque-malaysia',
    label: 'مسجد بوترا وانعكاسه على البحيرة',
    subtitle: 'القبة الوردية والمئذنة الشاهقة تنعكسان بسكينة فوق مياه البحيرة الهادئة',
    category: 'architecture',
    categoryLabel: 'مساجد وعمارة',
    kind: 'photo',
    src: wikPutraMosqueMalaysiaImg,
    keywords: ['ماليزيا', 'بحيرة', 'انعكاس', 'مسجد', 'سكينة', 'جمال', 'غروب'],
  },
  {
    id: 'wik-badshahi-mosque-sunset',
    label: 'شفق الغروب فوق جامع بادشاهي',
    subtitle: 'قرص الشمس الدافئ يودّع القباب والمآذن الحجرية الحمراء في مشهد خاشع',
    category: 'architecture',
    categoryLabel: 'مساجد وعمارة',
    kind: 'photo',
    src: wikBadshahiMosqueSunsetImg,
    keywords: ['غروب', 'شفق', 'مسجد', 'قباب', 'تأمل', 'لاهور', 'عظمة'],
  },
  {
    id: 'wik-jama-masjid-delhi',
    label: 'رحاب الجامع الكبير في دلهي',
    subtitle: 'البوابات المهيبة والقباب الرخامية المخططة في فناء واسع ينبض بالتاريخ',
    category: 'architecture',
    categoryLabel: 'مساجد وعمارة',
    kind: 'photo',
    src: wikJamaMasjidDelhiImg,
    keywords: ['الجامع الكبير', 'قباب', 'عمارة', 'تاريخ', 'مسجد', 'حضارة'],
  },
  {
    id: 'wik-hagia-sophia-dome',
    label: 'قبة آيا صوفيا المذهّبة بالنور',
    subtitle: 'أربعون نافذة تحيط بالقبة الشاهقة فتنثر الضوء السماوي في أرجاء المكان',
    category: 'architecture',
    categoryLabel: 'مساجد وعمارة',
    kind: 'photo',
    src: wikHagiaSophiaDomeImg,
    keywords: ['آيا صوفيا', 'قبة', 'نور', 'إسطنبول', 'عمارة', 'عظمة', 'تاريخ'],
  },
  {
    id: 'wik-shah-mosque-dome',
    label: 'قبة مسجد الشيخ لطف الله المذهّبة',
    subtitle: 'هندسة فنية مذهلة من البلاط المزخرف بالذهب واللازورد في تناسق فريد',
    category: 'architecture',
    categoryLabel: 'مساجد وعمارة',
    kind: 'photo',
    src: wikShahMosqueDomeImg,
    keywords: ['قبة', 'زخرفة', 'ذهب', 'هندسة', 'إبداع', 'جمال', 'تفكر'],
  },

  // مخطوطات وتراث — مشاهد فوتوغرافية إضافية
  {
    id: 'wik-blue-quran-manuscript',
    label: 'مخطوطة المصحف الأزرق الكوفي',
    subtitle: 'رقّ أزرق نيلي نادر كُتبت عليه آيات الله بالذهب الخالص بالخط الكوفي العتيق',
    category: 'heritage',
    categoryLabel: 'مخطوطات وتراث',
    kind: 'photo',
    src: wikBlueQuranManuscriptImg,
    keywords: ['مخطوطة', 'المصحف الأزرق', 'خط كوفي', 'قرآن', 'تراث', 'القيروان', 'ذهب'],
  },
  {
    id: 'wik-mamluk-quran-rahman',
    label: 'مخطوطة سورة الرحمن المملوكية',
    subtitle: 'صفحة أثرية مذهّبة من مصحف مملوكي عريق تتجلى فيها روعة خط الثلث والمحقق',
    category: 'heritage',
    categoryLabel: 'مخطوطات وتراث',
    kind: 'photo',
    src: wikMamlukQuranRahmanImg,
    keywords: ['سورة الرحمن', 'قرآن', 'مخطوطة', 'خط عربي', 'تراث', 'ذهب', 'علم'],
  },
  {
    id: 'wik-kufic-quran-folio',
    label: 'مصحف تراثي مزخرف الهوامش',
    subtitle: 'صفحتان متقابلتان من مصحف تاريخي بإطارات نباتية وهندسية مذهبة',
    category: 'heritage',
    categoryLabel: 'مخطوطات وتراث',
    kind: 'photo',
    src: wikKuficQuranFolioImg,
    keywords: ['مصحف', 'مخطوطة', 'تذهيب', 'زخرفة', 'تراث', 'قرآن', 'حكمة'],
  },
  {
    id: 'wik-ottoman-quran-gold',
    label: 'تذهيب المصاحف العثمانية الأصيلة',
    subtitle: 'إبداع خطاطي الإسلام في تزيين فاتحة السور باللازورد والذهب الدقيق',
    category: 'heritage',
    categoryLabel: 'مخطوطات وتراث',
    kind: 'photo',
    src: wikOttomanQuranGoldImg,
    keywords: ['تذهيب', 'مصحف', 'خط', 'علم', 'تراث', 'إتقان', 'أدب'],
  },
  {
    id: 'wik-islamic-astrolabe-brass',
    label: 'الإسطرلاب الفلكي النحاسي الأصيل',
    subtitle: 'تحفة علمية من عصر النهضة الإسلامية لحساب مواقيت الصلاة ومطالع النجوم',
    category: 'heritage',
    categoryLabel: 'مخطوطات وتراث',
    kind: 'photo',
    src: wikIslamicAstrolabeBrassImg,
    keywords: ['إسطرلاب', 'فلك', 'علماء', 'حضارة', 'علم', 'عظماء', 'بيت الحكمة'],
  },
  {
    id: 'wik-islamic-wood-carving',
    label: 'حفر الخشب الإسلامي بالزخارف النباتية',
    subtitle: 'قطعة تراثية محفورة يدوياً بدقة بالغة تعكس روح الإتقان في الفن الإسلامي',
    category: 'heritage',
    categoryLabel: 'مخطوطات وتراث',
    kind: 'photo',
    src: wikIslamicWoodCarvingImg,
    keywords: ['خشب', 'زخرفة', 'تراث', 'فن إسلامي', 'إتقان', 'أصالة', 'حكمة'],
  },
  {
    id: 'wik-al-muayyad-inlay',
    label: 'زخارف الخشب والصدف بمسجد المؤيد',
    subtitle: 'نجوم هندسية إسلامية مطعّمة بالعاج والخشب الثمين من روائع القاهرة المملوكية',
    category: 'heritage',
    categoryLabel: 'مخطوطات وتراث',
    kind: 'photo',
    src: wikAlMuayyadInlayImg,
    keywords: ['زخارف', 'هندسة', 'نجوم', 'القاهرة', 'تراث', 'إبداع', 'إتقان'],
  },
  {
    id: 'wik-alhambra-muqarnas',
    label: 'مقرنصات قصر الحمراء المنحوتة',
    subtitle: 'شلال من النقوش الجصية والمقرنصات المعمارية الأندلسية الدقيقة',
    category: 'heritage',
    categoryLabel: 'مخطوطات وتراث',
    kind: 'photo',
    src: wikAlhambraMuqarnasImg,
    keywords: ['مقرنصات', 'الأندلس', 'الحمراء', 'عمارة', 'شعر', 'أدب', 'تراث'],
  },
  {
    id: 'wik-attarine-madrasa-fez',
    label: 'مدرسة العطارين التاريخية بفاس',
    subtitle: 'صرح عريق لطلبة العلم الشرعي يجمع بين الزليج وخشب الأرز المنقوش',
    category: 'heritage',
    categoryLabel: 'مخطوطات وتراث',
    kind: 'photo',
    src: wikAttarineMadrasaFezImg,
    keywords: ['فاس', 'مدرسة', 'علم', 'علماء', 'المغرب', 'تربية', 'تراث'],
  },
  {
    id: 'wik-bou-inania-fez',
    label: 'فناء المدرسة البوعنانية بفاس',
    subtitle: 'سكون فناء العلم والنافورة الرخامية المحاطة بأعرق نقوش المغرب الإسلامي',
    category: 'heritage',
    categoryLabel: 'مخطوطات وتراث',
    kind: 'photo',
    src: wikBouInaniaFezImg,
    keywords: ['فاس', 'علم', 'فناء', 'حكمة', 'تراث', 'المغرب', 'صفاء'],
  },

  // تأمل وطبيعة — مشاهد فوتوغرافية إضافية
  {
    id: 'wik-sahara-erg-chebbi',
    label: 'شروق الذهب فوق كثبان الصحراء',
    subtitle: 'تموجات الرمال الذهبية تستقبل نور الصباح الأول في سكون وتفكر',
    category: 'contemplation',
    categoryLabel: 'تأمل وطبيعة',
    kind: 'photo',
    src: wikSaharaErgChebbiImg,
    keywords: ['صحراء', 'شروق', 'صبر', 'كثبان', 'تفكر', 'خلق', 'بداية', 'أمل'],
  },
  {
    id: 'wik-milky-way-desert',
    label: 'المجرة السماوية فوق جبال الليل',
    subtitle: 'تأمل في سعة السماء ونجومها المسبّحة بحمد الله في جوف الليل',
    category: 'contemplation',
    categoryLabel: 'تأمل وطبيعة',
    kind: 'photo',
    src: wikMilkyWayDesertImg,
    keywords: ['نجوم', 'سماء', 'تفكر', 'عظمة', 'خلق', 'ليل', 'آيات', 'كون'],
  },
  {
    id: 'wik-olive-branch-sky',
    label: 'غصن الزيتون المبارك نحو السماء',
    subtitle: 'ثمار الزيتون الخضراء تتلألأ تحت الشمس في رمز للبركة والسلام والشكر',
    category: 'contemplation',
    categoryLabel: 'تأمل وطبيعة',
    kind: 'photo',
    src: wikOliveBranchSkyImg,
    keywords: ['زيتون', 'بركة', 'شكر', 'نعمة', 'سلام', 'شجرة مباركة', 'رزق'],
  },
  {
    id: 'wik-wadi-rum-sunset',
    label: 'شفق الصحراء وجبال وادي رم',
    subtitle: 'جبال صخرية شامخة تكتسي بوهج الغروب في سكون يوقظ اليقين والثبات',
    category: 'contemplation',
    categoryLabel: 'تأمل وطبيعة',
    kind: 'photo',
    src: wikWadiRumSunsetImg,
    keywords: ['جبال', 'صحراء', 'غروب', 'ثبات', 'صبر', 'تفكر', 'عظمة', 'همة'],
  },
  {
    id: 'wik-mount-sinai-sunrise',
    label: 'شروق الشمس من قمة جبل الطور',
    subtitle: 'وهج الفجر الساطع فوق قمم جبال سيناء في مشهد مهيب للرجاء والارتقاء',
    category: 'contemplation',
    categoryLabel: 'تأمل وطبيعة',
    kind: 'photo',
    src: wikMountSinaiSunriseImg,
    keywords: ['طور سيناء', 'موسى', 'جبل', 'شروق', 'فجر', 'همة', 'قصص الأنبياء', 'يقين'],
  },
  {
    id: 'wik-mountain-sea-clouds',
    label: 'بحر السحاب بين الجبال الشامخة',
    subtitle: 'سحب بيضاء تسبح برفق فوق الوديان الخضراء تذكيراً ببديع صنع الخالق',
    category: 'contemplation',
    categoryLabel: 'تأمل وطبيعة',
    kind: 'photo',
    src: wikMountainSeaCloudsImg,
    keywords: ['سحاب', 'جبال', 'خلق', 'تفكر', 'سمو', 'سكينة', 'تطوير الذات', 'أمل'],
  },
  {
    id: 'wik-calm-ocean-sunset',
    label: 'صفاء البحر وسعف النخيل عند الغروب',
    subtitle: 'أشعة الغروب الهادئة تمتد فوق صفحة البحر كجسر من نور وطمأنينة',
    category: 'contemplation',
    categoryLabel: 'تأمل وطبيعة',
    kind: 'photo',
    src: wikCalmOceanSunsetImg,
    keywords: ['بحر', 'غروب', 'نخيل', 'طمأنينة', 'امتنان', 'توكل', 'سكينة', 'مساء'],
  },
  {
    id: 'wik-ubari-oasis-lake',
    label: 'بحيرة الواحة بين كثبان الرمال',
    subtitle: 'ماء عذب ونخيل شامخ يزهر في قلب الصحراء رمزاً للفرج بعد العسر',
    category: 'contemplation',
    categoryLabel: 'تأمل وطبيعة',
    kind: 'photo',
    src: wikUbariOasisLakeImg,
    keywords: ['واحة', 'فرج', 'يسر', 'رزق', 'نخيل', 'ماء', 'أمل', 'جبر الخواطر'],
  },
  {
    id: 'wik-date-palm-grove',
    label: 'بساتين النخيل الباسقات',
    subtitle: 'أشجار النخيل المباركة تتعانق سعفاتها تحت السماء الصافية في عطاء دائم',
    category: 'contemplation',
    categoryLabel: 'تأمل وطبيعة',
    kind: 'photo',
    src: wikDatePalmGroveImg,
    keywords: ['نخيل', 'بركة', 'رزق', 'شكر', 'عطاء', 'جنة', 'نعمة', 'بر الوالدين'],
  },
  {
    id: 'wik-forest-morning-sunbeams',
    label: 'أشعة الصباح بين أشجار الغابة',
    subtitle: 'خيوط النور تخترق ضباب الفجر بين الأشجار في مشهد يملأ القلب انشراحاً',
    category: 'contemplation',
    categoryLabel: 'تأمل وطبيعة',
    kind: 'photo',
    src: wikForestMorningSunbeamsImg,
    keywords: ['فجر', 'شمس', 'نور', 'أمل', 'بداية', 'انشراح', 'تفاؤل', 'طبيعة'],
  },
];

export const LOCAL_ISLAMIC_ARTWORKS: IslamicArtwork[] = PHOTO_ISLAMIC_ARTWORKS.map((item) => ({
  ...item,
  kind: 'photo' as ArtworkKind,
}));

export const PRESET_IMAGES: string[] = LOCAL_ISLAMIC_ARTWORKS.map((art) => art.src);

export interface GradientBackdrop {
  id: string;
  name: string;
  subtitle: string;
  cssGradient: string;
  colors: [string, string, string];
  ornamentColor: string;
  accentColor: string;
  textColor: string;
  isDark: boolean;
}

export const GRADIENT_BACKDROPS: GradientBackdrop[] = [
  {
    id: 'grad-emerald',
    name: 'زمردي ليلي',
    subtitle: 'تدرج داكن مذهّب للآيات',
    cssGradient: 'linear-gradient(135deg, #071e19 0%, #123e34 50%, #061814 100%)',
    colors: ['#071e19', '#123e34', '#061814'],
    ornamentColor: 'rgba(212, 175, 55, 0.38)',
    accentColor: '#E5C76B',
    textColor: '#FFFFFF',
    isDark: true,
  },
  {
    id: 'grad-olive',
    name: 'زيتوني تراثي',
    subtitle: 'هوية نور الهادئة',
    cssGradient: 'linear-gradient(135deg, #25281b 0%, #4b4d35 55%, #1c1e14 100%)',
    colors: ['#25281b', '#4b4d35', '#1c1e14'],
    ornamentColor: 'rgba(229, 204, 130, 0.36)',
    accentColor: '#E8D08B',
    textColor: '#FFFFFF',
    isDark: true,
  },
  {
    id: 'grad-midnight',
    name: 'سماء التهجد',
    subtitle: 'كحلي عميق بنقش ذهبي',
    cssGradient: 'linear-gradient(135deg, #091021 0%, #162644 50%, #070c18 100%)',
    colors: ['#091021', '#162644', '#070c18'],
    ornamentColor: 'rgba(212, 175, 55, 0.38)',
    accentColor: '#E6C86E',
    textColor: '#FFFFFF',
    isDark: true,
  },
  {
    id: 'grad-amber',
    name: 'عنبر الغروب',
    subtitle: 'دفء صحراوي متوازن',
    cssGradient: 'linear-gradient(135deg, #2d170b 0%, #6d3f1d 50%, #1d0e06 100%)',
    colors: ['#2d170b', '#6d3f1d', '#1d0e06'],
    ornamentColor: 'rgba(244, 211, 134, 0.36)',
    accentColor: '#F3D283',
    textColor: '#FFFFFF',
    isDark: true,
  },
  {
    id: 'grad-burgundy',
    name: 'مسك أندلسي',
    subtitle: 'عنابي ملكي وقور',
    cssGradient: 'linear-gradient(135deg, #240f18 0%, #522033 55%, #16090e 100%)',
    colors: ['#240f18', '#522033', '#16090e'],
    ornamentColor: 'rgba(218, 184, 108, 0.36)',
    accentColor: '#E8C980',
    textColor: '#FFFFFF',
    isDark: true,
  },
  {
    id: 'grad-obsidian',
    name: 'فحمي مذهّب',
    subtitle: 'أعلى تباين للخط العربي',
    cssGradient: 'linear-gradient(135deg, #0d0d0f 0%, #232220 50%, #09090b 100%)',
    colors: ['#0d0d0f', '#232220', '#09090b'],
    ornamentColor: 'rgba(212, 175, 55, 0.42)',
    accentColor: '#E6C560',
    textColor: '#FFFFFF',
    isDark: true,
  },
  {
    id: 'grad-teal',
    name: 'فيروزي دمشقي',
    subtitle: 'صفاء وروحانية راقية',
    cssGradient: 'linear-gradient(135deg, #09242c 0%, #154d59 55%, #06181e 100%)',
    colors: ['#09242c', '#154d59', '#06181e'],
    ornamentColor: 'rgba(212, 175, 55, 0.34)',
    accentColor: '#E5CA78',
    textColor: '#FFFFFF',
    isDark: true,
  },
  {
    id: 'grad-sapphire',
    name: 'لازوردي قرطبي',
    subtitle: 'أزرق سماوي هادئ للخشوع',
    cssGradient: 'linear-gradient(135deg, #0b1930 0%, #1a3a63 52%, #071224 100%)',
    colors: ['#0b1930', '#1a3a63', '#071224'],
    ornamentColor: 'rgba(229, 200, 118, 0.38)',
    accentColor: '#E8CC7A',
    textColor: '#FFFFFF',
    isDark: true,
  },
  {
    id: 'grad-madinah-green',
    name: 'أخضر مدني',
    subtitle: 'وقار القبة الخضراء والذهب',
    cssGradient: 'linear-gradient(135deg, #0a2617 0%, #194d32 52%, #071b10 100%)',
    colors: ['#0a2617', '#194d32', '#071b10'],
    ornamentColor: 'rgba(224, 192, 104, 0.40)',
    accentColor: '#E9CC7B',
    textColor: '#FFFFFF',
    isDark: true,
  },
  {
    id: 'grad-parchment',
    name: 'رق مخطوط عتيق',
    subtitle: 'ورق دافئ للمخطوطات',
    cssGradient: 'linear-gradient(135deg, #f6f0e4 0%, #e9dec9 55%, #f3ebdc 100%)',
    colors: ['#f6f0e4', '#e9dec9', '#f3ebdc'],
    ornamentColor: 'rgba(115, 92, 46, 0.36)',
    accentColor: '#8B6821',
    textColor: '#221D15',
    isDark: false,
  },
  {
    id: 'grad-ivory-gold',
    name: 'عاجي مذهّب',
    subtitle: 'إشراقة نقية للخواطر الصباحية',
    cssGradient: 'linear-gradient(135deg, #faf7f0 0%, #efe4cc 52%, #f8f3e8 100%)',
    colors: ['#faf7f0', '#efe4cc', '#f8f3e8'],
    ornamentColor: 'rgba(176, 134, 38, 0.40)',
    accentColor: '#966F1B',
    textColor: '#1F1B14',
    isDark: false,
  },
  {
    id: 'grad-damask-sand',
    name: 'رملي دمشقي ناعم',
    subtitle: 'دفء هادئ للخواطر الوجدانية',
    cssGradient: 'linear-gradient(135deg, #f5ebe3 0%, #e7d5c6 52%, #f2e6dc 100%)',
    colors: ['#f5ebe3', '#e7d5c6', '#f2e6dc'],
    ornamentColor: 'rgba(130, 82, 58, 0.34)',
    accentColor: '#7D4B34',
    textColor: '#241A15',
    isDark: false,
  },
  {
    id: 'grad-royal-plum',
    name: 'بنفسجي السحر',
    subtitle: 'وقار ليالي التهجد والمناجاة',
    cssGradient: 'linear-gradient(135deg, #190e26 0%, #3a2057 52%, #11091c 100%)',
    colors: ['#190e26', '#3a2057', '#11091c'],
    ornamentColor: 'rgba(232, 200, 114, 0.38)',
    accentColor: '#ECCB72',
    textColor: '#FFFFFF',
    isDark: true,
  },
  {
    id: 'grad-copper-bronze',
    name: 'برونزي قاهري',
    subtitle: 'دفء القناديل المملوكية العتيقة',
    cssGradient: 'linear-gradient(135deg, #24160c 0%, #57361c 52%, #190f08 100%)',
    colors: ['#24160c', '#57361c', '#190f08'],
    ornamentColor: 'rgba(238, 198, 110, 0.38)',
    accentColor: '#F0CA74',
    textColor: '#FFFFFF',
    isDark: true,
  },
  {
    id: 'grad-cedar-slate',
    name: 'أردوازي هادئ',
    subtitle: 'رصانة وتوازن للحِكم والتاريخ',
    cssGradient: 'linear-gradient(135deg, #141c24 0%, #2a3b4c 52%, #0e141a 100%)',
    colors: ['#141c24', '#2a3b4c', '#0e141a'],
    ornamentColor: 'rgba(229, 198, 112, 0.36)',
    accentColor: '#E7C86E',
    textColor: '#FFFFFF',
    isDark: true,
  },
  {
    id: 'grad-sage-morning',
    name: 'مريمية الفجر',
    subtitle: 'نقاء صباحي هادئ لأذكار اليوم',
    cssGradient: 'linear-gradient(135deg, #e7ede0 0%, #d8e2ce 52%, #edf2e8 100%)',
    colors: ['#e7ede0', '#d8e2ce', '#edf2e8'],
    ornamentColor: 'rgba(90, 90, 64, 0.34)',
    accentColor: '#4E5436',
    textColor: '#1E2118',
    isDark: false,
  },
  {
    id: 'grad-rose-pearl',
    name: 'لؤلؤي وردي ناعم',
    subtitle: 'رقة وبشاشة لخواطر الرحمة والأمل',
    cssGradient: 'linear-gradient(135deg, #f6ecea 0%, #ead8d4 52%, #f4eae8 100%)',
    colors: ['#f6ecea', '#ead8d4', '#f4eae8'],
    ornamentColor: 'rgba(138, 86, 76, 0.32)',
    accentColor: '#864E44',
    textColor: '#261918',
    isDark: false,
  },
  {
    id: 'grad-sky-mist',
    name: 'نسيم الضحى السماوي',
    subtitle: 'صفاء مضيء للتأمل والامتنان',
    cssGradient: 'linear-gradient(135deg, #e8eff5 0%, #d6e3ee 52%, #edf3f8 100%)',
    colors: ['#e8eff5', '#d6e3ee', '#edf3f8'],
    ornamentColor: 'rgba(42, 74, 108, 0.30)',
    accentColor: '#244A70',
    textColor: '#15202B',
    isDark: false,
  },
];

export type ManuscriptTextDensity = 'minimal' | 'short' | 'medium' | 'long';

export interface ManuscriptRenderOptions {
  aspectRatio?: AspectRatio;
  textLength?: number;
  hasVerse?: boolean;
  hasFullOverlay?: boolean;
  fontSize?: number;
}

export function getManuscriptDimensions(aspectRatio: AspectRatio = '1:1'): { width: number; height: number } {
  switch (aspectRatio) {
    case '9:16':
      return { width: 1080, height: 1920 };
    case '3:4':
      return { width: 1080, height: 1440 };
    case '4:3':
      return { width: 1440, height: 1080 };
    case '16:9':
      return { width: 1920, height: 1080 };
    case '1:1':
    default:
      return { width: 1080, height: 1080 };
  }
}

export function computeManuscriptTextDensity(options?: ManuscriptRenderOptions): ManuscriptTextDensity {
  const length = options?.textLength ?? 0;
  if (length <= 0) return 'minimal';
  const fontScale = (options?.fontSize ?? 24) / 24;
  const overlayFactor = options?.hasFullOverlay ? 1.18 : 1.0;
  const weighted = length * Math.max(0.8, Math.min(1.7, fontScale)) * overlayFactor;
  if (weighted <= 95) return 'short';
  if (weighted <= 220) return 'medium';
  return 'long';
}

function drawEightPointStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number) {
  ctx.save();
  ctx.translate(cx, cy);
  const side = (radius * 2) / Math.SQRT2;
  for (let i = 0; i < 2; i++) {
    ctx.rotate((Math.PI / 4) * i);
    ctx.strokeRect(-side / 2, -side / 2, side, side);
  }
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.24, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawMedallionCrest(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  horizontal: boolean
) {
  ctx.save();
  ctx.translate(cx, cy);
  if (!horizontal) ctx.rotate(Math.PI / 2);
  ctx.beginPath();
  ctx.moveTo(-rx, 0);
  ctx.quadraticCurveTo(-rx * 0.45, -ry * 0.9, 0, -ry);
  ctx.quadraticCurveTo(rx * 0.45, -ry * 0.9, rx, 0);
  ctx.quadraticCurveTo(rx * 0.45, ry * 0.9, 0, ry);
  ctx.quadraticCurveTo(-rx * 0.45, ry * 0.9, -rx, 0);
  ctx.closePath();
  ctx.stroke();

  // Inner diamond
  ctx.beginPath();
  ctx.moveTo(0, -ry * 0.55);
  ctx.lineTo(rx * 0.38, 0);
  ctx.lineTo(0, ry * 0.55);
  ctx.lineTo(-rx * 0.38, 0);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

function drawCornerArabesque(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  dirX: number,
  dirY: number,
  size: number
) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x + dirX * size, y);
  ctx.quadraticCurveTo(x + dirX * size * 0.25, y + dirY * size * 0.25, x, y + dirY * size);
  ctx.stroke();
  ctx.restore();
}

export function createGradientDataUrl(
  backdrop: GradientBackdrop,
  options?: ManuscriptRenderOptions
): string {
  const aspectRatio = options?.aspectRatio ?? '1:1';
  const { width, height } = getManuscriptDimensions(aspectRatio);
  const minDim = Math.min(width, height);
  const density = computeManuscriptTextDensity(options);
  const isTall = height > width * 1.1;
  const isWide = width > height * 1.15;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return heroLanternImg;

  // 1. Directional manuscript base gradient aligned to aspect ratio
  const grad = ctx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, backdrop.colors[0]);
  grad.addColorStop(0.5, backdrop.colors[1]);
  grad.addColorStop(1, backdrop.colors[2]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // 2. Dynamic reading halo centered behind the actual text zone
  const glowX = width * 0.5;
  const glowY = options?.hasFullOverlay
    ? height * 0.52
    : options?.hasVerse
      ? height * 0.54
      : height * 0.48;
  const glowRadius = Math.max(width, height) * (density === 'long' ? 0.62 : 0.55);
  const radial = ctx.createRadialGradient(glowX, glowY, minDim * 0.05, glowX, glowY, glowRadius);
  if (backdrop.isDark) {
    radial.addColorStop(0, density === 'long' ? 'rgba(212, 175, 55, 0.07)' : 'rgba(212, 175, 55, 0.11)');
    radial.addColorStop(0.65, 'rgba(212, 175, 55, 0.02)');
    radial.addColorStop(1, 'rgba(0, 0, 0, 0.28)');
  } else {
    radial.addColorStop(0, 'rgba(255, 255, 255, 0.42)');
    radial.addColorStop(0.7, 'rgba(255, 250, 240, 0.10)');
    radial.addColorStop(1, 'rgba(120, 92, 52, 0.11)');
  }
  ctx.fillStyle = radial;
  ctx.fillRect(0, 0, width, height);

  // 3. Whisper-subtle central geometric Islamic filigree medallion (recedes when text is long)
  ctx.save();
  ctx.strokeStyle = backdrop.ornamentColor;
  ctx.globalAlpha = density === 'long' ? 0.14 : density === 'medium' ? 0.22 : 0.34;
  ctx.lineWidth = 1.25;
  const filigreeR = minDim * (density === 'long' ? 0.36 : 0.29);
  drawEightPointStar(ctx, width * 0.5, height * 0.5, filigreeR);
  ctx.beginPath();
  ctx.arc(width * 0.5, height * 0.5, filigreeR * 1.12, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // 4. Adaptive inset & frame thickness based on text density + aspect ratio
  const insetRatio =
    density === 'long' ? 0.028 :
    density === 'medium' ? 0.038 :
    density === 'short' ? 0.048 : 0.056;
  const outerInset = Math.round(minDim * insetRatio);
  const innerGap = density === 'long' ? 11 : density === 'medium' ? 14 : 18;
  const innerInset = outerInset + innerGap;

  // Classic double Islamic manuscript frame (exact fit to width x height)
  ctx.strokeStyle = backdrop.ornamentColor;
  ctx.lineWidth = density === 'long' ? 2.4 : 3.2;
  ctx.strokeRect(outerInset, outerInset, width - outerInset * 2, height - outerInset * 2);

  ctx.lineWidth = 1.25;
  ctx.strokeRect(innerInset, innerInset, width - innerInset * 2, height - innerInset * 2);

  // Extra hairline accent frame for short/minimal texts
  if (density === 'short' || density === 'minimal') {
    ctx.save();
    ctx.globalAlpha = 0.55;
    ctx.lineWidth = 0.9;
    const thirdInset = innerInset + 8;
    ctx.strokeRect(thirdInset, thirdInset, width - thirdInset * 2, height - thirdInset * 2);
    ctx.restore();
  }

  // 5. Adaptive 8-point corner rosettes + corner arabesque arcs
  const starRadius =
    density === 'long' ? 13 :
    density === 'medium' ? 17 :
    density === 'short' ? 21 : 25;
  const starOffset = innerInset + starRadius + (density === 'long' ? 10 : 14);
  ctx.lineWidth = 1.5;

  drawEightPointStar(ctx, starOffset, starOffset, starRadius);
  drawEightPointStar(ctx, width - starOffset, starOffset, starRadius);
  drawEightPointStar(ctx, starOffset, height - starOffset, starRadius);
  drawEightPointStar(ctx, width - starOffset, height - starOffset, starRadius);

  const arcSize = starRadius * 2.3;
  ctx.save();
  ctx.globalAlpha = 0.72;
  ctx.lineWidth = 1.2;
  drawCornerArabesque(ctx, innerInset, innerInset, 1, 1, arcSize);
  drawCornerArabesque(ctx, width - innerInset, innerInset, -1, 1, arcSize);
  drawCornerArabesque(ctx, innerInset, height - innerInset, 1, -1, arcSize);
  drawCornerArabesque(ctx, width - innerInset, height - innerInset, -1, -1, arcSize);
  ctx.restore();

  // 6. Adaptive top & bottom crown medallions (and side medallions for tall/wide formats)
  const crestRx = density === 'long' ? 30 : 46;
  const crestRy = density === 'long' ? 11 : 17;
  ctx.lineWidth = 1.5;

  // Top & bottom center crests
  drawMedallionCrest(ctx, width * 0.5, outerInset, crestRx, crestRy, true);
  if (density !== 'long' || isTall) {
    drawMedallionCrest(ctx, width * 0.5, height - outerInset, crestRx, crestRy, true);
  }

  // Side axis ornaments on tall vertical (9:16, 3:4) or square ratios when space permits
  if (isTall || (!isWide && density !== 'long')) {
    drawMedallionCrest(ctx, outerInset, height * 0.5, crestRx * 0.85, crestRy * 0.85, false);
    drawMedallionCrest(ctx, width - outerInset, height * 0.5, crestRx * 0.85, crestRy * 0.85, false);
  }

  // On wide ratios (16:9, 4:3), add symmetrical side vertical flourish dividers inside the outer margin
  if (isWide) {
    const flankOffset = innerInset + Math.round(width * 0.025);
    const segLen = height * (density === 'long' ? 0.16 : 0.24);
    ctx.save();
    ctx.globalAlpha = 0.55;
    ctx.lineWidth = 1.2;
    for (const xPos of [flankOffset, width - flankOffset]) {
      ctx.beginPath();
      ctx.moveTo(xPos, height * 0.5 - segLen);
      ctx.lineTo(xPos, height * 0.5 + segLen);
      ctx.stroke();
      drawEightPointStar(ctx, xPos, height * 0.5, 10);
    }
    ctx.restore();
  }

  // 7. Soft protective inner panel when full text overlay is active on dark/light manuscripts
  if (options?.hasFullOverlay && density === 'long') {
    const safePadX = innerInset + Math.round(minDim * 0.032);
    const safePadY = innerInset + Math.round(minDim * 0.032);
    ctx.save();
    ctx.fillStyle = backdrop.isDark ? 'rgba(0, 0, 0, 0.16)' : 'rgba(255, 255, 255, 0.28)';
    ctx.fillRect(safePadX, safePadY, width - safePadX * 2, height - safePadY * 2);
    ctx.restore();
  }

  return canvas.toDataURL('image/png');
}

export const CATEGORY_FALLBACK_TOPICS: Record<string, string[]> = {
  "موضوع تلقائي": [
    "حين يغلق الله باباً ليحميك من عاصفة لا تراها",
    "أسرار السكينة في جوف الليل ومناجاة السحر",
    "كيف يصنع الاستغفار مخارج من ضيق لم تحسبه",
    "جبر الخواطر: عبادة خفية تفتح أبواب السماء",
    "طمأنينة «لا تحزن إن الله معنا» وسط العواصف",
    "المعنى الخفي في تأخير الإجابة وحكمة التدبير",
    "دفء الرحمة النبوية في المواقف اليومية الصغيرة",
    "كيف يرمم القرآن ما كسرته الأيام في قلبك",
  ],
  "خواطر قرآنية": [
    "لطائف «ولسوف يعطيك ربك فترضى» للقلوب المتعبة",
    "ماذا يعني أن يكون الله «قريبٌ» بلا وسائط ولا مواعيد",
    "أسرار السكينة في سورة الضحى بعد طول انتظار",
    "«لا تدري لعل الله يحدث بعد ذلك أمراً».. فقه المفاجآت الربانية",
    "وقفة مع آية «يدبر الأمر» حين تعجز الحسابات",
    "كيف تحيي «ألا بذكر الله تطمئن القلوب» روحك المنهكة",
  ],
  "أحاديث نبوية": [
    "بلاغة «تبسمك في وجه أخيك صدقة» في صناعة الأثر",
    "عظمة حديث «عجباً لأمر المؤمن» عند تقلب الأحوال",
    "دفء الوصية النبوية في كفالة اليتيم ومسح رأسه",
    "كيف يعلمنا حديث «أحب الأعمال أدومها» سر الاستقامة",
    "قوة الدعاء في حديث «لا يرد القضاء إلا الدعاء»",
    "معنى الكلمة الطيبة التي ترفع صاحبها درجات",
  ],
  "قصص قرآنية ونبوية": [
    "يقين موسى عليه السلام أمام البحر: «كلا إن معي ربي سيهدين»",
    "صبر يعقوب عليه السلام: كيف تحول الحزن الطويل إلى أمل جميل",
    "مناجاة يونس في الظلمات: سر «لا إله إلا أنت سبحانك»",
    "ثبات إبراهيم عليه السلام حين أصبحت النار برداً وسلاماً",
    "عفو يوسف عليه السلام: عندما ينتصر النبل على الجرح القديم",
    "نداء أيوب عليه السلام: أدب الشكوى إلى أرحم الراحمين",
  ],
  "سيرة نبوية": [
    "لطف النبي ﷺ مع أنس بن مالك في عشر سنوات من الصحبة",
    "وقفة وفاء: كيف كان النبي ﷺ يذكر السيدة خديجة بعد رحيلها",
    "تواضع النبوة: حين كان يخصف نعله ويخدم أهله",
    "رحمة المصطفى ﷺ يوم فتح مكة: «اذهبوا فأنتم الطلقاء»",
    "حنان النبي ﷺ على الأطفال وتخفيف الصلاة لبكاء صبي",
    "السكينة في غار ثور: حين تشتد الكربة ويكون الله ثالثهما",
  ],
  "تطوير الذات الإيماني": [
    "كيف تبني صلابة نفسية لا تنكسر بقوة التوكل",
    "فقه الترك الجميل: أشياء تتركها لله فيعوضك أبهى منها",
    "إدارة القلق في ميزان الإيمان وحسن الظن بالله",
    "قوة الورد اليومي الصغير في تغيير مسار حياتك",
    "كيف تحافظ على نقاء قلبك وسط ضجيج الحياة",
    "الهمة العالية بين التخطيط البشري والتوفيق الرباني",
  ],
  "القدس والمسجد الأقصى": [
    "القدس: الأرض التي بارك الله حولها وربطها بالسماء",
    "ليلة الإسراء: حين التقت قلوب الأنبياء في المسجد الأقصى",
    "أغصان الزيتون ومآذن القدس: ذاكرة الإيمان التي لا تشيخ",
    "فضل الصلاة في المسجد الأقصى ومكانته في وجدان الأمة",
  ],
  "أخلاق الإسلام": [
    "جمال الستر وحفظ غيبة الناس في زمن التسرع",
    "الكلمة الطيبة كشجرة أصلها ثابت تظلل القلوب",
    "الرفق الذي ما كان في شيء إلا زانه",
    "أثر الإحسان الخفي الذي لا يراه إلا الله",
    "بر الوالدين: الباب الأوسع لبركة العمر والرزق",
    "العفو عند المقدرة: شجاعة القلوب الكبيرة",
  ],
  "مواسم الخير ورمضان": [
    "نسائم رمضان: كيف تتهيأ روحك لاستقبال شهر الرحمات",
    "ساعات السحر في ليالي القيام: خلوة لا يشبهها شيء",
    "أسرار العشر الأواخر وتلمّس ليلة القدر بقلب حاضر",
    "يوم عرفة: حين تتنزل الرحمات وتُكتب الأقدار الجميلة",
    "فرحة العيد وصلة الأرحام وجبر قلوب الفقراء",
    "نفحات يوم الجمعة وساعة الإجابة قبل الغروب",
  ],
  "الأدعية والمناجاة": [
    "أدب المناجاة حين تعجز الكلمات وتنطق الدموع",
    "دعاء «اللهم إني أعوذ بك من الهم والحزن» وشفاء القلوب",
    "سر الإلحاح في الدعاء وحسن الظن بالإجابة",
    "أجمل ما تدعو به في السجود حين تضيق بك السبل",
    "دعاء «رب إني لما أنزلت إلي من خير فقير» وبوابات الرزق",
    "مناجاة الفجر: كلمات قليلة تفتح لك بركة اليوم كله",
  ],
  "السكينة وجبر الخواطر": [
    "لا تستهِن بكلمة دافئة تُعيد إنساناً للحياة",
    "جبر الخواطر: عبادة يرفع الله بها شأن صاحبها في السماء",
    "كيف يرمم الله القلوب المكسورة بألطف مما كانت",
    "السكينة الحقيقية تبدأ حين تتوقف عن مقاومة أقدار الله",
    "كن ملجأً آمناً لمن أثقلته الحياة بكلمة طيبة أو إنصات صادق",
    "لطف الله الخفي في أصعب الأيام التي ظننتها لن تمضي",
  ],
  "بر الوالدين والأسرة": [
    "دعاء الأم: الدرع الخفي الذي يحفظك في كل طريق",
    "تعب الأب الصامت: كيف نكافئه بالبر والرحمة والوفاء",
    "البيوت التي يُتلى فيها القرآن تسكنها الملائكة والطمأنينة",
    "الكلمة اللينة داخل الأسرة صدقةٌ يوميةٌ لا تنقطع",
    "كيف تغرس محبة الله والقرآن في قلوب أبنائك بلطف",
    "صلة الرحم: سر البركة في العمر والرزق وراحة البال",
  ],
  "حكايات من التاريخ الإسلامي": [
    "عدل عمر بن الخطاب رضي الله عنه: «متى استعبدتم الناس»",
    "ليلة عسس الفاروق حين حمل الدقيق بنفسه لأم الأيتام",
    "مكتبة بيت الحكمة في بغداد: حين أضاء العلم الإسلامي العالم",
    "موقف عمر بن عبد العزيز حين فاضت الزكاة فلم يوجد فقير",
    "وفاء الأندلس وجمال الحضارة التي جمعت بين الإيمان والفن",
    "قصة الشاب الذي ردّ الأمانة فبارك الله له في رزقه وذريته",
  ],
  "بطولات إسلامية": [
    "ثبات بلال بن رباح رضي الله عنه: «أحدٌ أحد» في وجه القسوة",
    "شجاعة خولة بنت الأزور وعزة المرأة المسلمة في الميدان",
    "ثبات الصحابة يوم الأحزاب حين اشتد الخوف وصدق اليقين",
    "نبل صلاح الدين الأيوبي ورحمته بالأسرى عند فتح بيت المقدس",
    "عزيمة طارق بن زياد ويقين القائد المتوكل على الله",
    "بطولة مصعب بن عمير: أول سفير للإسلام صنع التاريخ بالحكمة",
  ],
  "شخصيات إسلامية": [
    "أبو بكر الصديق: الصاحب الوفي الذي سبق الأمة بقلبه",
    "السيدة خديجة رضي الله عنها: السند الأول وملاذ السكينة",
    "الإمام الشافعي: جمع بين عمق الفقه ورقة الشعر وحسن الأدب",
    "عمر بن عبد العزيز: خامس الخلفاء الراشدين ونموذج الورع",
    "السيدة عائشة رضي الله عنها: مدرسة العلم والفقه والرواية",
    "سعيد بن المسيب: عزة العالم الذي لا يبيع دينه بدنيا",
  ],
  "فضائل الأعمال": [
    "صلاة الفجر في وقتها: عهدٌ بالبركة والحفظ طوال النهار",
    "الصدقة الخفية التي تطفئ غضب الرب وتداوي القلوب",
    "فضل الصلاة على النبي ﷺ في تفريج الكروب ومغفرة الذنوب",
    "قراءة سورة الكهف يوم الجمعة: نورٌ يمتد بين الجمعتين",
    "إفشاء السلام وإطعام الطعام: أسهل أبواب دخول الجنة",
    "ركعتا الضحى: صلاة الأوابين وصدقةٌ عن كل مفصل في جسدك",
  ],
  "تربية إيمانية": [
    "كيف تربي قلبك على مراقبة الله في الخلوات قبل الجلوات",
    "تعليم الأبناء الصدق والأمانة بالقدوة لا بالأوامر",
    "تزكية النفس: خطوات عملية لتنقية القلب من الحسد والضيق",
    "الصحبة الصالحة: المرآة التي تذكّرك بالله كلما غفلت",
    "فقه المحاسبة الهادئة قبل النوم وبداية صفحة نقية",
    "كيف نغرس قيمة الامتنان والشكر في نفوس الجيل الجديد",
  ],
  "شعر إسلامي": [
    "روائع الإمام الشافعي في الصبر وحسن التوكل على الله",
    "مناجاة الروح في قصائد الحنين إلى رحاب مكة والمدينة",
    "أبيات في الرضا بالقضاء وطمأنينة النفس المؤمنة",
    "شعر الحكمة والزهد: حين يسمو القلب فوق زخرف الدنيا",
    "مدح الحبيب المصطفى ﷺ في أعذب ما سطّره الشعراء",
    "قصائد الفجر والأمل: كيف يضيء اليقين عتمة الليل",
  ],
  "عظماء الإسلام": [
    "الإمام البخاري: رحلة الأمانة والصبر في حفظ السنة النبوية",
    "ابن الهيثم: العالم المسلم الذي أرسى المنهج العلمي بالتأمل",
    "فاطمة الفهرية: المرأة التي بنت أقدم جامعة في التاريخ",
    "الإمام أحمد بن حنبل: مدرسة الثبات على الحق في المحنة",
    "العز بن عبد السلام: سلطان العلماء الذي صدع بالحق بشجاعة",
    "الجزري والخوارزمي: حين كان الإبداع العلمي عبادةً وعمراناً",
  ],
};

export function getCategoryFallbackTopics(category?: string): string[] {
  if (category && CATEGORY_FALLBACK_TOPICS[category]) {
    return CATEGORY_FALLBACK_TOPICS[category];
  }
  return CATEGORY_FALLBACK_TOPICS["موضوع تلقائي"];
}

export const PRESET_POSTS: (GeneratedPost & { category: string; citations: SupportingCitation[] })[] = [
  {
    category: "خواطر قرآنية",
    topic: "مفاجآت اللطف الخفي",
    content: "كم من بابٍ ظننت إغلاقه نهايةَ الطريق، فكان في الحقيقة سِتراً ربانياً يحميك من عاصفةٍ لا تراها عيناك. ما يؤخره الله عنك ليس حرماناً، بل تهيئةً لقلبٍ يستوعب عطاءً أوسع من توقعاتك. اطمئن؛ فإن المدبّر إذا أراد أمراً هيّأ له أسباباً لم تخطر لك على بال ✨",
    versePrefix: "قال تعالى:",
    verseText: "لَا تَدْرِي لَعَلَّ اللَّهَ يُحْدِثُ بَعْدَ ذَٰلِكَ أَمْرًا",
    surahName: "الطلاق",
    verseNumber: "1",
    verseReference: "(الطلاق : 1)",
    citations: [
      {
        type: "hadith",
        label: "حديث نبوي شريف",
        prefix: "قال رسول الله ﷺ:",
        text: "عَجَبًا لِأَمْرِ الْمُؤْمِنِ، إِنَّ أَمْرَهُ كُلَّهُ خَيْرٌ، وَلَيْسَ ذَاكَ لِأَحَدٍ إِلَّا لِلْمُؤْمِنِ",
        source: "رواه مسلم (2999)"
      },
      {
        type: "poetry",
        label: "بيت شعر",
        prefix: "من روائع الشعر العربي:",
        text: "ضاقت فلما استحكمت حلقاتها / فُرجت وكنت أظنها لا تُفرج",
        source: "إبراهيم بن العباس الصولي"
      },
      {
        type: "wisdom",
        label: "حكمة وأثر مأثور",
        prefix: "قال ابن القيم رحمه الله:",
        text: "لو كُشف الغطاء لعبدٍ عن لطف الله في أقداره، لبكى حياءً من ظنّه وتسرّعه، وعلم أن اختيار الله له خيرٌ من اختياره لنفسه.",
        source: "من درر ابن القيم"
      }
    ]
  },
  {
    category: "خواطر قرآنية",
    topic: "وطن الطمأنينة في الذكر",
    content: "تضيق الصدور أحياناً لا لأن الهموم تكاثرت، بل لأن الروح ابتعدت عن نبعها الأول. لحظةُ صدقٍ تنسحب فيها من ضجيج العالم لتهمس بذكر الله، تعيد ترتيب الفوضى داخلك وكأن يداً حانية تمسح على تعبك. الذكر ليس كلماتٍ ترددها الشفاه، بل نافذةُ أمانٍ تُفتح في قلبك فلا تنغلق 🌿",
    versePrefix: "قال تعالى:",
    verseText: "الَّذِينَ آمَنُوا وَتَطْمَئِنُّ قُلُوبُهُم بِذِكْرِ اللَّهِ ۗ أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ",
    surahName: "الرعد",
    verseNumber: "28",
    verseReference: "(الرعد : 28)",
    citations: [
      {
        type: "hadith",
        label: "حديث نبوي شريف",
        prefix: "قال رسول الله ﷺ:",
        text: "مَثَلُ الَّذِي يَذْكُرُ رَبَّهُ وَالَّذِي لَا يَذْكُرُ رَبَّهُ، مَثَلُ الْحَيِّ وَالْمَيِّتِ",
        source: "رواه البخاري (6407)"
      },
      {
        type: "poetry",
        label: "بيت شعر",
        prefix: "من شعر المناجاة:",
        text: "يا غافلَ القلبِ عن ذكرِ المنيبِ له / أفقْ فإنَّ بذكرِ اللهِ تَنتعشُ",
        source: "من الشعر الإيماني التراثي"
      },
      {
        type: "wisdom",
        label: "حكمة وأثر مأثور",
        prefix: "قال شيخ الإسلام ابن تيمية:",
        text: "الذكر للقلب مثل الماء للسمك، فكيف يكون حال السمك إذا فارق الماء؟",
        source: "الوابل الصيب"
      }
    ]
  },
  {
    category: "خواطر قرآنية",
    topic: "قربٌ لا تحجبه المسافات",
    content: "أجمل ما في علاقتك بالله أنك لا تحتاج إلى موعدٍ مسبق ولا إلى كلماتٍ منمّقة كي يسمعك. يكفي أن ينكسر خاطرك في صمت الليل، أو تفيض عينك بحاجةٍ عجزت عن شرحها للبشر، لتجد القرب الإلهي أسرع إليك من تنهيدتك. هو أقرب مما تظن، وأرحم مما تتخيل ✨",
    versePrefix: "قال تعالى:",
    verseText: "وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ ۖ أُجِيبُ دَعْوَةَ الدَّاعِ إِذَا دَعَانِ",
    surahName: "البقرة",
    verseNumber: "186",
    verseReference: "(البقرة : 186)",
    citations: [
      {
        type: "hadith",
        label: "حديث نبوي شريف",
        prefix: "قال رسول الله ﷺ:",
        text: "أَقْرَبُ مَا يَكُونُ الْعَبْدُ مِنْ رَبِّهِ وَهُوَ سَاجِدٌ، فَأَكْثِرُوا الدُّعَاءَ",
        source: "رواه مسلم (482)"
      },
      {
        type: "poetry",
        label: "بيت شعر",
        prefix: "قال الإمام الشافعي رحمه الله:",
        text: "أتهزأُ بالدعاءِ وتزدريهِ / وما تدري بما صنعَ الدعاءُ",
        source: "ديوان الإمام الشافعي"
      },
      {
        type: "wisdom",
        label: "حكمة وأثر مأثور",
        prefix: "قال عمر بن الخطاب رضي الله عنه:",
        text: "إني لا أحمل همّ الإجابة، ولكني أحمل همّ الدعاء؛ فإذا أُلهمتُ الدعاءَ فإن الإجابة معه.",
        source: "أثر مأثور"
      }
    ]
  },
  {
    category: "خواطر قرآنية",
    topic: "وعد الرضا بعد طول انتظار",
    content: "لا تنتظر عطاءً يسدّ حاجتك فحسب، بل انتظر جبراً يُنسيك مرارة ما مضى. وعد الله نبيه بالعطاء حتى يبلغ الرضا، وتلك سنة رحمته في عباده الصادقين؛ يعوضهم بجمالٍ يغمر أرواحهم حتى يقول القلب ممتناً: ما أجمل اختيارك يا رب 🌿",
    versePrefix: "قال تعالى:",
    verseText: "وَلَسَوْفَ يُعْطِيكَ رَبُّكَ فَتَرْضَىٰ",
    surahName: "الضحى",
    verseNumber: "5",
    verseReference: "(الضحى : 5)",
    citations: [
      {
        type: "hadith",
        label: "حديث قدسي شريف",
        prefix: "قال رسول الله ﷺ فيما يرويه عن ربه:",
        text: "أَنَا عِنْدَ ظَنِّ عَبْدِي بِي، وَأَنَا مَعَهُ إِذَا ذَكَرَنِي",
        source: "متفق عليه"
      },
      {
        type: "poetry",
        label: "بيت شعر",
        prefix: "من شعر الرضا:",
        text: "ولربّ نازلةٍ يضيقُ لها الفتى / ذرعاً وعند اللهِ منها المخرجُ",
        source: "الإمام الشافعي"
      },
      {
        type: "wisdom",
        label: "حكمة وأثر مأثور",
        prefix: "قال الحسن البصري رحمه الله:",
        text: "الرضا بابُ الله الأعظم، ومستراحُ العابدين، وجنةُ الدنيا لمن أيقن بحسن تدبير مولاه.",
        source: "من حكم السلف"
      }
    ]
  },
  {
    category: "خواطر قرآنية",
    topic: "سكينة التوكل وسط العواصف",
    content: "ليست القوة أن تملك كل الإجابات، بل أن تمضي في يومك مطمئناً لأن زمام أمرك بيد من لا يغفل ولا ينام. حين تضع ثقل التخطيط فوق أكتاف السعي الصادق وتسلّم النتيجة لله، يهدأ صخب القلق وتزهر في طريقك تيسيراتٌ مدهشة من حيث لا تحتسب ✨",
    versePrefix: "قال تعالى:",
    verseText: "وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ ۚ إِنَّ اللَّهَ بَالِغُ أَمْرِهِ ۚ قَدْ جَعَلَ اللَّهُ لِكُلِّ شَيْءٍ قَدْرًا",
    surahName: "الطلاق",
    verseNumber: "3",
    verseReference: "(الطلاق : 3)",
    citations: [
      {
        type: "hadith",
        label: "حديث نبوي شريف",
        prefix: "قال رسول الله ﷺ:",
        text: "لَوْ أَنَّكُمْ تَوَكَّلْتُمْ عَلَى اللَّهِ حَقَّ تَوَكُّلِهِ لَرَزَقَكُمْ كَمَا يَرْزُقُ الطَّيْرَ، تَغْدُو خِمَاصًا وَتَرُوحُ بِطَانًا",
        source: "رواه الترمذي (2344)"
      },
      {
        type: "poetry",
        label: "بيت شعر",
        prefix: "من شعر التوكل:",
        text: "توكّل على الرحمنِ في الأمرِ كلّهِ / فما خابَ حقاً من عليهِ توكّلا",
        source: "من الشعر العربي المأثور"
      },
      {
        type: "wisdom",
        label: "حكمة وأثر مأثور",
        prefix: "قال سعيد بن جبير رحمه الله:",
        text: "التوكل على الله جِماع الإيمان؛ سعيٌ بالجوارح، ويقينٌ بالقلب أن الرزق والتدبير بيد الله وحده.",
        source: "تفسير ابن كثير"
      }
    ]
  },
  {
    category: "قصص قرآنية ونبوية",
    topic: "يقين موسى أمام البحر",
    content: "وقف موسى عليه السلام بين بحرٍ هادرٍ يزأر أمامه وجيشٍ جرارٍ يطبق من خلفه؛ ارتجفت القلوب وصرخ القوم: «إنا لمدركون!» لكنّ نبيَّ اليقين لم يلتفت لضيق الأرض، بل رفع بصره إلى السماء بثباتٍ يشقّ الصخر: «كلا إن معي ربي سيهدين». وفي لحظة الصدق تلك، انكسر قانون البحر وانفلق الماء طريقاً يابساً للنجاة 🌊✨",
    versePrefix: "قال تعالى:",
    verseText: "قَالَ كَلَّا ۖ إِنَّ مَعِيَ رَبِّي سَيَهْدِينِ",
    surahName: "الشعراء",
    verseNumber: "62",
    verseReference: "(الشعراء : 62)",
    citations: [
      {
        type: "hadith",
        label: "حديث نبوي شريف",
        prefix: "قال رسول الله ﷺ لابن عباس:",
        text: "احْفَظِ اللَّهَ يَحْفَظْكَ، احْفَظِ اللَّهَ تَجِدْهُ تُجَاهَكَ، إِذَا سَأَلْتَ فَاسْأَلِ اللَّهَ، وَإِذَا اسْتَعَنْتَ فَاسْتَعِنْ بِاللَّهِ",
        source: "رواه الترمذي (2516)"
      },
      {
        type: "poetry",
        label: "بيت شعر",
        prefix: "من شعر اليقين:",
        text: "إذا كان عونُ اللهِ للمرءِ ناصراً / تهيّأ له من كلّ صعبٍ مرادهُ",
        source: "من الشعر العربي"
      },
      {
        type: "wisdom",
        label: "حكمة وأثر مأثور",
        prefix: "قال ابن القيم رحمه الله:",
        text: "من صدق في معية الله له، لم تضق به المسالك وإن أُغلقت أبواب الأرض كلها.",
        source: "مدارج السالكين"
      }
    ]
  },
  {
    category: "قصص قرآنية ونبوية",
    topic: "أدب الشكوى في نداء أيوب",
    content: "ثمانيةَ عشر عاماً من الفقد والمرض، ولم يتسرّب الضجر إلى لسان أيوب عليه السلام؛ بل صاغ أرقّ مناجاةٍ عرفها التاريخ: وصف ضعفه بكلمتين ثم استراح في كنف الرحمة قائلاً: «وأنت أرحم الراحمين». فتفجّرت تحت قدميه عين الشفاء، وعاد له أهله ومثلهم معهم جزاءً لجميل صبره 🌿",
    versePrefix: "قال تعالى:",
    verseText: "وَأَيُّوبَ إِذْ نَادَىٰ رَبَّهُ أَنِّي مَسَّنِيَ الضُّرُّ وَأَنتَ أَرْحَمُ الرَّاحِمِينَ",
    surahName: "الأنبياء",
    verseNumber: "83",
    verseReference: "(الأنبياء : 83)",
    citations: [
      {
        type: "hadith",
        label: "حديث نبوي شريف",
        prefix: "قال رسول الله ﷺ:",
        text: "مَا يُصِيبُ الْمُسْلِمَ مِنْ نَصَبٍ وَلَا وَصَبٍ وَلَا هَمٍّ وَلَا حُزْنٍ حَتَّى الشَّوْكَةِ يُشَاكُهَا، إِلَّا كَفَّرَ اللَّهُ بِهَا مِنْ خَطَايَاهُ",
        source: "رواه البخاري (5641)"
      },
      {
        type: "poetry",
        label: "بيت شعر",
        prefix: "من شعر الصبر:",
        text: "اصبرْ لكلّ مصيبةٍ وتجلّدِ / واعلمْ بأنّ الدهرَ غيرُ مخلّدِ",
        source: "علي بن أبي طالب (منسوب)"
      },
      {
        type: "wisdom",
        label: "حكمة وأثر مأثور",
        prefix: "قال ابن عطاء الله السكندري:",
        text: "كفى من أدب العبد مع ربه أن يعرض حاله عليه، ويدع التدبير لرحمته وحكمته.",
        source: "الحكم العطائية"
      }
    ]
  },
  {
    category: "قصص قرآنية ونبوية",
    topic: "برد اليقين في قلب النار",
    content: "أوقد القوم ناراً يضطرب لهيبها في السماء ووضعوا إبراهيم عليه السلام في كفّة المنجنيق؛ وفي الهواء بين السماء واللهب، لم يطلب العون من مخلوق بل نطق بكلمة التوحيد الخالصة: «حسبي الله ونعم الوكيل». فتنزّل الأمر العلوي يُبدّل طبائع الكون: «يا نار كوني برداً وسلاماً على إبراهيم» ✨",
    versePrefix: "قال تعالى:",
    verseText: "قُلْنَا يَا نَارُ كُونِي بَرْدًا وَسَلَامًا عَلَىٰ إِبْرَاهِيمَ",
    surahName: "الأنبياء",
    verseNumber: "69",
    verseReference: "(الأنبياء : 69)",
    citations: [
      {
        type: "hadith",
        label: "أثر نبوي صحيح",
        prefix: "عن ابن عباس رضي الله عنهما قال:",
        text: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ، قَالَهَا إِبْرَاهِيمُ عَلَيْهِ السَّلَامُ حِينَ أُلْقِيَ فِي النَّارِ، وَقَالَهَا مُحَمَّدٌ ﷺ حِينَ قَالُوا إِنَّ النَّاسَ قَدْ جَمَعُوا لَكُمْ",
        source: "رواه البخاري (4563)"
      },
      {
        type: "poetry",
        label: "بيت شعر",
        prefix: "من شعر التوحيد:",
        text: "إذا صحّ منك الودّ فالكلّ هيّنٌ / وكلّ الذي فوق الترابِ ترابُ",
        source: "أبو فراس الحمداني"
      },
      {
        type: "wisdom",
        label: "حكمة وأثر مأثور",
        prefix: "قال وهب بن منبه:",
        text: "من علّق قلبه بالله وحده، تحوّلت محنه إلى منح، وصارت نيران البلاء برداً وسلاماً على روحه.",
        source: "سير أعلام النبلاء"
      }
    ]
  },
  {
    category: "قصص قرآنية ونبوية",
    topic: "مفتاح الفرج في الظلمات",
    content: "انطبقت على يونس عليه السلام ثلاث ظلماتٍ متراكبة: ظلمة الليل، وظلمة البحر، وظلمة بطن الحوت؛ حيث لا صوت يسمع ولا سبب يُرجى. لكنّ تسبيحته الصادقة اخترقت أعماق اللجة وصعدت إلى السماء، فكانت نجاته درساً خالداً لكل مكروب أن التوحيد والتسبيح هما جسر الخروج من أشدّ الأزمات 🌿",
    versePrefix: "قال تعالى:",
    verseText: "فَنَادَىٰ فِي الظُّلُمَاتِ أَن لَّا إِلَٰهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ",
    surahName: "الأنبياء",
    verseNumber: "87",
    verseReference: "(الأنبياء : 87)",
    citations: [
      {
        type: "hadith",
        label: "حديث نبوي شريف",
        prefix: "قال رسول الله ﷺ:",
        text: "دَعْوَةُ ذِي النُّونِ إِذْ دَعَا وَهُوَ فِي بَطْنِ الْحُوتِ: لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ، فَإِنَّهُ لَمْ يَدْعُ بِهَا رَجُلٌ مُسْلِمٌ فِي شَيْءٍ قَطُّ إِلَّا اسْتَجَابَ اللَّهُ لَهُ",
        source: "رواه الترمذي (3505)"
      },
      {
        type: "poetry",
        label: "بيت شعر",
        prefix: "من شعر الرجاء:",
        text: "لا تيأسنّ وإن طالت مطالبةٌ / إذا استعنتَ بصبرٍ أن ترى فرجا",
        source: "أبو العتاهية"
      },
      {
        type: "wisdom",
        label: "حكمة وأثر مأثور",
        prefix: "قال ابن القيم رحمه الله:",
        text: "ما دُفعت شدائد الدنيا بمثل التوحيد والتسبيح والاعتراف بالتقصير بين يدي الله.",
        source: "الفوائد"
      }
    ]
  },
  {
    category: "تطوير الذات الإيماني",
    topic: "أجرٌ يتجاوز كل الحسابات",
    content: "المؤمن الناجح لا يقيس قوته بغياب العقبات، بل بثبات نفسه حين تشتد الرياح. الصبر الجميل مهارةٌ روحيةٌ تبنيها كل يوم: أن تمسك لسانك عند الغضب، وتواصل سعيك عند الفتور، وتحتسب تعبك عند الله. ابدأ اليوم بخطوةٍ واحدةٍ من الصبر الواعي، فلكل طاعةٍ ميزانٌ إلا الصبر؛ أجره مفتوحٌ بغير حساب ✨",
    versePrefix: "قال تعالى:",
    verseText: "إِنَّمَا يُوَفَّى الصَّابِرُونَ أَجْرَهُم بِغَيْرِ حِسَابٍ",
    surahName: "الزمر",
    verseNumber: "10",
    verseReference: "(الزمر : 10)",
    citations: [
      {
        type: "hadith",
        label: "حديث نبوي شريف",
        prefix: "قال رسول الله ﷺ:",
        text: "وَمَنْ يَتَصَبَّرْ يُصَبِّرْهُ اللَّهُ، وَمَا أُعْطِيَ أَحَدٌ عَطَاءً خَيْرًا وَأَوْسَعَ مِنَ الصَّبْرِ",
        source: "متفق عليه"
      },
      {
        type: "poetry",
        label: "بيت شعر",
        prefix: "من شعر الهمة:",
        text: "وَمَن يَتَهَيَّب صُعودَ الجِبالِ / يَعِش أَبَدَ الدَهرِ بَينَ الحُفَر",
        source: "أبو القاسم الشابي"
      },
      {
        type: "wisdom",
        label: "حكمة وأثر مأثور",
        prefix: "قال عمر بن الخطاب رضي الله عنه:",
        text: "وجدنا خير عيشنا بالصبر؛ فبالصبر تُنال المعالي وتستقيم النفوس.",
        source: "صحيح البخاري (معلقاً)"
      }
    ]
  },
  {
    category: "تطوير الذات الإيماني",
    topic: "يُسران يحتضنان عُسراً واحداً",
    content: "حين يضغط عليك تعب الأيام، غيّر زاوية نظرك من الشكوى إلى البناء: العسرُ واحدٌ ومؤقت، بينما اليسرُ مضاعفٌ وملازمٌ له. رتّب أولوياتك، استعن بالله، وقسّم مهمتك الثقيلة إلى خطواتٍ صغيرةٍ صادقة؛ فالمؤمن القوي يحوّل كل اختبارٍ إلى درجةِ نضجٍ وإنجاز 🌿",
    versePrefix: "قال تعالى:",
    verseText: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا ۝ إِنَّ مَعَ الْعُسْرِ يُسْرًا",
    surahName: "الشرح",
    verseNumber: "5-6",
    verseReference: "(الشرح : 5-6)",
    citations: [
      {
        type: "hadith",
        label: "حديث نبوي شريف",
        prefix: "قال رسول الله ﷺ:",
        text: "الْمُؤْمِنُ الْقَوِيُّ خَيْرٌ وَأَحَبُّ إِلَى اللَّهِ مِنَ الْمُؤْمِنِ الضَّعِيفِ، وَفِي كُلٍّ خَيْرٌ، احْرِصْ عَلَى مَا يَنْفَعُكَ وَاسْتَعِنْ بِاللَّهِ وَلَا تَعْجَزْ",
        source: "رواه مسلم (2664)"
      },
      {
        type: "poetry",
        label: "بيت شعر",
        prefix: "قال الإمام الشافعي رحمه الله:",
        text: "بقدرِ الكدّ تُكتسبُ المعالي / ومن طلبَ العلا سهرَ الليالي",
        source: "ديوان الإمام الشافعي"
      },
      {
        type: "wisdom",
        label: "حكمة وأثر مأثور",
        prefix: "قال ابن عباس رضي الله عنهما:",
        text: "لن يغلب عسرٌ يسرين؛ فاجعل عملك متصلاً وأملك بالله كبيراً.",
        source: "تفسير الطبري"
      }
    ]
  },
  {
    category: "أخلاق الإسلام",
    topic: "شجرة الكلمة الطيبة",
    content: "قبل أن تنطق بكلمة، تذكّر أنها بذرةٌ ستسقط في قلب إنسان: إما أن تُنبت فيه أملاً وطمأنينة، أو تترك فيه ندبةً لا يمحوها الزمن. الكلمة الطيبة خلقٌ نبيلٌ يرفع قدرك في السماء والأرض، ويحوّل لقاءاتنا اليومية إلى واحاتٍ من الرفق والاحترام والأمان ✨",
    versePrefix: "قال تعالى:",
    verseText: "أَلَمْ تَرَ كَيْفَ ضَرَبَ اللَّهُ مَثَلًا كَلِمَةً طَيِّبَةً كَشَجَرَةٍ طَيِّبَةٍ أَصْلُهَا ثَابِتٌ وَفَرْعُهَا فِي السَّمَاءِ",
    surahName: "إبراهيم",
    verseNumber: "24",
    verseReference: "(إبراهيم : 24)",
    citations: [
      {
        type: "hadith",
        label: "حديث نبوي شريف",
        prefix: "قال رسول الله ﷺ:",
        text: "وَالْكَلِمَةُ الطَّيِّبَةُ صَدَقَةٌ",
        source: "متفق عليه"
      },
      {
        type: "poetry",
        label: "بيت شعر",
        prefix: "من شعر الأخلاق:",
        text: "جراحاتُ السنانِ لها التئامٌ / ولا يلتامُ ما جرحَ اللسانُ",
        source: "عمرو بن معديكرب"
      },
      {
        type: "wisdom",
        label: "حكمة وأثر مأثور",
        prefix: "قال علي بن أبي طالب رضي الله عنه:",
        text: "اللسانُ سبعٌ إن أُطلق عقر، والكلمة الطيبة مفتاحُ القلوب المغلقة.",
        source: "نهج البلاغة والأدب التراثي"
      }
    ]
  },
  {
    category: "سيرة نبوية",
    topic: "رحمةٌ وسعت العالمين",
    content: "في أزقة المدينة المنورة لم تكن رحمته ﷺ خطبةً تُلقى، بل كانت مشهداً حياً تراه العيون: يطيل السجود حتى ينزل حفيده عن ظهره، ويخفّف الصلاة إذا سمع بكاء طفلٍ رأفةً بأمه، ويعفو يوم الفتح الأعظم عن خصوم الأمس قائلاً: «اذهبوا فأنتم الطلقاء». هكذا كان ﷺ نبعاً من الحنان الذي غيّر وجه التاريخ 🌿",
    versePrefix: "قال تعالى:",
    verseText: "وَمَا أَرْسَلْنَاكَ إِلَّا رَحْمَةً لِّلْعَالَمِينَ",
    surahName: "الأنبياء",
    verseNumber: "107",
    verseReference: "(الأنبياء : 107)",
    citations: [
      {
        type: "hadith",
        label: "حديث نبوي شريف",
        prefix: "قال رسول الله ﷺ:",
        text: "إِنَّمَا أَنَا رَحْمَةٌ مُهْدَاةٌ",
        source: "رواه الحاكم وصححه الألباني"
      },
      {
        type: "poetry",
        label: "بيت شعر",
        prefix: "قال حسان بن ثابت رضي الله عنه:",
        text: "وَأَحْسَنُ مِنْكَ لَمْ تَرَ قَطُّ عَيْنِي / وَأَجْمَلُ مِنْكَ لَمْ تَلِدِ النِّسَاءُ",
        source: "ديوان حسان بن ثابت"
      },
      {
        type: "wisdom",
        label: "حكمة وأثر مأثور",
        prefix: "قالت عائشة رضي الله عنها في وصفه ﷺ:",
        text: "كان خُلُقُه القرآنَ؛ يرضى لرضاه ويسخط لسخطه، ولم يكن فاحشاً ولا متفحشاً.",
        source: "رواه مسلم وأحمد"
      }
    ]
  },
  {
    category: "القدس والمسجد الأقصى",
    topic: "بوابة السماء وبركة الأرض",
    content: "من فوق صخرة القدس المشرفة عرج الحبيب ﷺ إلى السماوات العلا، وفي رحاب المسجد الأقصى اصطفّ الأنبياء خلفه في أعظم صلاةٍ شهدتها الأرض. تبقى القدس أولى القبلتين ومهوى أفئدة المؤمنين، شاهدةً على عهدٍ إيمانيٍّ راسخٍ وبركةٍ لا تنقطع مهما تعاقبت العصور ✨",
    versePrefix: "قال تعالى:",
    verseText: "سُبْحَانَ الَّذِي أَسْرَىٰ بِعَبْدِهِ لَيْلًا مِّنَ الْمَسْجِدِ الْحَرَامِ إِلَى الْمَسْجِدِ الْأَقْصَى الَّذِي بَارَكْنَا حَوْلَهُ",
    surahName: "الإسراء",
    verseNumber: "1",
    verseReference: "(الإسراء : 1)",
    citations: [
      {
        type: "hadith",
        label: "حديث نبوي شريف",
        prefix: "قال رسول الله ﷺ:",
        text: "لَا تُشَدُّ الرِّحَالُ إِلَّا إِلَى ثَلَاثَةِ مَسَاجِدَ: الْمَسْجِدِ الْحَرَامِ، وَمَسْجِدِ الرَّسُولِ ﷺ، وَمَسْجِدِ الْأَقْصَى",
        source: "متفق عليه"
      },
      {
        type: "poetry",
        label: "بيت شعر",
        prefix: "في حب القدس والأقصى:",
        text: "يا قدسُ يا محرابَ كلّ موحّدٍ / يا مسرى طهَ والمقامُ الأرفعُ",
        source: "من الشعر العربي في القدس"
      },
      {
        type: "wisdom",
        label: "حكمة وأثر مأثور",
        prefix: "من عهدة عمر بن الخطاب لأهل إيلياء:",
        text: "هذا ما أعطى عبدُ الله عمرُ أمير المؤمنين أهلَ إيلياء من الأمان؛ أماناً لأنفسهم وأموالهم وكنائسهم لا تُسكن ولا تُهدم.",
        source: "تاريخ الطبري"
      }
    ]
  },
  {
    category: "أحاديث نبوية",
    topic: "دفء الكفالة وجوار الجنة",
    content: "أشار الحبيب ﷺ بإصبعيه السبابة والوسطى وفرّج بينهما شيئاً يسيراً، ليقرّب للأفهام منزلةً لا تُقدّر بثمن! كفالة اليتيم ليست مالاً يُدفع من بعيد، بل هي حنانٌ يُرمّم انكسار اليُتم، وسندٌ يحفظ كرامة طفلٍ فتكون ثمرته أعظم جوارٍ في الجنة بجوار رسول الله ﷺ 🌿",
    versePrefix: "عن سهل بن سعد رضي الله عنه قال، قال رسول الله ﷺ:",
    verseText: "أَنَا وَكَافِلُ الْيَتِيمِ فِي الْجَنَّةِ هَكَذَا، وَأَشَارَ بِالسَّبَّابَةِ وَالْوُسْطَى وَفَرَّجَ بَيْنَهُمَا شَيْئًا",
    verseReference: "(رواه البخاري : 5304)",
    citations: [
      {
        type: "quran",
        label: "آية قرآنية داعمة",
        prefix: "قال تعالى:",
        text: "فَأَمَّا الْيَتِيمَ فَلَا تَقْهَرْ ۝ وَأَمَّا السَّائِلَ فَلَا تَنْهَرْ",
        source: "(الضحى : 9-10)"
      },
      {
        type: "poetry",
        label: "بيت شعر",
        prefix: "في جبر اليتيم:",
        text: "امسحْ دموعَ يتيمٍ باتَ منكسراً / فربّ مسحةِ عطفٍ تُورثُ الجننا",
        source: "من الشعر الإيماني"
      },
      {
        type: "wisdom",
        label: "حكمة وأثر مأثور",
        prefix: "قال أبو الدرداء رضي الله عنه:",
        text: "أدنِ اليتيم منك وامسح برأسه وأطعمه من طعامك، فإن ذلك يلين قلبك ويدركك حاجتك.",
        source: "الزهد للإمام أحمد"
      }
    ]
  },
  {
    category: "أحاديث نبوية",
    topic: "صدقة الوجه البشوش",
    content: "في مدرسة النبوة تتحوّل أبسط التفاصيل اليومية إلى عبادةٍ مثقلةٍ في الميزان! ابتسامةٌ صادقةٌ تلقى بها أخاك لا تكلّفك درهماً، لكنها تفتح أبواب المودة وتُذهب وحشة القلوب وتُكتب لك صدقةً جاريةً من صدقات الروح ✨",
    versePrefix: "عن أبي ذر الغفاري رضي الله عنه قال، قال رسول الله ﷺ:",
    verseText: "تَبَسُّمُكَ فِي وَجْهِ أَخِيكَ لَكَ صَدَقَةٌ، وَأَمْرُكَ بِالْمَعْرُوفِ وَنَهْيُكَ عَنِ الْمُنْكَرِ صَدَقَةٌ",
    verseReference: "(رواه الترمذي : 1956)",
    citations: [
      {
        type: "quran",
        label: "آية قرآنية داعمة",
        prefix: "قال تعالى:",
        text: "وَقُولُوا لِلنَّاسِ حُسْنًا",
        source: "(البقرة : 83)"
      },
      {
        type: "poetry",
        label: "بيت شعر",
        prefix: "من شعر البشاشة:",
        text: "بُشراكَ إن تلقَ الأنامَ ببسمةٍ / فالبشرُ في وجهِ الكريمِ عطاءُ",
        source: "من الشعر العربي"
      },
      {
        type: "wisdom",
        label: "حكمة وأثر مأثور",
        prefix: "قال عبد الله بن المبارك رحمه الله:",
        text: "حسن الخلق ثلاثة أشياء: بسط الوجه، وبذل المعروف، وكف الأذى.",
        source: "جامع العلوم والحكم"
      }
    ]
  },
  {
    category: "أحاديث نبوية",
    topic: "عشر سنوات بلا كلمة عتاب",
    content: "عشرُ سنين كاملة قضاها أنس بن مالك في بيت النبوة، في السفر والحضر والرخاء والشدة، فلم يسمع من النبي ﷺ كلمة تأفّف واحدة! هذا هو الميزان الحقيقي للرقيّ: كيف تعامل من هم تحت يدك في لحظات التعب حين لا يراقبك سوى الله 🌿",
    versePrefix: "عن أنس بن مالك رضي الله عنه قال:",
    verseText: "خَدَمْتُ رَسُولَ اللَّهِ ﷺ عَشْرَ سِنِينَ، فَمَا قَالَ لِي أُفٍّ قَطُّ، وَلَا قَالَ لِشَيْءٍ صَنَعْتُهُ لِمَ صَنَعْتَهُ، وَلَا لِشَيْءٍ تَرَكْتُهُ لِمَ تَرَكْتَهُ",
    verseReference: "(رواه مسلم : 2309)",
    citations: [
      {
        type: "quran",
        label: "آية قرآنية داعمة",
        prefix: "قال تعالى:",
        text: "وَإِنَّكَ لَعَلَىٰ خُلُقٍ عَظِيمٍ",
        source: "(القلم : 4)"
      },
      {
        type: "poetry",
        label: "بيت شعر",
        prefix: "قال الإمام البوصيري:",
        text: "فاقَ النبيّينَ في خَلقٍ وفي خُلُقٍ / ولم يدانوهُ في علمٍ ولا كرمِ",
        source: "قصيدة البردة"
      },
      {
        type: "wisdom",
        label: "حكمة وأثر مأثور",
        prefix: "قال الفضيل بن عياض رحمه الله:",
        text: "الرفق زينةُ المؤمن، وما وُضع في بيتٍ ولا قلبٍ إلا أضاءه بالسكينة والبركة.",
        source: "حلية الأولياء"
      }
    ]
  },
  {
    category: "فضائل الأعمال",
    topic: "صلاة الفجر وبدايات النور",
    content: "قبل أن تصخب الشوارع وتتسابق هموم النهار، يخرج أهل الفجر في سكينة السحر لتشهد ملائكة الليل والنهار وقوفهم بين يدي الله. من افتتح يومه بركعتي الفجر وتلاوة قرآنه، صار يومه كله في ذمة الله وحفظه، وسرى في وقته ورزقه نورٌ وبركةٌ لا تخطئها العين ✨",
    versePrefix: "قال تعالى:",
    verseText: "وَقُرْآنَ الْفَجْرِ ۖ إِنَّ قُرْآنَ الْفَجْرِ كَانَ مَشْهُودًا",
    surahName: "الإسراء",
    verseNumber: "78",
    verseReference: "(الإسراء : 78)",
    citations: [
      {
        type: "hadith",
        label: "حديث نبوي شريف",
        prefix: "قال رسول الله ﷺ:",
        text: "مَنْ صَلَّى الصُّبْحَ فَهُوَ فِي ذِمَّةِ اللَّهِ",
        source: "رواه مسلم (657)"
      },
      {
        type: "poetry",
        label: "بيت شعر",
        prefix: "في فضيلة الفجر:",
        text: "قمْ في الدجى واتلُ الكتابَ ولا تنمْ / فالفجرُ بابُ السعدِ والبركاتِ",
        source: "من الشعر الإيماني"
      },
      {
        type: "wisdom",
        label: "حكمة وأثر مأثور",
        prefix: "قال ابن القيم رحمه الله:",
        text: "غدوةُ الفجر وذكرُ الله فيها هما غذاء الروح وزادها الذي يقيها وهن النهار كله.",
        source: "زاد المعاد"
      }
    ]
  },
  {
    category: "مواسم الخير ورمضان",
    topic: "نفحات رمضان وعودة الروح",
    content: "يُقبل شهر رمضان كما يُقبل الغيث على أرضٍ عطشى، فيغسل أدران عامٍ كامل ويعيد للروح صفاءها المفقود. ليس الصيام إمساكاً عن الطعام فحسب، بل هو موسمٌ سماويٌّ تتنزّل فيه الرحمات، وتصفو فيه القلوب بتلاوة القرآن وقيام الأسحار ودمعة المناجاة الصادقة 🌙✨",
    versePrefix: "قال تعالى:",
    verseText: "شَهْرُ رَمَضَانَ الَّذِي أُنزِلَ فِيهِ الْقُرْآنُ هُدًى لِّلنَّاسِ وَبَيِّنَاتٍ مِّنَ الْهُدَىٰ وَالْفُرْقَانِ",
    surahName: "البقرة",
    verseNumber: "185",
    verseReference: "(البقرة : 185)",
    citations: [
      {
        type: "hadith",
        label: "حديث نبوي شريف",
        prefix: "قال رسول الله ﷺ:",
        text: "مَنْ صَامَ رَمَضَانَ إِيمَانًا وَاحْتِسَابًا، غُفِرَ لَهُ مَا تَقَدَّمَ مِنْ ذَنْبِهِ",
        source: "متفق عليه"
      },
      {
        type: "poetry",
        label: "بيت شعر",
        prefix: "في استقبال رمضان:",
        text: "أتى رمضانُ مزرعةُ العبادِ / لتطهيرِ القلوبِ من الفسادِ",
        source: "من الشعر الإسلامي المأثور"
      },
      {
        type: "wisdom",
        label: "حكمة وأثر مأثور",
        prefix: "قال ابن رجب الحنبلي رحمه الله:",
        text: "رمضان سوقٌ قام ثم انفضّ، ربح فيه من أقبل بقلبه على الله وتعرّض لنفحات رحمته.",
        source: "لطائف المعارف"
      }
    ]
  },
  {
    category: "الأدعية والمناجاة",
    topic: "بوابة الخير في نداء الفقر لله",
    content: "يا رب، إليك وحدك نرفع انكسارنا وحاجاتنا التي لم نُحسن شرحها لأحد. كما آويت موسى تحت ظل الشجرة حين ناجاك بافتقاره الصادق، افتح لنا يا كريم أبواب خيرك وبركتك، واجعل لنا من كل همٍّ فرجاً ومن كل ضيقٍ مخرجاً، إنك أنت الغني الرحيم 🌿",
    versePrefix: "قال تعالى:",
    verseText: "رَبِّ إِنِّي لِمَا أَنزَلْتَ إِلَيَّ مِنْ خَيْرٍ فَقِيرٌ",
    surahName: "القصص",
    verseNumber: "24",
    verseReference: "(القصص : 24)",
    citations: [
      {
        type: "hadith",
        label: "حديث نبوي شريف",
        prefix: "قال رسول الله ﷺ:",
        text: "إِنَّ رَبَّكُمْ حَيِيٌّ كَرِيمٌ، يَسْتَحْيِي مِنْ عَبْدِهِ إِذَا رَفَعَ يَدَيْهِ إِلَيْهِ أَنْ يَرُدَّهُمَا صِفْرًا",
        source: "رواه أبو داود والترمذي"
      },
      {
        type: "poetry",
        label: "بيت شعر",
        prefix: "من شعر المناجاة:",
        text: "يا من يرى ما في الضميرِ ويسمعُ / أنتَ المعدُّ لكلّ ما يُتوقّعُ",
        source: "أبو العتاهية"
      },
      {
        type: "wisdom",
        label: "حكمة وأثر مأثور",
        prefix: "قال ابن تيمية رحمه الله:",
        text: "كلما ازداد العبد افتقاراً إلى الله وذلّاً بين يديه، ازداد عزّاً وغنىً بالله عمّن سواه.",
        source: "مجموع الفتاوى"
      }
    ]
  },
  {
    category: "السكينة وجبر الخواطر",
    topic: "معيةٌ تبدّد كل وحشة",
    content: "هوّن على قلبك المُتعَب؛ فلستَ وحدك في هذه العاصفة، ولم تُترَك يوماً بلا سند. الكلمة التي ملأت الغار طمأنينةً في أحلك ساعات الخوف ما زالت تهمس لقلبك اليوم: «لا تحزن إن الله معنا». استودع ربك ما يثقلك، ونم قرير العين، فإن اللطيف يتولاك بلطفه الخفي ✨",
    versePrefix: "قال تعالى:",
    verseText: "لَا تَحْزَنْ إِنَّ اللَّهَ مَعَنَا ۖ فَأَنزَلَ اللَّهُ سَكِينَتَهُ عَلَيْهِ",
    surahName: "التوبة",
    verseNumber: "40",
    verseReference: "(التوبة : 40)",
    citations: [
      {
        type: "hadith",
        label: "حديث نبوي شريف",
        prefix: "قال رسول الله ﷺ:",
        text: "أَحَبُّ الْأَعْمَالِ إِلَى اللَّهِ عَزَّ وَجَلَّ سُرُورٌ تُدْخِلُهُ عَلَى مُسْلِمٍ، أَوْ تَكْشِفُ عَنْهُ كُرْبَةً",
        source: "رواه الطبراني وحسنه الألباني"
      },
      {
        type: "poetry",
        label: "بيت شعر",
        prefix: "من شعر السكينة:",
        text: "سيفتحُ اللهُ باباً كنتَ تحسبهُ / من شدّةِ اليأسِ لم يُخلقْ بمفتاحِ",
        source: "من الشعر العربي المأثور"
      },
      {
        type: "wisdom",
        label: "حكمة وأثر مأثور",
        prefix: "قال سفيان الثوري رحمه الله:",
        text: "ما رأيت عبادةً يتقرّب بها العبد إلى الله أعظم أثراً في القلوب من جبر الخواطر.",
        source: "من آثار السلف"
      }
    ]
  },
  {
    category: "بر الوالدين والأسرة",
    topic: "جناح الذل وأوسع أبواب الجنة",
    content: "أصغِ لصوت أمك حين تكرّر حديثها، وقبّل يد أبيك التي تعبت لتمنحك الأمان؛ فدفء البيت وبركة العمر معلّقان برضاهما. الوالدان هما الباب الأوسط للجنة الذي يُفتح لك وأنت في قلب بيتك، فاغتنم وجودهما بالرفق والبر والدعاء قبل أن تغدو ضحكتهما ذكرى تشتاق إليها 🌿",
    versePrefix: "قال تعالى:",
    verseText: "وَاخْفِضْ لَهُمَا جَنَاحَ الذُّلِّ مِنَ الرَّحْمَةِ وَقُل رَّبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا",
    surahName: "الإسراء",
    verseNumber: "24",
    verseReference: "(الإسراء : 24)",
    citations: [
      {
        type: "hadith",
        label: "حديث نبوي شريف",
        prefix: "قال رسول الله ﷺ:",
        text: "الْوَالِدُ أَوْسَطُ أَبْوَابِ الْجَنَّةِ، فَإِنْ شِئْتَ فَأَضِعْ ذَلِكَ الْبَابَ أَوِ احْفَظْهُ",
        source: "رواه الترمذي (1900)"
      },
      {
        type: "poetry",
        label: "بيت شعر",
        prefix: "في بر الوالدين:",
        text: "العيشُ ماضٍ فأكرمْ والديكَ به / والأمُّ أولى بإكرامٍ وإحسانِ",
        source: "أبو العلاء المعري"
      },
      {
        type: "wisdom",
        label: "حكمة وأثر مأثور",
        prefix: "قال ابن عباس رضي الله عنهما:",
        text: "إني لا أعلم عملاً أقرب إلى الله عز وجل من برّ الوالدة.",
        source: "الأدب المفرد للبخاري"
      }
    ]
  },
  {
    category: "حكايات من التاريخ الإسلامي",
    topic: "ميزان العدل في حضارتنا",
    content: "في ليلةٍ من ليالي المدينة، حمل أمير المؤمنين عمر بن الخطاب كيس الدقيق على كتفه ومضى في الظلام إلى خيمة أمٍ وأطفالها الجياع، وأوقد النار بنفسه حتى نضج الطعام وضحك الصغار! هكذا صنعت حضارتنا مجدها: حين كان العدل والرحمة سيرةً تمشي على الأرض قبل أن تُكتب في الدواوين ✨",
    versePrefix: "قال تعالى:",
    verseText: "إِنَّ اللَّهَ يَأْمُرُ بِالْعَدْلِ وَالْإِحْسَانِ وَإِيتَاءِ ذِي الْقُرْبَىٰ",
    surahName: "النحل",
    verseNumber: "90",
    verseReference: "(النحل : 90)",
    citations: [
      {
        type: "hadith",
        label: "حديث نبوي شريف",
        prefix: "قال رسول الله ﷺ:",
        text: "إِنَّ الْمُقْسِطِينَ عِنْدَ اللَّهِ عَلَى مَنَابِرَ مِنْ نُورٍ، الَّذِينَ يَعْدِلُونَ فِي حُكْمِهِمْ وَأَهْلِيهِمْ وَمَا وَلُوا",
        source: "رواه مسلم (1827)"
      },
      {
        type: "poetry",
        label: "بيت شعر",
        prefix: "قال حافظ إبراهيم في عمر رضي الله عنه:",
        text: "أمِنتَ لمّا أقمتَ العدلَ بينهُمُ / فنِمتَ نومَ قريرِ العينِ هانيها",
        source: "القصيدة العمرية"
      },
      {
        type: "wisdom",
        label: "حكمة وأثر مأثور",
        prefix: "قال عمر بن عبد العزيز رحمه الله:",
        text: "إن الله بعث محمداً ﷺ هادياً ولم يبعثه جابياً، وبالعدل تُعمّر البلاد وتطمئن القلوب.",
        source: "سيرة عمر بن عبد العزيز"
      }
    ]
  },
  {
    category: "بطولات إسلامية",
    topic: "ثبات الإيمان يوم حطين واليرموك",
    content: "لم تنتصر أمتنا يوماً بكثرة العدد ولا بلمعان السيوف، بل بقلوبٍ علّقت يقينها بالله وارتفعت فوق الخوف. حين وقف خالد بن الوليد في اليرموك وصلاح الدين في حطين، كان سلاحهم الأول إخلاص النية، ووحدة الصف، والرحمة عند النصر؛ فصنعوا ملاحم خالدة علّمت الدنيا أن العزة الحقّة تبدأ من قوة الروح قبل قوة السواعد ⚔️✨",
    versePrefix: "قال تعالى:",
    verseText: "كَم مِّن فِئَةٍ قَلِيلَةٍ غَلَبَتْ فِئَةً كَثِيرَةً بِإِذْنِ اللَّهِ ۗ وَاللَّهُ مَعَ الصَّابِرِينَ",
    surahName: "البقرة",
    verseNumber: "249",
    verseReference: "(البقرة : 249)",
    citations: [
      {
        type: "hadith",
        label: "حديث نبوي شريف",
        prefix: "قال رسول الله ﷺ:",
        text: "وَاعْلَمْ أَنَّ النَّصْرَ مَعَ الصَّبْرِ، وَأَنَّ الْفَرَجَ مَعَ الْكَرْبِ، وَأَنَّ مَعَ الْعُسْرِ يُسْرًا",
        source: "رواه أحمد وصححه الألباني"
      },
      {
        type: "poetry",
        label: "بيت شعر",
        prefix: "قال أبو تمام في البطولة والعزم:",
        text: "السيفُ أصدقُ أنباءً من الكتبِ / في حدّهِ الحدُّ بينَ الجدِّ واللعبِ",
        source: "ديوان أبي تمام"
      },
      {
        type: "wisdom",
        label: "حكمة وأثر مأثور",
        prefix: "من وصية عمر بن الخطاب لقادة الجيوش:",
        text: "إنما تنصرون بطاعتكم لربكم؛ فاحفظوا الله في سركم وعلانيتكم، ولا تظلموا ولا تغدروا.",
        source: "تاريخ الطبري"
      }
    ]
  },
  {
    category: "شخصيات إسلامية",
    topic: "بصيرة الصدّيق في ساعة الشدة",
    content: "تتجلّى معادن الرجال عند العواصف؛ فحين توفي النبي ﷺ وذهلت العقول، صعد أبو بكر الصديق المنبر بقلبٍ راسخٍ كالجبل ليُعيد للأمة توازنها بكلمته الخالدة: «من كان يعبد محمداً فإن محمداً قد مات، ومن كان يعبد الله فإن الله حيٌّ لا يموت». تلك هي الشخصية الإيمانية التي يُثبّت الله بها أمةً بأكملها 🌿",
    versePrefix: "قال تعالى:",
    verseText: "مِّنَ الْمُؤْمِنِينَ رِجَالٌ صَدَقُوا مَا عَاهَدُوا اللَّهَ عَلَيْهِ",
    surahName: "الأحزاب",
    verseNumber: "23",
    verseReference: "(الأحزاب : 23)",
    citations: [
      {
        type: "hadith",
        label: "حديث نبوي شريف",
        prefix: "قال رسول الله ﷺ في فضل أبي بكر:",
        text: "لَوْ كُنْتُ مُتَّخِذًا خَلِيلًا غَيْرَ رَبِّي لَاتَّخَذْتُ أَبَا بَكْرٍ خَلِيلًا، وَلَكِنْ أُخُوَّةُ الْإِسْلَامِ وَمَوَدَّتُهُ",
        source: "رواه البخاري (3656)"
      },
      {
        type: "poetry",
        label: "بيت شعر",
        prefix: "في مدح الصدق والثبات:",
        text: "على قدرِ أهلِ العزمِ تأتي العزائمُ / وتأتي على قدرِ الكرامِ المكارمُ",
        source: "أبو الطيب المتنبي"
      },
      {
        type: "wisdom",
        label: "حكمة وأثر مأثور",
        prefix: "قال بكر بن عبد الله المزني:",
        text: "ما سبقهم أبو بكر بكثرة صلاةٍ ولا صيام، ولكن بشيءٍ وقر في قلبه من الصدق واليقين.",
        source: "صفة الصفوة"
      }
    ]
  },
  {
    category: "عظماء الإسلام",
    topic: "حين يكون العلم عبادةً وعمارةً",
    content: "سَهرَ الإمام البخاري وابن الهيثم والزهراوي على ضوء السرج يبتغون وجه الله في كل حديثٍ يوثّقونه وكل اكتشافٍ ينفع الإنسانية، فخلّد الله أثرهم قروناً طويلة. إن العظماء الذين يجمعون بين الإخلاص وإتقان العلم لا تنقطع حياتهم بموتهم، بل تبقى آثارهم نهراً جارياً من النور والهداية 🌿",
    versePrefix: "قال تعالى:",
    verseText: "يَرْفَعِ اللَّهُ الَّذِينَ آمَنُوا مِنكُمْ وَالَّذِينَ أُوتُوا الْعِلْمَ دَرَجَاتٍ",
    surahName: "المجادلة",
    verseNumber: "11",
    verseReference: "(المجادلة : 11)",
    citations: [
      {
        type: "hadith",
        label: "حديث نبوي شريف",
        prefix: "قال رسول الله ﷺ:",
        text: "مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا، سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ",
        source: "رواه مسلم (2699)"
      },
      {
        type: "poetry",
        label: "بيت شعر",
        prefix: "قال الإمام الشافعي في شرف العلم:",
        text: "تعلّمْ فليسَ المرءُ يولدُ عالماً / وليسَ أخو علمٍ كمن هو جاهلُ",
        source: "ديوان الإمام الشافعي"
      },
      {
        type: "wisdom",
        label: "حكمة وأثر مأثور",
        prefix: "قال الإمام مالك بن أنس رحمه الله:",
        text: "ليس العلم بكثرة الرواية، وإنما العلم نورٌ يضعه الله في قلب من صدق في طلبه وعمل به.",
        source: "حلية الأولياء"
      }
    ]
  },
  {
    category: "تربية إيمانية",
    topic: "نقاء القلب في زمن الضجيج",
    content: "في صخب الحياة اليومية نعتني بمظاهرنا وننسى تفقّد أثمن ما نملك: سلامةُ القلب. قف مع نفسك دقيقةً كل مساء، واغسل صدرك من الغل والحسد والتعلّق بالزائل بالاستغفار والصفح؛ فمن استقام قلبه استقامت جوارحه، وما النجاة غداً إلا لمن أتى الله بقلبٍ سليم ✨",
    versePrefix: "قال تعالى:",
    verseText: "يَوْمَ لَا يَنفَعُ مَالٌ وَلَا بَنُونَ ۝ إِلَّا مَنْ أَتَى اللَّهَ بِقَلْبٍ سَلِيمٍ",
    surahName: "الشعراء",
    verseNumber: "88-89",
    verseReference: "(الشعراء : 88-89)",
    citations: [
      {
        type: "hadith",
        label: "حديث نبوي شريف",
        prefix: "قال رسول الله ﷺ:",
        text: "أَلَا وَإِنَّ فِي الْجَسَدِ مُضْغَةً، إِذَا صَلَحَتْ صَلَحَ الْجَسَدُ كُلُّهُ، وَإِذَا فَسَدَتْ فَسَدَ الْجَسَدُ كُلُّهُ، أَلَا وَهِيَ الْقَلْبُ",
        source: "متفق عليه"
      },
      {
        type: "poetry",
        label: "بيت شعر",
        prefix: "في تزكية النفس:",
        text: "أقبلْ على النفسِ واستكملْ فضائلها / فأنتَ بالنفسِ لا بالجسمِ إنسانُ",
        source: "أبو الفتح البستي"
      },
      {
        type: "wisdom",
        label: "حكمة وأثر مأثور",
        prefix: "قال الحسن البصري رحمه الله:",
        text: "تفقّد حلاوة الإيمان في ثلاثة أشياء: في الصلاة، وفي القرآن، وفي الذكر؛ فإن وجدتها فامضِ وأبشر، وإلا فاعلم أن بابك مغلق فعالجه.",
        source: "مدارج السالكين"
      }
    ]
  },
  {
    category: "شعر إسلامي",
    topic: "جمال الرضا وحسن الظن بالله",
    content: "في أبيات الرضا يتعانق الجمال اللغوي مع سكينة الإيمان: «دع الأيام تفعل ما تشاء، وطب نفساً إذا حكم القضاء». حين يسكن اليقين قلب المؤمن يصير شعره نبضاً من نور، يرى في اشتداد الليل بشارةَ فجرٍ قريب، وفي كل قدرٍ مكتوبٍ لطفاً خفياً يغسل الأحزان ويزهر فيه الأمل 🌿✨",
    versePrefix: "قال تعالى:",
    verseText: "وَعَسَىٰ أَن تَكْرَهُوا شَيْئًا وَهُوَ خَيْرٌ لَّكُمْ ۖ وَعَسَىٰ أَن تُحِبُّوا شَيْئًا وَهُوَ شَرٌّ لَّكُمْ ۗ وَاللَّهُ يَعْلَمُ وَأَنتُمْ لَا تَعْلَمُونَ",
    surahName: "البقرة",
    verseNumber: "216",
    verseReference: "(البقرة : 216)",
    citations: [
      {
        type: "poetry",
        label: "بيت شعر",
        prefix: "قال الإمام الشافعي رحمه الله:",
        text: "دعِ الأيامَ تفعلُ ما تشاءُ / وطبْ نفساً إذا حكمَ القضاءُ",
        source: "ديوان الإمام الشافعي"
      },
      {
        type: "hadith",
        label: "حديث نبوي شريف",
        prefix: "قال رسول الله ﷺ:",
        text: "ارْضَ بِمَا قَسَمَ اللَّهُ لَكَ تَكُنْ أَغْنَى النَّاسِ",
        source: "رواه الترمذي (2305)"
      },
      {
        type: "wisdom",
        label: "حكمة وأثر مأثور",
        prefix: "قال الفضيل بن عياض رحمه الله:",
        text: "من رضي بقضاء الله لم يضق صدره، وعاش في الدنيا في روضةٍ من الطمأنينة والغنى.",
        source: "حلية الأولياء"
      }
    ]
  },
];

/**
 * Return curated supporting citations (Hadith, Arabic poetry, Islamic wisdom) for any category.
 */
export function getDefaultCitationsForCategory(category?: string): SupportingCitation[] {
  if (category && category !== "موضوع تلقائي") {
    const found = PRESET_POSTS.find((p) => p.category === category);
    if (found?.citations?.length) {
      return found.citations;
    }
  }
  return PRESET_POSTS[0].citations;
}

/**
 * Retrieve a preset post based on the requested category or seed topic.
 */
export function getLocalFallbackPost(category?: string, seedTopic?: string): GeneratedPost {
  let matches = PRESET_POSTS;
  if (category && category !== "موضوع تلقائي") {
    matches = PRESET_POSTS.filter(p => p.category === category);
  }

  if (matches.length === 0) {
    matches = PRESET_POSTS;
  }

  let index = 0;
  if (seedTopic) {
    const hash = seedTopic.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    index = Math.abs(hash) % matches.length;
  } else {
    index = Math.floor(Math.random() * matches.length);
  }

  const selected = matches[index];
  const profile = getCategoryEditorialProfile(selected.category);
  return {
    topic: selected.topic,
    content: selected.content,
    versePrefix: selected.versePrefix,
    verseText: selected.verseText,
    surahName: selected.surahName,
    verseNumber: selected.verseNumber,
    verseReference: selected.verseReference,
    category: selected.category,
    narrationStyle: profile.narrationStyleName,
    citations: selected.citations,
  };
}

/**
 * Returns a semantically matched local Islamic artwork based on the Arabic topic keywords,
 * falling back to a deterministic artwork from LOCAL_ISLAMIC_ARTWORKS.
 */
export function getLocalFallbackImage(seedTopic?: string): string {
  if (seedTopic) {
    const normalized = seedTopic.trim();
    const semanticMatch = LOCAL_ISLAMIC_ARTWORKS.find((art) =>
      art.keywords.some((kw) => normalized.includes(kw))
    );
    if (semanticMatch) {
      return semanticMatch.src;
    }

    const hash = normalized.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return LOCAL_ISLAMIC_ARTWORKS[Math.abs(hash) % LOCAL_ISLAMIC_ARTWORKS.length].src;
  }

  return LOCAL_ISLAMIC_ARTWORKS[Math.floor(Math.random() * LOCAL_ISLAMIC_ARTWORKS.length)].src;
}
