import {
  HDate,
  HebrewCalendar,
  Location as HebCalLocation,
  Zmanim,
  Event as HebCalEvent,
  flags,
} from '@hebcal/core';

export type ZmanimKey = typeof HebCalDay.ZMANIM_KEYS[number];

export type ZmanimI18nKeys =
  Record<ZmanimKey, string>;

export interface I18nKeys extends ZmanimI18nKeys {
  shabbat: string;
  chag: string;
  zmanei: string;
  yom: string;
  and: string;
  zmaneiTefillah: string;
}

export interface HebCalInit {
  date: Date,
  city: string;
  locale: string;
  latitude: number;
  longitude: number;
  tzeitAngle: number;
}

export interface DailyZman {
  key: ZmanimKey,
  date: Date,
  past: boolean,
  next: boolean,
}

export class HebCalDay implements Record<ZmanimKey, Date> {
  static readonly THREE_MEDIUM_STARS = 7.083;

  static readonly THREE_SMALL_STARS = 8.5;

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

  date: Date;

  locale = 'he-IL';

  city: string;

  latitude: number;

  longitude: number;

  tzeitAngle = HebCalDay.THREE_SMALL_STARS;

  alotHaShachar: Date;
  misheyakir: Date;
  sunrise: Date;
  sofZmanShmaMGA: Date;
  sofZmanShma: Date;
  sofZmanTfillaMGA: Date;
  sofZmanTfilla: Date;
  minchaGedola: Date;
  minchaKetana: Date;
  plagHaMincha: Date;
  sunset: Date;
  tzeit: Date;

  hDate: HDate;

  nextHDate: HDate;

  #location: HebCalLocation

  #zmanim: Zmanim;

  dailyZmanim: DailyZman[];

  eventsToday: HebCalEvent[];

  eventsTomorrow: HebCalEvent[];

  get i18n() { return HebCalDay.i18n[this.locale]; }

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

  timeParts: Record<'hour' | 'minute' | 'second' | 'timeZoneName' | 'dayPeriod', string>;

  midnight: Date;

  constructor({ date, locale, latitude, longitude, city, tzeitAngle }: HebCalInit) {
    this.date = date;
    this.midnight = new Date(date);
    this.midnight.setHours(0)
    this.midnight.setMinutes(0)
    this.midnight.setSeconds(0)
    this.midnight.setMilliseconds(0);
    this.timeParts = this.#getTimeParts();
    this.locale = locale ?? this.locale
    this.latitude = latitude;
    this.longitude = longitude;
    this.city = city;
    this.tzeitAngle = tzeitAngle ?? this.tzeitAngle;
    this.hDate = new HDate(this.date);
    const next = new Date(this.date)
          next.setDate(this.date.getDate() + 1);
    this.nextHDate = new HDate(next);
    this.#location = this.#getLocation();
    if (!this.#location)
      throw new Error(`Could not determine location for ${city ?? `${latitude}/${longitude}`}`);
    this.#zmanim = this.#getZmanim();
    this.eventsToday = this.#getTodayEvents();
    this.eventsTomorrow = this.#getTomorrowEvents();
    this.dailyZmanim = this.#getDailyZmanim();
  }

  #getTimeParts() {
    const [
      { value: hour },
      { value: minute },
      { value: second },
      { value: timeZoneName },
    ] = new Intl.DateTimeFormat(this.locale, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'long',
    }).formatToParts(this.date).filter(x => x.type !== 'literal');
    const dayPeriod = this.date.getHours() < 12 ? 'am' : 'pm';
    return { hour, minute, second, timeZoneName, dayPeriod };
  }

  #getLocation() {
    const found = HebCalLocation.lookup(this.city);
    if (this.latitude && this.longitude)
      return new HebCalLocation(
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
    const location = this.#location;
    /** Hebcals' locale isn't an iso locale, but a pronunciation hint */
    const locale = this.locale.match(/^(he|en)$/) ? this.locale : 'he';
    return HebrewCalendar.calendar({
      location,
      start, end,
      candlelighting: true,
      candleLightingMins: 40,
      havdalahDeg: this.tzeitAngle,
      il: this.locale.endsWith('IL'),
      locale,
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

  #getDailyZmanim(): DailyZman[] {
    const { date: now, tzeitAngle } = this;
    const zmanim = this.#zmanim
    let lastSeenIsPast = false
    return HebCalDay.ZMANIM_KEYS.map(key => {
      const date = zmanim[key](...key === 'tzeit' ? [tzeitAngle] : []);
      const past = date < now;
      const next = lastSeenIsPast && !past;
      lastSeenIsPast = past && !next
      this[key] = date;
      return {
        key,
        date,
        past,
        next,
      }
    });
  }
}

