import { html } from 'lit';
import { HebCalChild } from './heb-cal.js';
import { customElement, property } from 'lit/decorators.js';
import { DailyLearning } from '@hebcal/core';

@customElement('daf-yomi')
export class DafYomi extends HebCalChild {

  @property() accessor location = '';

  @property() accessor rabbi = '';

  render() {
    if (this.hebcal) {
      const daf = DailyLearning.lookup('dafYomi', this.hebcal.hDate);
      console.log(daf, this.hebcal.events);
      return html`
        <span part="daf">${daf?.render(this.hebcal.locale)}</span>
        <span part="rabbi">${this.rabbi}</span>
        <span part="location">${this.location}</span>
      `;
    }
  }
}

