#!/bin/bash
rm -rf node_modules/@shul/elements
mkdir -p public/node_modules/@shul/
cp -r demo/* public/
touch public/.nojekyll

cp -r elements public/node_modules/@shul/
for p in "tslib" \
         "lit" \
         "lit-html" \
         "lit-element" \
         "lit" \
         "@lit" \
         "temporal-polyfill" \
         "@hebcal"; do
  cp -r node_modules/$p public/node_modules/;
done

node ./scripts/importmap.js
