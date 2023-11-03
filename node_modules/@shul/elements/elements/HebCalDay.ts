import {
  type Event as HebCalEvent,
  HDate,
  HebrewCalendar,
  Location as HebCalLocation,
  Zmanim,
  ParshaEvent,
  CandleLightingEvent,
  HavdalahEvent,
} from '@hebcal/core';

/**
 * Holiday flags for Event.
 * copied from hebcal src because i hate typescript sometimes
 * @readonly
 * @enum {number}
 */
const flags = {
  /** Chag, yontiff, yom tov */
  CHAG: 0x000001,
  /** Light candles 18 minutes before sundown */
  LIGHT_CANDLES: 0x000002,
  /** End of holiday (end of Yom Tov)  */
  YOM_TOV_ENDS: 0x000004,
  /** Observed only in the Diaspora (chutz l'aretz)  */
  CHUL_ONLY: 0x000008,
  /** Observed only in Israel */
  IL_ONLY: 0x000010,
  /** Light candles in the evening at Tzeit time (3 small stars) */
  LIGHT_CANDLES_TZEIS: 0x000020,
  /** Candle-lighting for Chanukah */
  CHANUKAH_CANDLES: 0x000040,
  /** Rosh Chodesh, beginning of a new Hebrew month */
  ROSH_CHODESH: 0x000080,
  /** Minor fasts like Tzom Tammuz, Ta'anit Esther, ... */
  MINOR_FAST: 0x000100,
  /** Shabbat Shekalim, Zachor, ... */
  SPECIAL_SHABBAT: 0x000200,
  /** Weekly sedrot on Saturdays */
  PARSHA_HASHAVUA: 0x000400,
  /** Daily page of Talmud (Bavli) */
  DAF_YOMI: 0x000800,
  /** Days of the Omer */
  OMER_COUNT: 0x001000,
  /** Yom HaShoah, Yom HaAtzma'ut, ... */
  MODERN_HOLIDAY: 0x002000,
  /** Yom Kippur and Tish'a B'Av */
  MAJOR_FAST: 0x004000,
  /** On the Saturday before Rosh Chodesh */
  SHABBAT_MEVARCHIM: 0x008000,
  /** Molad */
  MOLAD: 0x010000,
  /** Yahrzeit or Hebrew Anniversary */
  USER_EVENT: 0x020000,
  /** Daily Hebrew date ("11th of Sivan, 5780") */
  HEBREW_DATE: 0x040000,
  /** A holiday that's not major, modern, rosh chodesh, or a fast day */
  MINOR_HOLIDAY: 0x080000,
  /** Evening before a major or minor holiday */
  EREV: 0x100000,
  /** Chol haMoed, intermediate days of Pesach or Sukkot */
  CHOL_HAMOED: 0x200000,
  /** Mishna Yomi */
  MISHNA_YOMI: 0x400000,
  /** Yom Kippur Katan, minor day of atonement on the day preceeding each Rosh Chodesh */
  YOM_KIPPUR_KATAN: 0x800000,
  /** Daily page of Jerusalem Talmud (Yerushalmi) */
  YERUSHALMI_YOMI: 0x1000000,
  /** Nach Yomi */
  NACH_YOMI: 0x2000000
};

export type ZmanimKey = typeof DailyZmanim.ZMANIM_KEYS[number];

export type ZmanimI18nKeys =
  Record<ZmanimKey, string>;

export interface I18nKeys extends ZmanimI18nKeys {
  shabbat: string;
  chag: string;
  zmanei: string;
  yom: string;
  and: string;
  zmaneiTefillah: string;
  days: string[];
}

interface HebCalInitBase {
  debug?: boolean;
  date: Date,
  city: string;
  locale: string;
  latitude: number;
  longitude: number;
  tzeitDeg: number;
  candleLightingMins: number,
}

export type HebCalInit = HebCalInitBase & ({
  havdalahMins: number,
} | {
  havdalahDeg: number,
});

export interface CandleLightingInfo {
  categories: string[];
  lighting: CandleLightingEvent;
  havdalah: HavdalahEvent
}

export interface ZmanInfo {
  date: Date,
  past: boolean,
  next: boolean,
}

function isParshaEvent(x: HebCalEvent): x is ParshaEvent {
  return x instanceof ParshaEvent;
}

function isCandleLightingEvent(x: HebCalEvent): x is CandleLightingEvent {
  return x instanceof CandleLightingEvent;
}

function isHavdalahEvent(x: HebCalEvent): x is HavdalahEvent {
  return x instanceof HavdalahEvent;
}


const THREE_MEDIUM_STARS = 7.083;

const THREE_SMALL_STARS = 8.5;

class DailyZmanim {
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

  readonly alotHaShachar: Date;

  readonly misheyakir: Date;

  readonly sunrise: Date;

  readonly sofZmanShmaMGA: Date;

  readonly sofZmanShma: Date;

  readonly sofZmanTfillaMGA: Date;

  readonly sofZmanTfilla: Date;

  readonly minchaGedola: Date;

  readonly minchaKetana: Date;

  readonly plagHaMincha: Date;

  readonly sunset: Date;

  readonly tzeit: Date;

  #keys = new Map<ZmanimKey, ZmanInfo>();

  constructor(
    now: Date,
    lat: number,
    long: number,
    tzeitDeg = THREE_MEDIUM_STARS,
  ) {
    const zmanim = new Zmanim(now, lat, long);
    let lastSeenIsPast = false
    for (const key of DailyZmanim.ZMANIM_KEYS) {
      const date = zmanim[key](...key === 'tzeit' ? [tzeitDeg] : []);
      const past = date < now;
      const next = lastSeenIsPast && !past;
      lastSeenIsPast = past && !next
      this.#keys.set(key, { date, past, next });
    }
  }

  get(key: ZmanimKey) { return this.#keys.get(key)?.date; }

  isPast(key: ZmanimKey) { return this.#keys.get(key)?.past; }

  isNext(key: ZmanimKey) { return this.#keys.get(key)?.next; }

  map<A>(fn: (
    x?: ZmanInfo & { key: ZmanimKey },
    i?: number,
    a?: (ZmanInfo & { key: ZmanimKey })[],
  ) => A): A[] {
    return Array.from(
      this.#keys.entries(),
      ([key, { date, next, past }]) => ({ key, date, next, past }),
    ).map(fn);
  }
}

export class HebCalDay {
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

  debug = false;

  date: Date;

  locale = 'he-IL';

  city: string;

  latitude: number;

  longitude: number;

  tzeitDeg = THREE_SMALL_STARS;

  candleLightingMins: number;

  havdalahMins: number;

  havdalahDeg: number;

  readonly hDate: HDate;

  readonly nextHDate: HDate;

  readonly parsha: ParshaEvent;

  readonly candles: CandleLightingInfo;

  readonly dailyZmanim: DailyZmanim;

  readonly eventsToday: HebCalEvent[];

  readonly eventsTomorrow: HebCalEvent[];

  readonly timeParts: Record<'hour' | 'minute' | 'second' | 'timeZoneName' | 'dayPeriod', string>;

  readonly midnight: Date;

  get i18n() { return HebCalDay.i18n[this.locale]; }

  get isShabbat() { return this.hDate.getDay() === 6; }

  get isErevShabbat() { return this.hDate.getDay() === 5; }

  get isChag() {
    return this.eventsToday.length && this.eventsToday.every(x => x.mask & flags.CHAG);
  }

  get isErevChag() {
    return this.eventsToday.length && this.eventsToday.every(x => x.mask & flags.EREV & flags.CHAG);
  }

  get isWeekday() {
    return this.hDate.getDay() < 6 && !this.isChag
  }

  get isRoshChodesh() {
    return this.eventsToday.length && this.eventsToday.every(x => x.mask & flags.ROSH_CHODESH);
  }

  get isCholHamoed() {
    return this.eventsToday.length && this.eventsToday.every(x => x.mask & flags.CHOL_HAMOED);
  }

  #location: HebCalLocation

  constructor(options: HebCalInit) {
    this.debug = options.debug;
    this.date = options.date;
    this.midnight = new Date(options.date);
    this.midnight.setHours(0)
    this.midnight.setMinutes(0)
    this.midnight.setSeconds(0)
    this.midnight.setMilliseconds(0);
    this.timeParts = this.#getTimeParts();
    this.locale = options.locale ?? this.locale
    this.latitude = options.latitude;
    this.longitude = options.longitude;
    this.city = options.city;
    this.tzeitDeg = options.tzeitDeg ?? this.tzeitDeg;

    this.candleLightingMins = options.candleLightingMins;

    if ('havdalahMins' in options && options.havdalahMins != null)
      this.havdalahMins = options.havdalahMins;
    else if ('havdalahDeg' in options && options.havdalahDeg != null && !this.havdalahMins)
      this.havdalahDeg = options.havdalahDeg;
    else
      this.havdalahDeg = options.tzeitDeg;

    this.hDate = new HDate(this.date);
    const next = new Date(this.date)
          next.setDate(this.date.getDate() + 1);
    this.nextHDate = new HDate(next);
    this.#location = this.#getLocation();
    if (!this.#location)
      throw new Error(`Could not determine location for ${options.city ?? `${options.latitude}/${options.longitude}`}`);
    this.eventsToday = this.#getTodayEvents();
    this.eventsTomorrow = this.#getTomorrowEvents();
    this.dailyZmanim = this.#getDailyZmanim();
    this.parsha = this.#getParshah();
    this.candles = this.#getCandles();
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

  #getEvents(start = this.hDate): HebCalEvent[] {
    const location = this.#location;
    /** Hebcals' locale isn't an iso locale, but a pronunciation hint */
    const locale = this.locale.match(/^(he|en)$/) ? this.locale : 'he';
    const end = start;
    const { havdalahDeg, havdalahMins } = this;
    return HebrewCalendar.calendar({
      location,
      start, end,
      candlelighting: true,
      candleLightingMins: 40,
      havdalahDeg,
      havdalahMins,
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
    return this.#getEvents(this.hDate.add(1));
  }

  #getDailyZmanim(): DailyZmanim {
    return new DailyZmanim(
      this.date,
      this.#location.getLatitude(),
      this.#location.getLongitude(),
      this.tzeitDeg,
    );
  }

  #getParshah(): ParshaEvent {
    let parsha: ParshaEvent;
    let check = this.hDate;
    while (!(parsha = this.#getEvents(check).find(isParshaEvent)))
      check = check.add(1);
    return parsha;
  }

  // TODO: rosh hashannnah meshulash
  #getCandles(): CandleLightingInfo {
    let check =
      this.isChag || this.isErevChag || this.isShabbat || this.isErevShabbat ? this.hDate.subtract(1) : this.hDate;
    let lighting = this.#getEvents(check).find(isCandleLightingEvent);
    while (!lighting) {
      check = check.add(1);
      lighting = this.#getEvents(check).find(isCandleLightingEvent);
    }

    const categories = lighting.getCategories();
    let havdalah = this.#getEvents(lighting.getDate()).find(isHavdalahEvent)
    if (!havdalah)
      havdalah = this.#getEvents(lighting.getDate().add(1)).find(isHavdalahEvent)

    return {
      categories,
      lighting,
      havdalah,
    };
  }
}

