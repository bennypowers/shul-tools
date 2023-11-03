import type { ZmanimKey } from './HebCal.js';

import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';

import { HebcalDayConsumer } from './hebcal-day.js';

import { classMap } from 'lit/directives/class-map.js';

import styles from './hebcal-clock.css';

const MS_PER_CLOCK_FACE = 1000 * 60 * 60 * 24;

/**
 * Hebcal clock
 */
@customElement('hebcal-clock')
export class HebcalClock extends HebcalDayConsumer {
  static styles = [styles];

  /**
   * Digital clocks display the current 24-hour time
   * as well as the hebrew date, and the seasonal clock (winter / summer)
   */
  @property({ reflect: true })
  accessor type: 'digital' | 'analogue' = 'digital';

  override render() {
    const { date } = this.hayom;
    const { hour, minute, second, dayPeriod } = this.hayom.timeParts;

    return html`
      <time datetime="${date.toISOString()}"
            style="${styleMap(this.#getTimeStyles())}">${this.type === 'digital' ? html`
        <strong part="time" dir="ltr">

          <span part="hour">${hour}</span>
          <span part="colon">:</span>
          <span part="minute">${minute}</span>
          <span part="colon">:</span>
          <span part="second">${second}</span>
        </strong>` : html`
        <div id="face"
             class="${classMap({ [dayPeriod]: true })}"
             style="${styleMap(this.#getAngleStyles())}"></div>
        <div id="second" class="hand"></div>
        <div id="minute" class="hand"></div>
        <div id="hour"   class="hand"></div>
        <ul id="indices">
          <li>•</li>
          <li>•</li>
          <li class="num">3</li>
          <li>•</li>
          <li>•</li>
          <li class="num">6</li>
          <li>•</li>
          <li>•</li>
          <li class="num">9</li>
          <li>•</li>
          <li>•</li>
          <li class="num">12</li>
        </ul>`}
      </time>
    `;
  }

  #calcAngle(key: ZmanimKey): string {
    const date = this.hayom.dailyZmanim.get(key);
    const ms = date.getTime();
    const epochMidnight = this.hayom.midnight.getTime();
    const hourOffset = this.hayom.timeParts.dayPeriod === 'pm' ? 12 : 0;
    const offsetMs = ms - epochMidnight - (hourOffset * 1000 * 60 * 60);
    const ratio = (offsetMs / MS_PER_CLOCK_FACE);
    const degrees = (ratio * 360) * 2;
    return `${degrees.toFixed(2)}deg`;
  }

  // from midnight to noon, only show dawn and sunrise
  // from noon to midnight, only show sunset and nightfall
  #getAngleStyles() {
    if (this.type === 'digital') return {}
    switch (this.hayom.timeParts.dayPeriod) {
      case 'am': return {
        '--angle-twilight-start': this.#calcAngle('alotHaShachar'),
        '--angle-twilight-end': this.#calcAngle('sunrise'),
      };
      case 'pm': return {
        '--angle-twilight-start': this.#calcAngle('sunset'),
        '--angle-twilight-end': this.#calcAngle('tzeit'),
      };
    }
  }

  #getTimeStyles() {
    const { hour, minute, second } = this.hayom.timeParts;
    return {
      '--second': second,
      '--minute': minute,
      '--hour': hour,
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'hebcal-clock': HebcalClock;
  }
}
