import { html } from 'lit';
import { customElement } from 'lit/decorators.js';

import { HebcalDayConsumer } from './hebcal-day.js';

import style from './zmanei-shabbat.css';

@customElement('zmanei-shabbat')
export class ZmaneiShabbat extends HebcalDayConsumer {
  static readonly styles = [
    ...HebcalDayConsumer.styles,
    style
  ]

  render() {
    const {
      i18n,
      isChag,
      isErevChag,
      parsha,
      candles: {
        lighting,
        havdalah,
      }
    } = this.hayom;

    const locale = this.hayom.locale.substring(0, 1);

    let desc = i18n.get('shabbat');

    // TODO: eruv tavshillin, etc

    if ((isChag || isErevChag))
      desc += ` ${i18n.get('and')}`;

    if (isChag || isErevChag)
      desc += i18n.get('chag');

    return html`
      <slot>
        <h2>
          <span>🍷 ${i18n.get('zmanei')} ${desc}</span>
          <span part="parshah">📖 ${parsha?.render(locale) ?? ''}</span>
        </h2>
      </slot>
      <dl id="events" part="list">
        <dt class="term" part="term lighting">
          <span>${lighting.renderBrief(locale)}</span>
          <span class="emoji" part="emoji">${lighting.getEmoji()}</span>
        </dt>
        <dd part="definition lighting">
          <time datetime="${lighting.eventTime?.toISOString()}">
            ${lighting.eventTimeStr}
          </time>${this.#dump(lighting.eventTime)}
        </dd>
        <dt class="term" part="term havdalah">
          <span>${havdalah.renderBrief(locale)}</span>
          <span class="emoji" part="emoji">${havdalah.getEmoji()}</span>
        </dt>
        <dd part="definition havdalah">
          <time datetime="${havdalah.eventTime.toISOString()}">
            ${havdalah.eventTimeStr}
          </time>${this.#dump(havdalah.eventTime)}
        </dd>
      </dl>
    `;
  }

  #dump(obj: unknown) {
    return !this.hayom.debug ? ''
    : html`<pre dir="ltr" lang="en">${JSON.stringify(obj, null, 2)}</pre>`
  }
}

