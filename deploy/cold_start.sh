#!/bin/bash

# Experimental, hasn't been tested.
# Cold start steps needed to setup a machine to host opengig

sudo apt update -y
sudo apt upgrade -y
sudo apt install -y git curl nginx
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

nvm install 23
nvm use 23
nvm alias default 23

sudo cp ./opengig.org /etc/nginx/sites-available/opengig.org
sudo ln -s /etc/nginx/sites-available/opengig.org /etc/nginx/sites-enabled/opengig.org
sudo nginx -t
if [ $? -eq 0 ]; then
    sudo systemctl restart nginx
else
    echo "Nginx configuration test failed. Please check your configuration."
    exit 1
fi

sudo cp ./opengig.service /etc/systemd/system/opengig.service
sudo systemctl daemon-reload
sudo systemctl enable opengig.service
sudo systemctl start opengig.service

# Ensure firewall allows HTTP and HTTPS traffic (optional, but recommended)
sudo ufw allow 'Nginx Full'
sudo ufw enable

echo "Cold start setup complete."
