import { html } from 'lit';
import { HebcalDayConsumer } from './hebcal-day.js';
import { customElement } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

@customElement('zmanei-yom')
export class ZmaneiYom extends HebcalDayConsumer {
  render() {
    const { dailyZmanim, i18n, locale, tzeitDeg } = this.hayom ?? {};
    return html`
      <h2>${i18n?.get('zmanei') ?? ''} ${i18n?.get('yom') ?? ''}</h2>
      <dl part="list">${dailyZmanim?.map(({ key, date, past, next }) => html`
        <div class="${classMap({ past, next })}">
          <dt part="term">
            <span>${i18n.get(key)}</span>${key !== 'tzeit' ? '' : html`
            <small part="tzeit-angle">(${tzeitDeg}°)</small>`}
          </dt>
          <dd part="definition">
            <time datetime="${date.toISOString()}">
              ${date.toLocaleTimeString(locale, { timeStyle: 'medium' })}
            </time>
          </dd>
        </div>`)}
      </dl>
    `;
  }
}

