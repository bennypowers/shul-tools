import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { HebcalDayConsumer } from './hebcal-day.js';
import { DailyLearning } from '@hebcal/core';

@customElement('daf-yomi')
export class DafYomi extends HebcalDayConsumer {

  @property() accessor location = '';

  @property() accessor rabbi = '';

  render() {
    if (this.hayom) {
      const daf = DailyLearning.lookup('dafYomi', this.hayom.hDate);
      console.log(daf, this.hayom.eventsToday);
      if (daf)
        return html`
          <span part="daf">${daf?.render(this.hayom.locale)}</span>
          <span part="rabbi">${this.rabbi}</span>
          <span part="location">${this.location}</span>
        `;
    }
  }
}

