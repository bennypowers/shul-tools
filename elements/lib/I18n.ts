import type { ZmanimI18nKeys } from "./DailyZmanim.js";

export interface I18nKeys extends ZmanimI18nKeys {
  shabbat: string;
  chag: string;
  zmanei: string;
  yom: string;
  and: string;
  zmaneiTefillah: string;
  days: string[];
}

export class I18n {
  static readonly i18n: Record<string, I18nKeys> = {
    'he-IL': {
      alotHaShachar: 'עלות השחר',
      misheyakir: 'משיכיר',
      sunrise: 'נץ',
      sofZmanShmaMGA: 'סזק״ש (מג״א)',
      sofZmanShma: 'סזק״ש (גר״א)',
      sofZmanTfillaMGA: 'ס״ז תפילה (מג״א)',
      sofZmanTfilla: 'ס״ז תפילה (גר״א)',
      sunset: 'שקיעה',
      minchaGedola: 'מנחה גדולה',
      minchaKetana: 'מנחה קטנה',
      plagHaMincha: 'פלג המנחה',
      tzeit: 'צאת הכוכבים',
      shabbat: 'שבת',
      chag: 'יום טוב',
      zmanei: 'זמני',
      yom: 'יום',
      and: 'ו',
      zmaneiTefillah: 'זמני תפילה',
      days: [
        'יום ראשון',
        'יום שני',
        'יום שלישי',
        'יום רביעי',
        'יום חמישי',
        'יום שישי',
        'יום שבת קודש',
      ]
    },
    'en-US': {
      alotHaShachar: 'dawn',
      misheyakir: 'misheyakir',
      sunrise: 'sunrise',
      sofZmanShmaMGA: 'Latest Shema (Gr"a)',
      sofZmanShma: 'Latest Shema (Magen Avraham)',
      sofZmanTfillaMGA: 'Latest Tefillah (Gr"a)',
      sofZmanTfilla: 'Latest Tefillah (Magen Avraham)',
      sunset: 'sunset',
      minchaGedola: 'mincha gedola',
      minchaKetana: 'mincha ketana',
      plagHaMincha: 'plag hamincha',
      tzeit: 'nightfall',
      shabbat: 'Shabbat',
      chag: 'Yom Tov',
      zmanei: 'Halachic Times for',
      yom: 'Today',
      and: 'and ',
      zmaneiTefillah: 'Prayer times',
      days: [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Shabbat',
      ]
    }
  }

  static {
    this.i18n.he = this.i18n['he-IL'];
    this.i18n.en = this.i18n['en-US'];
    this.i18n['en-GB'] = this.i18n['en-US'];
  }

  #keys: I18nKeys;

  constructor(public locale: string) {
    this.#keys = I18n.i18n[locale];
  }

  get(key: 'days'): string[]
  get(key: Exclude<keyof I18nKeys, 'days'>): string
  get(key: keyof I18nKeys): string|string[] {
    switch (key) {
      case 'days':
        return this.#keys[key] as string[]
      default:
        return this.#keys[key] as string;
    }
  }
}
