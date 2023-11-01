import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import { consume, createContext, provide } from '@lit/context';

import { HebCal } from './HebCal.js';

import sharedStyles from './shared.css'

import styles from './heb-cal.css';

import childStyles from './heb-cal-child.css';

const context = createContext<HebCal>('hebcal');

@customElement('heb-cal')
export class HebCalElement extends LitElement {
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
  accessor tzeitAngle = 7.083;

  @property({ type: Number, attribute: 'candles-minutes-before-sundown' })
  accessor candlesMinutesBeforeSundown: number;

  @property({ type: Number, attribute: 'havdala-minutes-after-nightfall' })
  accessor havdalaMinutesAfterNightfall: number;

  @state()
  @provide({ context })
  accessor hebcal = this.#getHebcal();

  connectedCallback() {
    super.connectedCallback();
    setInterval(this.#refresh, 1000);
  }

  static #findPart(parts: Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPart['type']) {
    return parts.find(x => x.type === type)?.value ?? '';
  }

  render() {
    const { date, locale } = this.hebcal;
    const parts = new Intl.DateTimeFormat(locale, { timeZoneName: 'long', hour: '2-digit', minute: '2-digit', second: '2-digit' }).formatToParts(date);
    const hour = HebCalElement.#findPart(parts, 'hour');
    const minute = HebCalElement.#findPart(parts, 'minute');
    const second = HebCalElement.#findPart(parts, 'second');
    const timeZoneName = HebCalElement.#findPart(parts, 'timeZoneName');

    return html`
      <time part="today"
            datetime="${date.toISOString()}">
        <strong part="time" dir="ltr">
          <span part="hour">${hour}</span>
          <span part="colon">:</span>
          <span part="minute">${minute}</span>
          <span part="colon">:</span>
          <span part="second">${second}</span>
        </strong>
        <small part="time-zone">${timeZoneName}</small>
      </time>

      <slot></slot>
    `;
  }

  #refresh = () => this.hebcal = this.#getHebcal();

  #getHebcal() {
    const { city, longitude, latitude, locale, tzeitAngle } = this;
    return new HebCal({
      city, locale,
      latitude, longitude,
      tzeitAngle,
    });
  }
}

export class HebCalChild extends LitElement {
  static styles = [sharedStyles, childStyles];

  @consume({ context, subscribe: true }) accessor hebcal: HebCal;
}

