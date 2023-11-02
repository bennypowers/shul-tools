import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import { consume, createContext, provide } from '@lit/context';

import { observes } from '../lib/decorators.js';

import { HebCalDay } from './HebCalDay.js';

import sharedStyles from './shared.css'

import styles from './hebcal-day.css';

import childStyles from './hebcal-consumer.css';

const context = createContext<HebCalDay>('hebcal');

@customElement('hebcal-day')
export class HebcalDay extends LitElement {
  static styles = [sharedStyles, styles];

  @property()
  accessor locale = 'he-IL'

  @property()
  accessor city = 'Jerusalem';

  @property({ type: Number })
  accessor latitude: number | undefined;

  @property({ type: Number })
  accessor longitude: number | undefined;

  @property({ type: Number, attribute: 'tzeit-angle' })
  accessor tzeitAngle: number | undefined;

  @property({ type: Number, attribute: 'candles-minutes-before-sundown' })
  accessor candlesMinutesBeforeSundown: number;

  @property({ type: Number, attribute: 'havdala-minutes-after-nightfall' })
  accessor havdalaMinutesAfterNightfall: number;

  @property({ type: Date }) accessor date = new Date();

  /** @internal */
  @state() accessor debugDate: Date | undefined;

  @state()
  @provide({ context })
  accessor hayom = this.#getHebcalDay();

  #interval?:number;

  override connectedCallback() {
    super.connectedCallback();
    this.#startTicking();
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.#stopTicking();
  }

  override render() {
    return html`
      <slot></slot>
    `;
  }

  #startTicking() {
    this.#interval = window.setInterval(this.#tick, 1000);

    this.#tick();
  }

  #stopTicking() {
    if (this.#interval)
      window.clearInterval(this.#interval)
    this.#interval = undefined;
  }

  @observes('debugDate')
  #debugDateChanged(old?: Date) {
    if (old && !this.debugDate)
      this.#startTicking();
    else {
      this.#stopTicking();
      this.date = this.debugDate;
    }
  }

  @observes('date')
  #dateChanged() {
    this.hayom = this.#getHebcalDay();
  }

  #tick = () =>
    this.date = new Date();

  #getHebcalDay() {
    const { city, date, longitude, latitude, locale, tzeitAngle } = this;
    return new HebCalDay({
      date,
      city, locale, tzeitAngle,
      latitude, longitude,
    });
  }
}

export class HebcalDayConsumer extends LitElement {
  static styles = [sharedStyles, childStyles];

  @consume({ context, subscribe: true }) accessor hayom: HebCalDay;
}
