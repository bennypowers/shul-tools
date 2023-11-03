// @ts-check
const OFF     = 'off';
const WARNING = 'warn';
const ERROR   = 'error';

const ALWAYS  = 'always';
const NEVER   = 'never';
const IGNORE  = 'ignore';
/* eslint-enable no-unused-vars, no-multi-spaces */

/** These files run in a nodejs context, mostly config files */
const NODE_FILES = [
  '*.cjs.js',
  '.babelrc.js',
  'commitlint.config.?([cm])js',
  'karma.conf.?([cm])js',
  'postcss.config.?([cm])js',
  'rollup.config.?([cm])js',
  'web-*.config.?([cm])js',
  'workbox-config.?([cm])js',
];

/** These files contain mocha tests */
const TEST_FILES = [
  '**/*.@(test,spec).[jt]s',
];

/** Packages which re-export lit-html */
const litHtmlSources = [
  '@apollo-elements/lit-apollo',
  '@open-wc/testing',
];

/** @type{import('eslint').Linter.Config} */
const config = {
  extends: [
    'google',
    'eslint:recommended',
    'plugin:lit-a11y/recommended',
  ],

  env: {
    browser: true,
    es6: true,
  },

  settings: {
    litHtmlSources,
  },

  globals: {
    Polymer: true,
    System: true,
  },

  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },

  plugins: [
    'html',
    'no-only-tests',
    'json',
    'easy-loops',
    'lit-a11y',
  ],

  rules: {
    'arrow-parens': [ERROR, 'as-needed'],
    'brace-style': [ERROR, '1tbs', { allowSingleLine: true }],
    'block-spacing': [ERROR, ALWAYS],

    'comma-dangle': [ERROR, {
      arrays: 'always-multiline',
      objects: 'always-multiline',
      imports: 'always-multiline',
      exports: 'always-multiline',
      functions: IGNORE,
    }],

    'comma-spacing': ERROR,
    'comma-style': [ERROR, 'last'],
    'curly': [ERROR, 'multi-or-nest'],
    'eqeqeq': [ERROR, ALWAYS, { null: IGNORE }],

    'indent': [ERROR, 2, {
      flatTernaryExpressions: true,
      SwitchCase: 1,
      ignoredNodes: [
        `ConditionalExpression`,
        `TaggedTemplateExpression[tag.name="html"] > TemplateLiteral CallExpression > ObjectExpression`,
        `TaggedTemplateExpression[tag.name="html"] > TemplateLiteral ObjectExpression`,
        `TaggedTemplateExpression[tag.name="html"] > TemplateLiteral CallExpression > TaggedTemplateLiteral`,
        `TaggedTemplateExpression[tag.name="html"] > TemplateLiteral ArrowFunctionExpression > BlockStatement`,
      ],
    }],

    'linebreak-style': [ERROR, 'unix'],
    'lines-between-class-members': [ERROR, ALWAYS, { exceptAfterSingleLine: true }],

    'max-len': [ERROR, 100, {
      ignoreComments: true,
      ignoreTemplateLiterals: true,
      ignorePattern: '^import (type )?\\{? ?\\w+ ?\\}? from \'(.*)\';$',
      ignoreUrls: true,
    }],

    'new-cap': OFF,

    'no-unused-vars': [WARNING, { ignoreRestSiblings: true }],
    'no-var': ERROR,
    'no-console': ERROR,
    'no-extend-native': ERROR,

    'easy-loops/easy-loops': WARNING,

    'no-only-tests/no-only-tests': ERROR,

    'object-curly-spacing': [ERROR, ALWAYS],

    'operator-linebreak': [ERROR, 'after', { 'overrides': { '?': 'after', ':': 'before' } }],

    'prefer-const': ERROR,
    'prefer-destructuring': ERROR,
    'prefer-object-spread': ERROR,
    'prefer-promise-reject-errors': OFF,
    'prefer-spread': ERROR,
    'prefer-template': ERROR,

    'require-jsdoc': OFF,

    'spaced-comment': [ERROR, ALWAYS, { markers: ['/'] }],
    'space-before-function-paren': [ERROR, { anonymous: NEVER, named: NEVER, asyncArrow: ALWAYS }],
    'space-infix-ops': ERROR,
    'space-unary-ops': ERROR,

    'template-tag-spacing': ERROR,
    'template-curly-spacing': ERROR,
  },
  overrides: [{
    files: TEST_FILES,
    env: { node: true, mocha: true },
    rules: {
      'max-len': OFF,
      'no-invalid-this': OFF,
      'no-console': OFF,
      'require-jsdoc': OFF,
    },
  }, {
    files: ['**/*.ts'],
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    extends: [
      'plugin:@typescript-eslint/eslint-recommended',
      'plugin:@typescript-eslint/recommended',
    ],
    rules: {
      'valid-jsdoc': OFF,
      '@typescript-eslint/no-explicit-any': [WARNING, {
        ignoreRestArgs: true,
      }],
      '@typescript-eslint/no-unused-vars': [WARNING, {
        ignoreRestSiblings: true,
      }],
      '@typescript-eslint/ban-ts-comment': [WARNING, {
        'ts-expect-error': 'allow-with-description',
      }],
    },
  }, {
    files: NODE_FILES,
    env: { node: true },
  }, {
    files: ['*.mjs'],
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
    },
  }],
};

export default config;
