import { html, render } from 'lit';
import { HDate, Zmanim } from '@hebcal/core';

const RH = 'Rosh Hashannah';
const H1 = 'Hannukah 1';
const P1 = 'Pesach';
const TA = 'Tisha B\'Av';

/** @type {Map<string, Date>} */
const DATES = new Map([
  [RH, '2022-09-26'],
  [H1, '2022-12-19'],
  [P1, '2023-04-06'],
  [TA, '2023-06-26'],
].map(([d, iso]) => [d, new Date(iso)]));

const LOCATIONS = {
  North: [31.87878, 35.21721],
  East: [31.76446, 35.28068],
  South: [31.71971, 35.22229],
  West: [31.75163, 35.13640],
  Mikdash: [31.77802, 35.23539],
};

const SHKIAH_L_DUM = new Map([
  [RH, '6:35:00 PM'],
  [H1, '4:43:15 PM'],
  [P1, '7:06:00 PM'],
  [TA, '7:45:00 PM'],
]);

const SHKIAH_L_ILB = new Map([
  [RH, '6:35:00 PM'],
  [H1, '4:45:00 PM'],
  [P1, '7:07:00 PM'],
  [TA, '7:44:15 PM'],
]);

const NEITZ_L_DUM = new Map([
  [RH, '6:30 AM'],
  [H1, 'Not listed'],
  [P1, '6:22 AM'],
  [TA, 'Not listed'],
])

const NEITZ_L_ILB = new Map([
  [RH, '6:28:45 AM'],
  [H1, '6:32:15 AM'],
  [P1, '6:21:30 AM'],
  [TA, '5:51:30 AM'],
])

render(html`
<thead>
  <tr>
    <th>Date</th>
    <th>Hebcal</th>
    <th lang="he" dir="rtl">לוח דינים ומנהגים</th>
    <th lang="he" dir="rtl">לוח עיתים לבינה</th>
  </tr>
</thead>
<tbody>${Array.from(DATES, ([name, date]) => html`
  <tr>
    <th>
      <em>${name}</em>
      <time datetime="${date.toISOString()}">${date.toLocaleDateString()}</time>
    </th>
    <td>
      <dl>${Object.entries(LOCATIONS).map(([place, [lat, long]]) => html`
        <dt>${place}</dt>
        <dd>${new Zmanim(new HDate(date), lat, long).shkiah().toLocaleTimeString()}</dd>`)}
      </dl>
    </td>
    <td>${SHKIAH_L_DUM.get(name)}</td>
    <td>${SHKIAH_L_ILB.get(name)}</td>
  </tr>`)}
</tbody>`, document.getElementById('shkiah'));


render(html`
<thead>
  <tr>
    <th>Date</th>
    <th>Hebcal</th>
    <th lang="he" dir="rtl">לוח דינים ומנהגים</th>
    <th lang="he" dir="rtl">לוח עיתים לבינה</th>
  </tr>
</thead>
<tbody>${Array.from(DATES, ([name, date]) => html`
  <tr>
    <th>
      <em>${name}</em>
      <time datetime="${date.toISOString()}">${date.toLocaleDateString()}</time>
    </th>
    <td>
      <dl>${Object.entries(LOCATIONS).map(([place, [lat, long]]) => html`
        <dt>${place}</dt>
        <dd>${new Zmanim(new HDate(date), lat, long).neitzHaChama().toLocaleTimeString()}</dd>`)}
      </dl>
    </td>
    <td>${NEITZ_L_DUM.get(name)}</td>
    <td>${NEITZ_L_ILB.get(name)}</td>
  </tr>`)}
</tbody>`, document.getElementById('neitz'));
