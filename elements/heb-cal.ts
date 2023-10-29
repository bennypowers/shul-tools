import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import { consume, createContext, provide } from '@lit/context';

import { HebCal, type I18nKeys } from './HebCal.js';

import styles from './heb-cal.css';

import childStyles from './heb-cal-child.css';

const context = createContext<HebCal>('hebcal');

@customElement('heb-cal')
export class HebCalElement extends LitElement {
  static styles = [styles];

  @property()
  accessor locale = 'he-IL'

  @property()
  accessor city = 'Jerusalem';

  @property({ type: Number })
  accessor latitude?: number;

  @property({ type: Number })
  accessor longitude?: number;

  @property({ type: Number, attribute: 'tzeit-angle' })
  accessor tzeitAngle = 7.083;

  @property({ type: Number, attribute: 'candles-minutes-before-sundown' })
  accessor candlesMinutesBeforeSundown: number;

  @property({ type: Number, attribute: 'havdala-minutes-after-nightfall' })
  accessor havdalaMinutesAfterNightfall: number;

  @state()
  @provide({ context })
  accessor #hebcal = this.#getHebcal();

  connectedCallback() {
    super.connectedCallback();
    setInterval(this.#refresh, 1000);
  }

  render() {
    const { date: now, hDate: today, locale } = this.#hebcal;
    const locale2Digit = locale.substring(0, 2);
    const timeZoneName = new Intl.DateTimeFormat(locale, { timeZoneName: 'long' })
      .formatToParts(now)
      .find(x => x.type === 'timeZoneName')?.value ?? '';
    return html`
      <time part="now" datetime="${now.toISOString()}">
        <strong class="time">${now.toLocaleTimeString(locale, { timeStyle: 'medium' })},</strong>
        <span class="date">${today?.render(locale2Digit)}</span>
        <small>${timeZoneName}</small>
      </time>
      <slot></slot>
    `;
  }

  #refresh = () => this.#hebcal = this.#getHebcal();

  #getHebcal() {
    const { city, longitude, latitude, tzeitAngle } = this;
    return new HebCal({
      city,
      locale,
      latitude,
      longitude,
      tzeitAngle,
    });
  }
}

export class HebCalChild extends LitElement {
  static styles = [childStyles];

  @consume({ context: context })
  accessor hebcal: HebCal;

  get i18n(): I18nKeys {
    return this.hebcal.i18n;
  }
}

