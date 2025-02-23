#!/bin/bash

set -e

BUILD_DIR="./build"
ZIP_FILE="./build.zip"

command_exists() {
	command -v "$1" >/dev/null 2>&1
}

# Install git if not present
if ! command_exists git; then
	sudo apt-get update
	sudo apt-get install -y git
fi

git submodule init
git submodule update --init --recursive

# Install nvm and Node.js
install_nvm_and_node() {
	echo "Installing NVM..."
	curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash

	export NVM_DIR="$HOME/.nvm"
	if [ -s "$NVM_DIR/nvm.sh" ]; then
		source "$NVM_DIR/nvm.sh"
	else
		echo "nvm.sh not found. Exiting."
		exit 1
	fi

	if [ -s "$NVM_DIR/bash_completion" ]; then
		source "$NVM_DIR/bash_completion"
	fi

	echo "Installing Node.js version 21..."
	nvm install 21
	nvm use 21

	# Verify installations
	echo "NVM version:"
	nvm --version

	echo "Node version:"
	node --version

	echo "NPM version:"
	npm --version
}

# Check if Node.js and NPM are installed
if command_exists node && command_exists npm; then
	echo "Node and NPM are already installed."
	node --version
	npm --version
else
	echo "Node or NPM not found. Attempting to install via NVM."
	install_nvm_and_node
fi

# Clean build directory and zip file if they exist from previous run
if [ -d "$BUILD_DIR" ]; then
	rm -rf "$BUILD_DIR"
fi

if [ -f "$ZIP_FILE" ]; then
	rm -f "$ZIP_FILE"
fi

# Install npm dependencies and build the project
npm install
npm run test
npx vite build

# Remove .git directories from submodules
rm -rf ./destam-web-core/destam-db-core/.git
rm -rf ./destam-web-core/.git
rm -rf ./destamatic-ui/.git

# Prepare build directory
mkdir -p "$BUILD_DIR"

# Copy files to build directory
cp -r ./backend "$BUILD_DIR"
cp -r ./destam-web-core/destam-db-core "$BUILD_DIR"
cp -r ./destam-web-core "$BUILD_DIR"
cp -r ./destamatic-ui "$BUILD_DIR"
cp -r ./node_modules "$BUILD_DIR"
cp ./package.json "$BUILD_DIR"
cp ./package-lock.json "$BUILD_DIR"

# Create the run script in the build directory
cat << 'EOF' > "$BUILD_DIR/run.sh"
#!/bin/bash
node ./backend/index.js
EOF

chmod +x "$BUILD_DIR/run.sh"

zip -r "$ZIP_FILE" "$BUILD_DIR"
