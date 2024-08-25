import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { HebcalDayConsumer } from './hebcal-day.js';

import styles from './hebcal-date.css';

/**
 * Hebcal date
 */
@customElement('hebcal-date')
export class HebcalDate extends HebcalDayConsumer {
  static styles = [styles];

  @property({ type: Boolean, reflect: true })
  accessor gematriya = false;

  override render() {
    const { date, locale, hDate } = this.hayom;

    const day = this.hayom.i18n.get('days')[this.hayom.hDate.getDay()];

    const dateRendered =
        this.gematriya ? hDate.renderGematriya(true)
      : hDate.render(locale.substring(0, 2))
    return html`
      <time datetime="${date.toISOString()}">
        <span part="day">${day}</span>
        <span part="date">${dateRendered}</span>
      </time>
    `;
  }
}

