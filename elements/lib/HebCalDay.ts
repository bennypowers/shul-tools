import { I18n } from './I18n.js';
import { DailyZmanim } from './DailyZmanim.js';
import { GeoLocation } from '@hebcal/noaa';

import {
  flags,
  type Event as HebCalEvent,
  DailyLearning,
  HDate,
  HebrewCalendar,
  Location as HebCalLocation,
  HavdalahEvent,
  ParshaEvent,
  CandleLightingEvent,
  OmerEvent,
} from '@hebcal/core';

import { THREE_SMALL_STARS } from './constants.js';

import '@hebcal/learning';

interface HebCalInitBase {
  debug?: boolean;
  date: Date,
  city: string;
  locale: string;
  latitude: number;
  longitude: number;
  elevation: number;
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

function isOmerEvent(x: HebCalEvent): x is OmerEvent {
  return x instanceof OmerEvent;
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
  i18n: I18n;

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

  readonly events: HebCalEvent[];

  readonly eventsToday: HebCalEvent[];

  readonly eventsTomorrow: HebCalEvent[];

  readonly timeParts: Record<'hour' | 'minute' | 'second' | 'timeZoneName' | 'dayPeriod', string>;

  readonly midnight: Date;

  readonly daf: HebCalEvent;

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

  get isOmer() {
    return this.events.some(isOmerEvent);
  }

  get omer(): OmerEvent {
    return this.events.find((x): x is OmerEvent => isOmerEvent(x) && x.getDate().isSameDate(this.hDate));
  }

  #location: HebCalLocation;

  #geoLocation: GeoLocation;

  constructor(options: HebCalInit) {
    this.debug = options.debug;
    this.date = options.date ?? new Date();
    this.midnight = new Date(this.date);
    this.midnight.setHours(0)
    this.midnight.setMinutes(0)
    this.midnight.setSeconds(0)
    this.midnight.setMilliseconds(0);
    this.timeParts = this.#getTimeParts();
    this.locale = options.locale ?? this.locale
    this.i18n = new I18n(this.locale);
    this.latitude = options.latitude;
    this.longitude = options.longitude;
    this.elevation = options.elevation;
    this.city = options.city;
    this.tzeitDeg = options.tzeitDeg ?? this.tzeitDeg;

    this.candleLightingMins = options.candleLightingMins;

    if ('havdalahMins' in options && options.havdalahMins != null)
      this.havdalahMins = options.havdalahMins;
    else if ('havdalahDeg' in options && options.havdalahDeg != null && !this.havdalahMins)
      this.havdalahDeg = options.havdalahDeg;
    else
      this.havdalahDeg = options.tzeitDeg;

    this.#location = this.#getLocation();
    this.#geoLocation = this.#getGeoLocation();
    if (!this.#location)
      throw new Error(`Could not determine location for ${options.city ?? `${options.latitude}/${options.longitude}`}`);

    this.hDate = new HDate(options.date);

    this.dailyZmanim = new DailyZmanim(this.hDate, this.date, this.#geoLocation, this.tzeitDeg);

    if (this.dailyZmanim.isPast('tzeit'))
      this.hDate = this.hDate.add(1);

    this.nextHDate = this.hDate.add(1);

    this.events = this.#getEvents();
    this.eventsToday = this.events.filter(x => x.getDate().isSameDate(this.hDate));
    this.eventsTomorrow = this.events.filter(x => x.getDate().isSameDate(this.hDate.add(1)));
    this.parsha = this.#getParshah();
    this.candles = this.#getCandles();
    this.daf = DailyLearning.lookup('dafYomi', this.hDate, this.locale.endsWith('IL'));
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
    const end = start.add(7);
    const { havdalahDeg, havdalahMins, candleLightingMins } = this;
    const events = HebrewCalendar.calendar({
      location,
      useElevation: this.elevation != null,
      start, end,
      candlelighting: true,
      candleLightingMins,
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
    return events
  }

  #getParshah(): ParshaEvent {
    return this.events.find(isParshaEvent)
  }

  // TODO: rosh hashannnah meshulash
  #getCandles(): CandleLightingInfo {
    let check =
      this.isChag || this.isErevChag || this.isShabbat || this.isErevShabbat ? this.hDate.subtract(1)
    : this.hDate;
    const lighting = this.#getEvents(check).find(isCandleLightingEvent);
    const havdalah = this.#getEvents(check).find(isHavdalahEvent);
    const categories = lighting.getCategories();
    return {
      categories,
      lighting,
      havdalah,
    };
  }
}

