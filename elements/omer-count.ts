import { HebcalDayConsumer } from './hebcal-day.js';

import { html } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('omer-count')
export class OmerCount extends HebcalDayConsumer {
  render() {
    if (!this.hayom?.isOmer)
      return '';
    else {
      const { omer, locale } = this.hayom ?? {};
      return html`
        <span>${omer.getTodayIs(locale.split('-').shift())}</span>
        <small>${omer.sefira(locale.startsWith('en') ? 'translit' : 'he')}</small>
      `;
      }
  }
}

