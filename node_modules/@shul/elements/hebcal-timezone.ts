import { html } from 'lit';
import { customElement } from 'lit/decorators.js';

import { HebcalDayConsumer } from './hebcal-day.js';

import styles from './hebcal-timezone.css';

/**
 * Hebcal date timezone
 */
@customElement('hebcal-timezone')
export class HebcalTimezone extends HebcalDayConsumer {
  static styles = [styles];

  override render() {
    return html`
      <time datetime="${this.hayom.date.toISOString()}">
        ${this.hayom.timeParts.timeZoneName}
      </time>
    `;
  }
}

