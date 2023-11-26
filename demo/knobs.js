import { HDate } from '@hebcal/core';

export class HebcalKnobs extends HTMLElement {
  static is = 'hebcal-knobs';

  static template = document.createElement('template');

  static styles = new CSSStyleSheet();

  static formAssociated = true;

  static {
    this.template.innerHTML = `
      <form id="knobs">
        <fieldset>
          <legend>Date settings</legend>
          <label for="knob-abs">Debug date (<abbr title="Rata Die, Dershowitz/Reingold">R.D.</abbr>)</label>
          <input id="knob-abs"
                 name="abs"
                 type="number">

          <label for="knob-date">Debug date (gregorian)</label>
          <input id="knob-date"
                 name="date"
                 type="datetime-local">

          <label for="knob-gematriya">Date in Gematriya</label>
          <input id="knob-gematriya"
                 name="gematriya"
                 type="checkbox"
                 data-target="hebcal-date"
                 checked>
        </fieldset>

        <fieldset>
          <legend>Zmanim settings</legend>
          <label for="knob-city">City</label>
          <select id="knob-city"
                  name="city"
                  data-target="hebcal-day"
                  value="Jerusalem">
            <option selected>Jerusalem</option>
            <option>Toronto</option>
            <option disabled>──────────</option>
            <option>Ashdod</option>
            <option>Atlanta</option>
            <option>Austin</option>
            <option>Baghdad</option>
            <option>Beer Sheva</option>
            <option>Berlin</option>
            <option>Baltimore</option>
            <option>Bogota</option>
            <option>Boston</option>
            <option>Budapest</option>
            <option>Buenos Aires</option>
            <option>Buffalo</option>
            <option>Chicago</option>
            <option>Cincinnati</option>
            <option>Cleveland</option>
            <option>Dallas</option>
            <option>Denver</option>
            <option>Detroit</option>
            <option>Eilat</option>
            <option>Gibraltar</option>
            <option>Haifa</option>
            <option>Hawaii</option>
            <option>Helsinki</option>
            <option>Houston</option>
            <option>Johannesburg</option>
            <option>Kiev</option>
            <option>La Paz</option>
            <option>Livingston</option>
            <option>Las Vegas</option>
            <option>London</option>
            <option>Los Angeles</option>
            <option>Marseilles</option>
            <option>Miami</option>
            <option>Minneapolis</option>
            <option>Melbourne</option>
            <option>Mexico City</option>
            <option>Montreal</option>
            <option>Moscow</option>
            <option>New York</option>
            <option>Omaha</option>
            <option>Ottawa</option>
            <option>Panama City</option>
            <option>Paris</option>
            <option>Pawtucket</option>
            <option>Petach Tikvah</option>
            <option>Philadelphia</option>
            <option>Phoenix</option>
            <option>Pittsburgh</option>
            <option>Providence</option>
            <option>Portland</option>
            <option>Saint Louis</option>
            <option>Saint Petersburg</option>
            <option>San Diego</option>
            <option>San Francisco</option>
            <option>Sao Paulo</option>
            <option>Seattle</option>
            <option>Sydney</option>
            <option>Tel Aviv</option>
            <option>Tiberias</option>
            <option>Vancouver</option>
            <option>White Plains</option>
            <option>Washington DC</option>
            <option>Worcester</option>
          </select>

          <label for="latitude">Latitude</label>
          <input id="latitude"
                 data-target="hebcal-day"
                 name="latitude"
                 value="31.802943"
                 type="number">
          <label for="longitude">Longitude</label>
          <input id="longitude"
                 data-target="hebcal-day"
                 name="longitude"
                 value="35.240726"
                 type="number">
          <label for="elevation">Elevation</label>
          <input id="elevation"
                 name="elevation"
                 data-target="hebcal-day"
                 value="784"
                 type="number">

          <label for="knob-tzeit-degrees">Tzeit angle (°)</label>
          <input id="knob-tzeit-degrees"
                 name="tzeitDegrees"
                 type="number"
                 data-target="hebcal-day"
                 value="8.0">

          <span>Candle lighting minutes before sunset</span>
          <div>
            <input id="min18"
                   name="candleLightingMinutesBeforeSunset"
                   data-target="hebcal-day"
                   data-type="number"
                   type="radio"
                   value="18">
            <label for="min18">18 minutes</label>
            <input id="min40"
                   name="candleLightingMinutesBeforeSunset"
                   data-target="hebcal-day"
                   data-type="number"
                   type="radio"
                   checked
                   value="40">
            <label for="min40">40 minutes</label>
          </div>

          <label for="knob-havdalah-degrees">Havdala offset in degrees</label>
          <input id="knob-havdalah-degrees"
                 name="havdalahDegrees"
                 data-target="hebcal-day"
                 type="number"
                 value="8.5">

          <label for="knob-havdalah-minutes">Havdala offset in minutes</label>
          <input id="knob-havdalah-minutes"
                 name="havdalahMinutesAfterSunset"
                 data-target="hebcal-day"
                 type="number"
                 value="0">
        </fieldset>

        <fieldset>
          <legend>UI settings</legend>
          <label for="knob-clock-size">Clock size</label>
          <input id="knob-clock-size"
                 name="clockSize"
                 type="range"
                 value="100">
          <label for="knob-debug">Print debug info</label>
          <input id="knob-debug"
                 name="debug"
                 data-target="hebcal-day"
                 type="checkbox">
        </fieldset>

        <button type="reset">
          Reset
        </button>
      </form>
    `;
    this.styles.replaceSync(/* css */`
      #knobs {
        padding-inline: var(--hebcal-column-gap);
      }

      #knobs {
        display: grid;
        & button {
          width: min-content;
        }
      }

      fieldset {
        display: grid;
        grid-template-columns: auto auto;
        gap: var(--root-gap) calc(var(--root-gap) / 2);
        justify-items: start;
      }
    `);
    customElements.define(this.is, this)
  }

  constructor() {
    super()

    const root = this.attachShadow({ mode: 'open' });
          root.append(HebcalKnobs.template.content.cloneNode(true));
          root.adoptedStyleSheets = [HebcalKnobs.styles];

    this.knobs = root.querySelector('form');
    /** @type {HTMLFormElement} */
    this.addEventListener('input', this.sync);
    this.addEventListener('reset', this.onReset);
    this.addEventListener('select', this.onSelect);
    root.getElementById('knob-abs').addEventListener('change', () => this.onAbsDateChange());
    root.getElementById('knob-date').addEventListener('change', () => this.onDatePickerChange());
  }

  $light = x => /** @type {Document|ShadowRoot} */(this.getRootNode()).querySelector(x);
  $$light = x => /** @type {Document|ShadowRoot} */(this.getRootNode()).querySelectorAll(x);

  async onReset() {
    await this.hebcal.updateComplete;
    await new Promise(requestAnimationFrame);
    this.sync();
  }

  async onSelect() {
    this.hebcal.city =
      /** @type {HTMLInputElement} */
      (this.knobs.elements.namedItem('city')).value;
  }

  async connectedCallback() {
    await Promise.all([
      'hebcal-day',
      'hebcal-clock',
    ].map(x => customElements.whenDefined(x)));

    this.hebcal = this.$light('hebcal-day');
    this.$ = Object.fromEntries(Array.from(
      this.$$light('hebcal-day [id]'),
      child => [child.id, child],
    ));

    await this.hebcal.updateComplete;

    this.sync();
  }

  onAbsDateChange() {
    const absknob = /** @type {HTMLInputElement} */(this.knobs.elements.namedItem('abs'));
    const absDateValue = absknob.value;
    const absDate =
          absDateValue
       && new HDate(parseInt(absDateValue)).greg()
       || null;

    absDate?.setUTCHours(0);

    this.knobs.elements.namedItem('date').valueAsDate = absDate;
    this.sync();
    this.hebcal.requestUpdate('date', null);
  }

  onDatePickerChange() {
    const dateknob = /** @type {HTMLInputElement} */(this.knobs.elements.namedItem('date'));
    const absknob = /** @type {HTMLInputElement} */(this.knobs.elements.namedItem('abs'));
          absknob.value = new HDate(dateknob.valueAsDate).abs().toString();
    this.sync();
    this.hebcal.requestUpdate('date', null);
  }

  sync() {
    const absknob = /** @type {HTMLInputElement} */(this.knobs.elements.namedItem('abs'));
    const dateknob = /** @type {HTMLInputElement} */(this.knobs.elements.namedItem('date'));

    if (!absknob.value)
      absknob.value = new HDate(new Date()).abs().toString();

    const date = (
      dateknob.valueAsDate?.toString() === 'Invalid Date' ? null : dateknob.valueAsDate
    ) ?? undefined;

    this.hebcal.specificDate = date;

    const clockSize = /** @type {HTMLInputElement} */(this.knobs.elements.namedItem('clockSize')).value;
    if (clockSize !== '' && clockSize !== '100')
      this.$.analogue?.style.setProperty('width', `${clockSize}%`);
    else
      this.$.analogue?.style.removeProperty('width');

    for (const element of this.knobs.elements) {
      if (element instanceof HTMLInputElement) {
        const target = this.$light(element.dataset.target);
        if (target) {
          if (element.type.match(/radio|checkbox/) && !element.checked)
            continue;
          target[element.name] =
              element.type === 'checkbox' ? element.checked
            : element.type === 'number' || element.dataset.type === 'number' ? parseFloat(element.value)
            : element.value
        } else if (element.dataset?.target) {
          console.warn(`Could not find target ${element.dataset.target}`);
        }
      }
    }
  }

}
