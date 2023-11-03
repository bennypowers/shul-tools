// @ts-check

import { HDate } from '@hebcal/core';
import '@shul/elements';

await Promise.all([
  'hebcal-day',
  'hebcal-clock',
].map(x => customElements.whenDefined(x)));

const $ = x => document.getElementById(x);

const hebcal =
  /** @type {HTMLElementTagNameMap['hebcal-day']} */ ($('day'));

const analogue =
  /** @type {HTMLElementTagNameMap['hebcal-clock']} */ ($('analogue'));

const knobs =
  /** @type {HTMLFormElement} */ ($('knobs'));

function sync(event) {
  const dateknob = /** @type {HTMLInputElement} */(knobs.elements.namedItem('date'));
  const absknob = /** @type {HTMLInputElement} */(knobs.elements.namedItem('abs'));
  const absDateValue = absknob.value;

  const absDate =
        absDateValue
     && new HDate(parseInt(absDateValue)).greg()
     || null;

  absDate?.setUTCHours(0);

  switch (event?.target) {
    case absknob:
      dateknob.valueAsDate = absDate;
      break;
    case dateknob:
      absknob.value = new HDate(/**@type{Date}*/(dateknob.valueAsDate)).abs().toString();
      break;
  }

  if (!absknob.value)
    absknob.value = new HDate(new Date()).abs().toString();

  const date = (
    dateknob.valueAsDate?.toString() === 'Invalid Date' ? null : dateknob.valueAsDate
  ) ?? undefined;

  hebcal.specificDate = date;

  const clockSize = /** @type {HTMLInputElement} */(knobs.elements.namedItem('clockSize')).value;
  if (clockSize !== '' && clockSize !== '100')
    analogue.style.setProperty('width', `${clockSize}%`);
  else
    analogue.style.removeProperty('width');

  for (const element of knobs.elements) {
    if (element instanceof HTMLInputElement) {
      const target = $(element.dataset.target);
      if (target) {
        target[element.name] =
            element.type === 'number' ? parseFloat(element.value)
          : element.type === 'checkbox' ? element.checked
          : element.value
      } else if (element.dataset?.target) {
        console.warn(`Could not find target #${element.dataset.target}`);
      }
    }
  }
}

knobs.addEventListener('input', sync);

knobs.addEventListener('reset', async function() {
  await hebcal.updateComplete;
  await new Promise(requestAnimationFrame);
  sync();
});

knobs.addEventListener('select', () => {
  return hebcal.city =
    /** @type {HTMLInputElement} */
    (knobs.elements.namedItem('city')).value;
});

await hebcal.updateComplete;
await analogue.updateComplete;

sync();
