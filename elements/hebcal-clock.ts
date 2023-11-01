import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';

import { HebcalDayConsumer } from './hebcal-day.js';

import styles from './hebcal-clock.css';

const MS_PER_CLOCK_FACE = 1000 * 60 * 60 * 24;

/**
 * Hebcal clock
 *
 */
@customElement('hebcal-clock')
export class HebcalClock extends HebcalDayConsumer {
  static styles = [styles];

  static #findPart(parts: Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPart['type']) {
    return parts.find(x => x.type === type)?.value ?? '';
  }

  @property({ reflect: true }) accessor type: 'digital' | 'analogue' = 'digital';

  #parts: Record<'hour'|'minute'|'second'|'timeZoneName', string>;

  override willUpdate() {
    this.#parts = this.#getTimeParts()
  }

  override render() {
    const { date, locale, hDate } = this.hayom;
    const { hour, minute, second, timeZoneName } = this.#parts;

    const locale2Digit = locale.substring(0, 2);

    return html`
      <time datetime="${date.toISOString()}"
            style="${styleMap(this.#getTimeStyles())}">${this.type === 'digital' ? html`
        <strong part="time" dir="ltr">
          <span part="hour">${hour}</span>
          <span part="colon">:</span>
          <span part="minute">${minute}</span>
          <span part="colon">:</span>
          <span part="second">${second}</span>
        </strong>
        <span class="date" part="date">${hDate?.render(locale2Digit)}</span>
        <small part="zone">${timeZoneName}</small>` : html`
        <div id="face" style="${styleMap(this.#getAngleStyles())}"></div>
        <div id="second" class="hand"></div>
        <div id="minute" class="hand"></div>
        <div id="hour"   class="hand"></div>`}
      </time>
    `;
  }

  #getTimeParts() {
    const parts = new Intl.DateTimeFormat(this.hayom.locale, {
      timeZoneName: 'long',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).formatToParts(this.hayom.date);
    const hour = HebcalClock.#findPart(parts, 'hour');
    const minute = HebcalClock.#findPart(parts, 'minute');
    const second = HebcalClock.#findPart(parts, 'second');
    const timeZoneName = HebcalClock.#findPart(parts, 'timeZoneName');
    return { hour, minute, second, timeZoneName };
  }

  #calcAngle(
    epochMidnight: number,
    ms: number,
    hourOffset = 0,
  ): string {
    const offset = ms - epochMidnight//  - (hourOffset * 1000 * 60 * 60);
    const ratio = (offset / MS_PER_CLOCK_FACE);
    const degrees = (ratio * 360);
    return `${degrees.toFixed(2)}deg`;
  }

  #getAngleStyles() {
    // from midnight to noon, only show dawn and sunrise
    // from noon to midnight, only show sunset and nightfall
    if (this.type === 'digital') return {}
    const midnight = new Date();
          midnight.setHours(0)
          midnight.setMinutes(0)
          midnight.setSeconds(0)
          midnight.setMilliseconds(0);
    const epochMidnight = midnight.getTime();

    const hour = new Date().getHours() ;

    if (hour > 0 && hour <= 12)
      return {
        '--angle-twilight-start': this.#calcAngle(epochMidnight, this.hayom.alotHaShachar.getTime()),
        '--angle-twilight-end': this.#calcAngle(epochMidnight, this.hayom.sunrise.getTime()),
      };
    else
      return {
        '--angle-twilight-start': this.#calcAngle(epochMidnight, this.hayom.sunset.getTime(), 12),
        '--angle-twilight-end': this.#calcAngle(epochMidnight, this.hayom.tzeit.getTime(), 12),
      };
  }

  #getTimeStyles() {
    const { hour, minute, second } = this.#parts;
    return Object.fromEntries(Object.entries({ second, minute, hour })
      .map(([k, v]) => [`--${k}`, v]))
  }
}

