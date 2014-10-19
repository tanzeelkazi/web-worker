#!/bin/sh

clear

echo ==========================
echo = TKWorker project setup =
echo ==========================

echo
echo Deleting 'node_modules' directory...
rm -rf ./node_modules
echo Done
echo


echo
echo Initiating setup with 'npm install'...
echo

npm install --silent

echo
echo TKWorker setup complete
echo
