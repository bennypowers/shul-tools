import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import { consume, createContext, provide } from '@lit/context';

import { observes } from './lib/decorators.js';

import { HebCalDay } from './HebCalDay.js';

import sharedStyles from './shared.css'

import styles from './hebcal-day.css';

import childStyles from './hebcal-consumer.css';
import { ClockController } from './lib/ClockController.js';
import { DateConverter } from './lib/DateConverter.js';

const context = createContext<HebCalDay>('hebcal');

@customElement('hebcal-day')
export class HebcalDay extends LitElement {
  static styles = [sharedStyles, styles];

  /**
   * Locale for translating strings.
   * Currently, `he-IL` and `en-US` are supported.
   */
  @property()
  accessor locale = 'he-IL'

  /**
   * City whence to lookup zmanim
   * @see https://github.com/hebcal/hebcal-es6/tree/main#locationlookupname--location
   */
  @property()
  accessor city = 'Jerusalem';

  /** setting latitude and longitude overrides `city` */
  @property({ type: Number })
  accessor latitude: number | undefined;

  /** setting latitude and longitude overrides `city` */
  @property({ type: Number })
  accessor longitude: number | undefined;

  /**
   * Angle at which to establish nightfall
   * @see https://github.com/hebcal/hebcal-es6/tree/main#zmanimtzeitangle--date
   */
  @property({
    type: Number,
    attribute: 'tzeit-degrees',
  }) accessor tzeitDegrees: number | undefined;

  /**
   * Number of minutes before *shkia* when Shabbat candles are lit.
   * Customarily 18 minutes outside of Jerusalem, and 40 minutes in Jerusalem
   */
  @property({
    type: Number,
    attribute: 'candle-lighting-minutes-before-sunset',
  }) accessor candleLightingMinutesBeforeSunset: 18 | 40;

  /**
   * Number of minutes after sunset when Shabbat is customarily ended.
   */
  @property({
    type: Number,
    attribute: 'havdalah-minutes-after-sunset',
  }) accessor havdalahMinutesAfterSunset = 0;

  @property({
    type: Number,
    attribute: 'havdalah-degrees',
  }) accessor havdalahDegrees = 0;

  /**
   * When set, hebcal elements will display information for the specific date
   */
  @property({
    converter: DateConverter,
    reflect: true,
    attribute: 'specific-date',
  }) accessor specificDate: Date | undefined;

  /** @internal */
  #clock = new ClockController(this, '#clock' as keyof HebcalDay);

  @property({ reflect: true, type: Boolean })
  accessor debug = false;

  /**
   * Shared object representing the current (or selected) Hebrew calendar day
   */
  @state()
  @provide({ context })
  accessor hayom = this.#getHebcalDay();

  get date() { return this.#clock.date; }
  set date(date: Date) { this.#clock.set(date); }

  override render() {
    return html`
      <slot></slot>
    `;
  }

  @observes('specificDate') #debugDateChanged(old: { specificDate?: Date }) {
    if (old.specificDate && !this.specificDate) {
      this.#clock.reset();
      this.#clock.start();
    } else {
      this.#clock.stop();
      this.#clock.set(this.specificDate);
      this.requestUpdate('#clock' as keyof HebcalDay, old.specificDate);
    }
  }

  @observes(
    '#clock' as keyof HebcalDay,
    'candleLightingMinutesBeforeSunset',
    'date',
    'debug',
    'havdalahDegrees',
    'havdalahMinutesAfterSunset',
    'tzeitDegrees',
  ) #dateChanged() {
    this.hayom = this.#getHebcalDay();
  }

  #getHebcalDay() {
    const {
      date, debug,
      city, longitude, latitude, locale,
      tzeitDegrees,
      candleLightingMinutesBeforeSunset,
    } = this;
    const havdalahMins = this.havdalahMinutesAfterSunset || undefined;
    const havdalahDeg = this.havdalahDegrees || undefined;
    return new HebCalDay({
      date,
      debug,
      city, locale,
      latitude, longitude,

      tzeitDeg: tzeitDegrees,
      candleLightingMins: candleLightingMinutesBeforeSunset,
      havdalahMins,
      havdalahDeg,
    });
  }
}

export class HebcalDayConsumer extends LitElement {
  static styles = [sharedStyles, childStyles];

  /**
   * Shared object representing the current (or selected) Hebrew calendar day
   */
  @consume({ context, subscribe: true })
  accessor hayom: HebCalDay;
}

declare global {
  interface HTMLElementTagNameMap {
    'hebcal-day': HebcalDay;
  }
}
