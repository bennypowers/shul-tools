import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';

import { HebcalDayConsumer } from './hebcal-day.js';

import styles from './hebcal-clock.css';
import { classMap } from 'lit/directives/class-map.js';

const MS_PER_CLOCK_FACE = 1000 * 60 * 60 * 24;

/**
 * Hebcal clock
 *
 *
 */
@customElement('hebcal-clock')
export class HebcalClock extends HebcalDayConsumer {
  static styles = [styles];

  @property({ reflect: true }) accessor type: 'digital' | 'analogue' = 'digital';

  #parts: Record<'hour' | 'minute' | 'second' | 'timeZoneName' | 'dayPeriod', string>;

  #midnight: Date;

  override willUpdate() {
    this.#midnight = new Date();
    this.#midnight.setHours(0)
    this.#midnight.setMinutes(0)
    this.#midnight.setSeconds(0)
    this.#midnight.setMilliseconds(0);
    this.#parts = this.#getTimeParts();
  }

  override render() {
    const { date, locale, hDate } = this.hayom;
    const { hour, minute, second, dayPeriod, timeZoneName } = this.#parts;

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
        <div id="face"
             class="${classMap({ [dayPeriod]: true })}"
             style="${styleMap(this.#getAngleStyles())}"></div>
        <div id="second" class="hand"></div>
        <div id="minute" class="hand"></div>
        <div id="hour"   class="hand"></div>`}
      </time>
    `;
  }

  #getTimeParts() {
    const [
      { value: hour },
      { value: minute },
      { value: second },
      { value: timeZoneName },
    ] = new Intl.DateTimeFormat(this.hayom.locale, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'long',
    }).formatToParts(this.hayom.date).filter(x => x.type !== 'literal');
    const dayPeriod = this.hayom.date.getHours() < 12 ? 'am' : 'pm';
    return { hour, minute, second, timeZoneName, dayPeriod };
  }

  #calcAngle(
    epochMidnight: number,
    ms: number,
    hourOffset = 0,
  ): string {
    const offset = ms - epochMidnight - (hourOffset * 1000 * 60 * 60);
    const ratio = (offset / MS_PER_CLOCK_FACE);
    const degrees = (ratio * 360) * (hourOffset / 6);
    return `${degrees.toFixed(2)}deg`;
  }

  #getAngleStyles() {
    // from midnight to noon, only show dawn and sunrise
    // from noon to midnight, only show sunset and nightfall
    if (this.type === 'digital') return {}
    const epochMidnight = this.#midnight.getTime();

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

