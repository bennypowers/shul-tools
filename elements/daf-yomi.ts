import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { HebcalDayConsumer } from './hebcal-day.js';

@customElement('daf-yomi')
export class DafYomi extends HebcalDayConsumer {

  @property() accessor location = '';

  @property() accessor rabbi = '';

  render() {
    if (this.hayom?.daf) {
      return html`
        <span part="daf">${this.hayom.daf.render(this.hayom.locale)}</span>
        <span part="rabbi">${this.rabbi}</span>
        <span part="location">${this.location}</span>
      `;
    }
  }
}

