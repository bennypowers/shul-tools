import { css, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

import { HebCalChild } from './heb-cal.js';

@customElement('zmanei-shabbat')
export class ZmaneiShabbat extends HebCalChild {
  static styles = [
    ...HebCalChild.styles,
    css`
      #events {
        font-size: 200%;
      }

      .term {
        display: flex;
        gap: .5em;
      }

      .emoji {
        margin-inline-start: auto;
      }
    `,
  ]

  render() {
    if (this.hebcal.events?.length) {
      const { i18n, isChag, isErevChag, isShabbat, isErevShabbat } = this.hebcal;
      const locale = this.hebcal.locale.substring(0, 1);
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
          <h2>🕯️🕯️ ${i18n.zmanei} ${desc} 🍷</h2>
        </slot>
        <dl id="events" part="events">${this.hebcal.events.map(event => html`
          <dt class="term" part="list term">
            <span>${event.renderBrief(locale)}</span>
            <span class="emoji" part="emoji">${event.getEmoji()}</span>
          </dt>
          <dd part="list definition">
            <time datetime="${(event as any).eventTime.toISOString()}">
              ${(event as any).eventTimeStr}
            </time>
          </dd>`)}
        </dl>
      `;
    }
  }
}

