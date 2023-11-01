import { html } from 'lit';
import { HebcalDayConsumer } from './hebcal-day.js';
import { customElement } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

@customElement('zmanei-yom')
export class ZmaneiYom extends HebcalDayConsumer {
  render() {
    const { dailyZmanim, i18n, locale, tzeitAngle } = this.hayom ?? {};
    return html`
      <heading>
        <h2>${i18n?.zmanei ?? ''} ${i18n?.yom ?? ''}</h2>
      </heading>
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

