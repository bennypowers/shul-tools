import {
  HDate,
  HebrewCalendar,
  Location,
  Zmanim,
  Event as HebCalEvent,
  flags,
} from '@hebcal/core';

export type ZmanimI18nKeys =
  Record<(typeof HebCal.ZMANIM_KEYS)[number], string>;

export interface I18nKeys extends ZmanimI18nKeys {
  shabbat: string;
  chag: string;
  zmanei: string;
  yom: string;
  and: string;
  zmaneiTefillah: string;
}

export interface HebCalInit {
  city: string;
  locale: string;
  latitude: number;
  longitude: number;
  tzeitAngle: number;
}

export class HebCal {
  static readonly THREE_MEDIUM_STARS = 7.083;

  static readonly THREE_SMALL_STARS = 8;

  static readonly ZMANIM_KEYS = [
    'alotHaShachar',
    'misheyakir',
    'sunrise',
    'sofZmanShmaMGA',
    'sofZmanShma',
    'sofZmanTfillaMGA',
    'sofZmanTfilla',
    'minchaGedola',
    'minchaKetana',
    'plagHaMincha',
    'sunset',
    'tzeit',
  ] as const;

  static i18n: Record<string, I18nKeys> = {
    'he-IL': {
      alotHaShachar: 'עלות השחר',
      misheyakir: 'משיכיר',
      sunrise: 'נץ',
      sofZmanShmaMGA: 'סוף זמן קריאת שמע (מג״א)',
      sofZmanShma: 'סוף זמן קריאת שמע (גר״א)',
      sofZmanTfillaMGA: 'סוף זמן תפילה (מג״א)',
      sofZmanTfilla: 'סוף זמן תפילה (גר״א)',
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
    }
  }

  static {
    this.i18n.he = this.i18n['he-IL'];
    this.i18n.en = this.i18n['en-US'];
    this.i18n['en-GB'] = this.i18n['en-US'];
  }

  date = new Date();

  locale = 'he-IL';

  city = 'Jerusalem';

  latitude: number;

  longitude: number;

  tzeitAngle = HebCal.THREE_MEDIUM_STARS;

  hDate: HDate;

  nextHDate: HDate;

  #location = Location.lookup(this.city);

  #zmanim = this.#getZmanim();

  dailyZmanim = this.#getDailyZmanim();

  eventsToday = this.#getTodayEvents();

  eventsTomorrow = this.#getTomorrowEvents();

  get i18n() { return HebCal.i18n[this.locale]; }

  get isShabbat() { return this.hDate.getDay() === 6; }

  get isErevShabbat() { return this.hDate.getDay() === 5; }

  get isChag() {
    for (const event of this.eventsToday) {
      if (event.getFlags() & flags.CHAG)
        return true
    }
    return false;
  }

  get isErevChag() {
    if (!this.isChag)
      return false;
    for (const event of this.eventsToday) {
      if (event.getFlags() & flags.EREV)
        return true
    }
    return false;
  }

  get isWeekday() {
    return this.hDate.getDay() < 6 && !this.isChag
  }

  get isRoshChodesh() {
    return this.eventsToday.at(0)
      ?.getFlags() & flags.ROSH_CHODESH;
  }

  get isCholHamoed() {
    return this.eventsToday.at(0)
      ?.getFlags() & flags.ROSH_CHODESH;
  }

  constructor({ locale, latitude, longitude, city, tzeitAngle }: HebCalInit) {
    this.date = new Date();
    this.locale = locale
    this.latitude = latitude;
    this.longitude = longitude;
    this.city = city;
    this.tzeitAngle = tzeitAngle;
    this.hDate = new HDate(this.date);
    const next = new Date(this.date)
          next.setDate(this.date.getDate() + 1);
    this.nextHDate = new HDate(next);
    this.#location = this.#getLocation();
    if (this.#location) {
      this.#zmanim = this.#getZmanim();
      this.eventsToday = this.#getTodayEvents();
      this.eventsTomorrow = this.#getTomorrowEvents();
      this.dailyZmanim = this.#getDailyZmanim();
      this.hDate = this.#getHDate();
    }
  }

  #getLocation() {
    const found = Location.lookup(this.city);
    if (this.latitude && this.longitude)
      return new Location(
        this.latitude,
        this.longitude,
        found?.getIsrael(),
        found?.getTzid(),
        found?.getName(),
        found?.getCountryCode(),
        found?.getGeoId(),
      );
    else
      return found
  }

  #getZmanim(): Zmanim {
    return new Zmanim(
      this.date,
      this.#location.getLatitude(),
      this.#location.getLongitude(),
    );
  }

  #getEvents(start = this.date, end = this.date): HebCalEvent[] {
    return HebrewCalendar.calendar({
      location: this.#location,
      start,
      end,
      candlelighting: true,
      candleLightingMins: 40,
      havdalahDeg: this.tzeitAngle,
      il: this.locale.endsWith('IL'),
      locale: this.locale.match(/^(he|en)$/) ? this.locale : 'he',
      sedrot: true,
      omer: true,
      shabbatMevarchim: true,
      molad: true,
      yomKippurKatan: true,
      dailyLearning: {
        dafYomi: true,
        yerushalmi: 2,
        mishnaYomi: true,
      }
    });
  }

  #getTodayEvents(): HebCalEvent[] {
    return this.#getEvents();
  }

  #getTomorrowEvents(): HebCalEvent[] {
    const date = new Date(this.date);
          date.setDate(date.getDate() + 1);
    return this.#getEvents(this.date, date);
  }

  #getDailyZmanim() {
    this.#zmanim ??= this.#getZmanim();
    const now = this.date;
    const dz = HebCal.ZMANIM_KEYS.map(key => {
      const date = this.#zmanim[key](...key === 'tzeit' ? [this.tzeitAngle] : []);
      const past = date < now;
      return {
        key,
        date,
        past,
        next: false,
      }
    });
    dz.forEach((z, i) => {
      if (dz.at(i - 1)?.past && !z.past)
        z.next = true;
    });
    return dz;
  }

  #getHDate(): HDate {
    return new HDate(this.date);
  }
}

