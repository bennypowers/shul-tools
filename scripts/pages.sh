#!/bin/bash
mkdir -p public/node_modules
cp demo/* public/
cp -r node_modules public/
cp -r elements public/node_modules/
sed -i 's/\.\.\/elements/\.\/node_modules/elements/' public/index.html
sed -i 's/\.\.\/node_modules/\.\/node_modules/' public/index.html
