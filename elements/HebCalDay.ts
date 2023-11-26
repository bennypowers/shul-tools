import { DailyZmanim, ZmanimI18nKeys } from './DailyZmanim.js';
import { GeoLocation } from '@hebcal/noaa';

import {
  type Event as HebCalEvent,
  flags,
  HDate,
  HebrewCalendar,
  Location as HebCalLocation,
  ParshaEvent,
  CandleLightingEvent,
  HavdalahEvent,
} from '@hebcal/core';
import { THREE_SMALL_STARS } from './constants.js';

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

function isParshaEvent(x: HebCalEvent): x is ParshaEvent {
  return x instanceof ParshaEvent;
}

function isCandleLightingEvent(x: HebCalEvent): x is CandleLightingEvent {
  return x instanceof CandleLightingEvent;
}

function isHavdalahEvent(x: HebCalEvent): x is HavdalahEvent {
  return x instanceof HavdalahEvent;
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

  elevation: number;

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

  #location: HebCalLocation;

  #geoLocation: GeoLocation;

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
    this.#geoLocation = this.#getGeoLocation();
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

  #getGeoLocation() {
    return new GeoLocation(
      this.city ?? null,
      this.#location.getLatitude(),
      this.#location.getLongitude(),
      this.#location.getElevation(),
      this.#location.getTzid(),
    );
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
        this.elevation ?? found?.getElevation(),
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
      this.#geoLocation,
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

