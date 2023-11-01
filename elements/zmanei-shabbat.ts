import { html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

import { HebcalDayConsumer } from './hebcal-day.js';

import style from './zmanei-shabbat.css';

@customElement('zmanei-shabbat')
export class ZmaneiShabbat extends HebcalDayConsumer {
  static readonly styles = [
    ...HebcalDayConsumer.styles,
    style
  ]

  render() {
    if (this.hayom?.eventsToday?.length) {
      const { i18n, isChag, isErevChag, isShabbat, isErevShabbat } = this.hayom;
      const locale = this.hayom.locale.substring(0, 1);
      console.log(this.hayom.eventsToday.flatMap(x => x.getCategories()))
      const lightingTimes = this.hayom.eventsToday.filter(x => x.getCategories().some(y => y === 'candles' || y === 'havdalah'))
      const parshah = this.hayom.eventsToday.find(x => x.getCategories().some(y => y === 'parashat'))
      console.log(parshah);
      let desc = '';
      if (isShabbat || isErevShabbat)
        desc += i18n.shabbat;
      // TODO: eruv tavshillin, etc
      if ((isShabbat || isErevShabbat) && (isChag || isErevChag))
        desc += i18n.and;
      if (isChag || isErevChag)
        desc += i18n.chag;
      return html`
        <slot class="${classMap({ isShabbat, isErevShabbat, isChag, isErevChag })}">
          <h2>🕯️🕯️ ${i18n.zmanei} ${desc} 🍷

          <strong part="parshah">${parshah?.render(locale) ?? ''}</strong> 📖
          </h2>
        </slot>
        <dl id="events" part="events">${lightingTimes.map(event => html`
          <dt class="term" part="list term">
            <span>${event.renderBrief(locale)}</span>
            <span class="emoji" part="emoji">${event.getEmoji()}</span>
          </dt>
          <dd part="list definition">
            <time datetime="${(event as any).eventTime?.toISOString()}">
              ${(event as any).eventTimeStr}
            </time>
          </dd>`)}
        </dl>
      `;
    }
  }
}

