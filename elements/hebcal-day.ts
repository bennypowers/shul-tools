import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import { consume, createContext, provide } from '@lit/context';

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

  @state()
  @provide({ context })
  accessor hayom = this.#getHebcalDay();

  #interval?:number;

  override connectedCallback() {
    super.connectedCallback();
    this.#interval = window.setInterval(this.#refresh, 1000);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    window.clearInterval(this.#interval)
  }

  override render() {
    return html`
      <slot></slot>
    `;
  }

  #refresh = () =>
    this.hayom = this.#getHebcalDay();

  #getHebcalDay() {
    const { city, longitude, latitude, locale, tzeitAngle } = this;
    return new HebCalDay({
      city, locale, tzeitAngle,
      latitude, longitude,
    });
  }
}

export class HebcalDayConsumer extends LitElement {
  static styles = [sharedStyles, childStyles];

  @consume({ context, subscribe: true }) accessor hayom: HebCalDay;
}

