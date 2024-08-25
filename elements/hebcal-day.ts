import { LitElement, html, type PropertyValueMap, type PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import { ContextRoot, createContext, consume, provide } from '@lit/context';

import { observes, clock } from './lib/decorators.js';

import { HebCalDay } from './lib/HebCalDay.js';

import sharedStyles from './shared.css'

import styles from './hebcal-day.css';

import childStyles from './hebcal-consumer.css';
import { DateConverter } from './lib/DateConverter.js';

const context = createContext<HebCalDay>('hebcal');

const root = new ContextRoot();
root.attach(document.documentElement);

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

  /**
   * City whence to lookup zmanim
   * @see https://github.com/hebcal/hebcal-es6/tree/main#locationlookupname--location
   */
  @property({ type: Number })
  accessor elevation: number | undefined = 784

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

  @clock accessor date: Date;

  @property({ reflect: true, type: Boolean })
  accessor debug = false;

  /**
   * Shared object representing the current (or selected) Hebrew calendar day
   */
  @state()
  @provide({ context })
  accessor hayom = this.#getHebcalDay();

  override render() {
    return html`
      <slot></slot>
    `;
  }

  @observes('specificDate')
  #specificDateChanged(old: { specificDate?: Date }) {
    if (old.specificDate && !this.specificDate) {
      clock.reset(this);
      clock.start(this);
    } else {
      clock.stop(this);
      clock.set(this, this.specificDate);
    }
  }

  @observes(
    'candleLightingMinutesBeforeSunset',
    'date',
    'debug',
    'havdalahDegrees',
    'havdalahMinutesAfterSunset',
    'longitude',
    'latitude',
    'elevation',
    'city',
    'tzeitDegrees',
  ) #dateChanged() {
    this.hayom = this.#getHebcalDay();
  }

  #getHebcalDay() {
    const {
      debug,
      city, longitude, latitude, elevation, locale,
      tzeitDegrees,
      candleLightingMinutesBeforeSunset,
    } = this;
    const havdalahMins = this.havdalahMinutesAfterSunset || undefined;
    const havdalahDeg = this.havdalahDegrees || undefined;
    return new HebCalDay({
      date: this.specificDate,
      debug,
      city, locale,
      latitude, longitude, elevation,

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

  override shouldUpdate(changed: PropertyValues<this>): boolean {
    return !!this.hayom;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'hebcal-day': HebcalDay;
  }
}
