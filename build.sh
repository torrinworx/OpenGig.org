#!/bin/bash

set -e

if [ -d "./build" ]; then
	rm -rf ./build
fi

# Assumes git submodules are updated to the correct commit.
npm i
npx vite build

rm -rf ./web-core/.git
rm -rf ./web-core/node_modules
rm -rf ./destamatic-ui/.git
rm -rf ./destamatic-ui/node_modules

mkdir -p ./build

cp -r ./backend ./build
cp -r ./web-core ./build
cp -r ./destamatic-ui ./build
cp ./package.json ./build
cp ./package-lock.json ./build

cat << 'EOF' > ./build/run.sh
#!/bin/bash
node ./backend/index.js
EOF

chmod +x ./build/run.sh
