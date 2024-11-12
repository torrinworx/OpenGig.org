#!/bin/bash

set -e

if [ -d "./build" ]; then
	rm -rf ./build
fi

npm i
npm run build

npm i --production

rm -rf ./web-core/.git
rm -rf ./destamatic-ui/.git

mkdir -p ./build
cp -r ./backend ./build
cp -r ./web-core ./build
cp -r ./destamatic-ui ./build
