import { html } from 'lit';
import { HebCalChild } from './heb-cal.js';
import { customElement } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

@customElement('zmanei-yom')
export class ZmaneiYom extends HebCalChild {
  render() {
    const { dailyZmanim, i18n, locale, tzeitAngle } = this.hebcal ?? {};
    return html`
      <slot>
        <h2>
          ${i18n?.zmanei ?? ''} ${i18n?.yom ?? ''}
        </h2>
      </slot>
      <dl>${dailyZmanim?.map(({ key, date, past, next }) => html`
        <div class="${classMap({ past, next })}">
          <dt part="list term">
            <span>${i18n[key]}</span>${key !== 'tzeit' ? '' : html`
            <small>(${tzeitAngle}°)</small>`}
          </dt>
          <dd part="list definition">
            <time datetime="${date.toISOString()}">
              ${date.toLocaleTimeString(locale, { timeStyle: 'medium' })}
            </time>
          </dd>
        </div>`)}
      </dl>
      <slot name="footer"></slot>
    `;
  }
}

