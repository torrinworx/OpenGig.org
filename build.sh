#!/bin/bash

set -e

BUILD_DIR="./build"
ZIP_FILE="./build.zip"

if [ -d "$BUILD_DIR" ]; then
	rm -rf "$BUILD_DIR"
fi

if [ -f "$ZIP_FILE" ]; then
	rm -f "$ZIP_FILE"
fi

# Assumes git submodules are updated to the correct commit
npm i
npx vite build

rm -rf ./web-core/.git
rm -rf ./web-core/node_modules
rm -rf ./destamatic-ui/.git
rm -rf ./destamatic-ui/node_modules

mkdir -p "$BUILD_DIR"

cp -r ./backend "$BUILD_DIR"
cp -r ./web-core "$BUILD_DIR"
cp -r ./destamatic-ui "$BUILD_DIR"
cp ./package.json "$BUILD_DIR"
cp ./package-lock.json "$BUILD_DIR"

cat << 'EOF' > "$BUILD_DIR/run.sh"
#!/bin/bash
node index.js
EOF

chmod +x "$BUILD_DIR/run.sh"

# Zip the build directory
zip -r "$ZIP_FILE" "$BUILD_DIR"
