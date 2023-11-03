'use strict';

const rule = require('../lib/easy-loops.cjs');
const { RuleTester } = require('eslint');

const ruleTester = new RuleTester({ parserOptions: { ecmaVersion: 2015 } });
ruleTester.run('easy-loops', rule, {
  valid: [
    {
      code: '[1, 2, 3].map(function (i) { console.log(i); });',
    },
    {
      code: 'while (i <= n) console.log(i);',
    },
    {
      code: 'for (const i of [1, 2, 3]) console.log(i);',
    },
  ],

  invalid: [
    {
      code: 'for (var i; i <= n; i++) { console.log(i); }',
      errors: [{ message: 'for loops are not allowed' }],
    },
    {
      code: 'for (i in [1, 2, 3]) { console.log(i); }',
      errors: [{ message: 'for...in loops are not allowed' }],
    },
    {
      code: 'for (const i of [1, 2, 3]) { console.log(i) }',
      errors: [{ message: 'for...of loops may only have a single expression in their body' }],
    },
    {
      code: 'while (i <= n) { console.log(i); }',
      errors: [{ message: 'while loops may only have a single expression in their body' }],
    },
    {
      code: 'do { console.log(i); } while (i <= n)',
      errors: [{ message: 'do while loops are not allowed' }],
    },
  ],
});
