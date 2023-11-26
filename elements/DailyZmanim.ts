import type { GeoLocation } from '@hebcal/noaa';

import { Zmanim } from '@hebcal/core';
import { THREE_MEDIUM_STARS } from './constants.js';

export type ZmanimKey = typeof DailyZmanim.ZMANIM_KEYS[number];

export type ZmanimI18nKeys =
  Record<ZmanimKey, string>;

export interface ZmanInfo {
  date: Date,
  past: boolean,
  next: boolean,
}

export class DailyZmanim {
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
    geoLocation: GeoLocation,
    tzeitDeg = THREE_MEDIUM_STARS,
  ) {
    const zmanim = new Zmanim(geoLocation, now);
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

