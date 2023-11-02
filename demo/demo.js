import { HDate } from '@hebcal/core';
import '@shul/elements';

await Promise.all([
  'hebcal-day',
  'hebcal-clock',
].map(x => customElements.whenDefined(x)));

const $ = x => document.getElementById(x);
const hebcal = $('hebcal');
const analogue = $('analogue');
const knobs = $('knobs');
const dateknob = $('dateknob');
const abs = $('abs');
const hdate = $('hdate');

function sync(event) {
  if (event?.target === abs) {
    const date = new HDate(parseInt(event.data)).greg();
    dateknob.valueAsDate = date;
    hebcal.debugDate = date;
  } else {
    const date = new Date(knobs.elements.date.value);

    if (date.toString() !== 'Invalid Date')
      hebcal.debugDate = date;
    else
      hebcal.debugDate = undefined;
    if (knobs.elements.clockSize.value !== '' && knobs.elements.clockSize.value !== '100')
      analogue.style.setProperty('width', knobs.elements.clockSize.value + '%');
    else
      analogue.style.removeProperty('width');

    if (knobs.elements.tzeit.value)
      hebcal.tzeitAngle = parseFloat(knobs.elements.tzeit.value);

    if (hebcal.debugDate)
      abs.value = new HDate(hebcal.debugDate).abs();
    else
      abs.value = new HDate(new Date()).abs();

    hdate.gematriya = knobs.elements.gematriya.checked;
  }
}

knobs.addEventListener('input', sync);
knobs.addEventListener('reset', sync);

await hebcal.updateComplete;
await analogue.updateComplete;

sync();
