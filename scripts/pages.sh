#!/bin/bash
mkdir -p public/node_modules/@shul/elements
cp demo/* public/
cp -r node_modules public/
cp -r elements public/node_modules/@shul/elements
sed -i 's/\.\.\/node_modules/\.\/node_modules/' public/index.html
sed -i 's/\.\.\/elements/\.\/node_modules\/@shul\/elements/' public/index.html
