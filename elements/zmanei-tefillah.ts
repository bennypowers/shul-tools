import { html } from 'lit';
import { HebcalDayConsumer } from './hebcal-day.js';
import { customElement } from 'lit/decorators.js';

import style from './zmanei-tefillah.css';

@customElement('zmanei-tefillah')
export class ZmaneiTefillah extends HebcalDayConsumer {
  static readonly styles = [...HebcalDayConsumer.styles, style];

  #mo = new MutationObserver(() => this.#update());

  connectedCallback() {
    super.connectedCallback();
    this.#update();
    this.#mo.observe(this, { childList: true });
  }

  disconectedCallback() {
    this.#mo.disconnect();
  }

  render() {
    return html`
      <h2 id="heading">${this.hayom?.i18n?.zmaneiTefillah ?? ''}</h2>
      <slot name="weekday"    ?hidden="${!this.hayom.isWeekday}"></slot>
      <slot name="shabbat"    ?hidden="${!this.hayom.isShabbat}"></slot>
      <slot name="yomtov"     ?hidden="${!this.hayom.isChag}"></slot>
      <slot name="chodesh"    ?hidden="${!this.hayom.isRoshChodesh}"></slot>
      <slot name="cholhamoed" ?hidden="${!this.hayom.isCholHamoed}"></slot>
    `;
  }

  #update() {
    for (const time of this.querySelectorAll('time')) {
      if (!time.dateTime) {
        const { offset, offsetFrom } = time.dataset;        const parsed = parseFloat(offset)
        if (!Number.isNaN(parsed)) {
          const from = this.hayom.dailyZmanim.find(x => x.key === offsetFrom)?.date;
          const date = new Date(from);
                date.setTime(date.getTime() + parsed * 60 * 1000)
          time.dateTime = date.toISOString();
          time.textContent = date.toLocaleTimeString(this.hayom.locale, { timeStyle: 'short' });
        }
      }
    }
  }

}

