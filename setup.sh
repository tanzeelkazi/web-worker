#!/bin/sh

clear

echo ==========================
echo = TKWorker project setup =
echo ==========================

echo
echo Deleting 'node_modules' directory...
sudo rm -rf ./node_modules
echo Done
echo


echo
echo Initiating setup with 'npm install'...
echo

sudo npm install --silent  --ignore-scripts

echo
echo Running post-install script...
echo

node config/install/post-install.js

echo
echo TKWorker setup complete
echo
