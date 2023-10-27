import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import { HDate, HebrewCalendar, Location, Zmanim, Event as HebCalEvent, flags } from '@hebcal/core';
import { consume, createContext, provide } from '@lit/context';

const ZMANIM_KEYS = [
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

type ZmanimI18nKeys = Record<(typeof ZMANIM_KEYS)[number], string>;

interface I18nKeys extends ZmanimI18nKeys {
  shabbat: string;
  chag: string;
  zmanei: string;
  yom: string;
  and: string;
}

export const hebCalContext = createContext<HebCal>('hebcal');

@customElement('heb-cal')
export class HebCal extends LitElement {
  static styles = [
    css`
      time {
        font-family: monospace;
      }
    `,
  ];

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
    }
  }

  static {
    this.i18n.he = this.i18n['he-IL'];
    this.i18n.en = this.i18n['en-US'];
    this.i18n['en-GB'] = this.i18n['en-US'];
  }

  @property()
  accessor locale = 'he-IL'

  @property()
  accessor city = 'Jerusalem';

  @property({ type: Number, attribute: 'tzeit-angle' })
  accessor tzeitAngle = 7.083;

  @property({ type: Number, attribute: 'candles-minutes-before-sundown' })
  accessor candlesMinutesBeforeSundown: number;

  @property({ type: Number, attribute: 'havdala-minutes-after-nightfall' })
  accessor havdalaMinutesAfterNightfall: number;

  @state() accessor now = new Date();

  #location = Location.lookup(this.city);

  #zmanim = this.#getZmanim();

  dailyZmanim = this.#getDailyZmanim();

  events = this.#getEvents();

  hDate = this.#getHDate();

  get i18n() { return HebCal.i18n[this.locale]; }

  get isShabbat() { return this.hDate.getDay() === 6; }

  get isErevShabbat() { return this.hDate.getDay() === 5; }

  get isChag() {
    for (const event of this.events) {
      if (event.getFlags() & flags.CHAG)
        return true
    }
    return false;
  }

  get isErevChag() {
    if (!this.isChag)
      return false;
    for (const event of this.events) {
      if (event.getFlags() & flags.EREV)
        return true
    }
    return false;
  }

  @provide({ context: hebCalContext })
  protected accessor context = this;

  connectedCallback() {
    super.connectedCallback();
    setInterval(() => this.requestUpdate(), 1000);
  }

  protected willUpdate(): void {
    this.updateZmanim();
  }

  render() {
    const locale = this.locale.substring(0, 2);
    const timeZoneName = new Intl.DateTimeFormat(locale, { timeZoneName: 'long' })
      .formatToParts(this.now)
      .find(x => x.type === "timeZoneName")?.value??'';
    return html`
      <time part="now" datetime="${this.now.toISOString()}">
        <strong class="time">${this.now.toLocaleTimeString(locale, { timeStyle: 'medium' })},</strong>
        <span class="date">${this.hDate?.render(locale)}</span>
        <small>${timeZoneName}</small>
      </time>
      <slot></slot>
    `;
  }

  updateZmanim() {
    this.now = new Date();
    this.#location = this.#getLocation();
    if (this.#location) {
      this.#zmanim = this.#getZmanim();
      this.events = this.#getEvents();
      this.dailyZmanim = this.#getDailyZmanim();
      this.hDate = this.#getHDate();
      this.requestUpdate();
    }
  }

  #getLocation() {
    return Location.lookup(this.city);;
  }

  #getZmanim(): Zmanim {
    return new Zmanim(
      this.now,
      this.#location.getLatitude(),
      this.#location.getLongitude(),
    );
  }

  #getEvents(): HebCalEvent[] {
    const start = this.now;
    const end = new Date(start)
    end.setDate(start.getDate() + 1);
    return HebrewCalendar.calendar({
      location: this.#location,
      start,
      end,
      candlelighting: true,
      candleLightingMins: 40,
      havdalahDeg: this.tzeitAngle,
      il: this.locale.endsWith('IL'),
    });
  }

  #getDailyZmanim() {
    const me = this;
    const dz = ZMANIM_KEYS.map(key => {
      const date = this.#zmanim[key](...key === 'tzeit' ? [this.tzeitAngle] : []);
      const past = date < me.now;
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
    return new HDate(this.now);
  }
}

export class HebCalChild extends LitElement {
  static styles = [
    css`
      :host {
        display: block;
      }

      dl {
        display: grid;
        grid-template-columns: max-content auto;
      }

      dl > div {
        display: contents;
        font-size: var(--size, initial);
      }

      dt {
        font-family: sans;
        text-align: left;
      }

      dd {
        font-family: sans-serif;
        font-weight: bold;
      }

      .past :is(dt, dd) {
        opacity: 0.5;
      }

      .next {
        --size: 120%;
      }
    `,
  ];

  @consume({ context: hebCalContext })
  accessor hebcal: HebCal;

  get i18n() {
    return this.hebcal.i18n;
  }
}

