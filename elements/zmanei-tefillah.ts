import type { ZmanimKey } from './lib/DailyZmanim.js';

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
    const {
      isShabbat,
      isChag,
      isRoshChodesh,
      isCholHamoed,
      isWeekday,
      i18n: {
        zmaneiTefillah,
      }
    } = this.hayom;

    const openSlot =
        isCholHamoed && !isChag ? 'cholhamoed'
      : isChag ? 'yomtov'
      : isRoshChodesh ? 'chodesh'
      : isShabbat ? 'shabbat'
      : isWeekday ? 'weekday'
      : 'error';

    return html`
      <h2 id="heading">${zmaneiTefillah ?? ''}</h2>
      <slot name="${openSlot}"></slot>
    `;
  }

  #update() {
    for (const time of this.querySelectorAll('time')) {
      if (!time.dateTime) {
        const { offset, offsetFrom } = time.dataset;
        const parsed = parseFloat(offset)
        if (!Number.isNaN(parsed)) {
          const from = this.hayom.dailyZmanim.get(offsetFrom as ZmanimKey);
          if (from) {
            const date = new Date(from);
                  date.setTime(date.getTime() + parsed * 60 * 1000)
            time.dateTime = date.toISOString();
            time.textContent = date.toLocaleTimeString(this.hayom.locale, { timeStyle: 'short' });
          }
        }
      }
    }
  }

}

