#! /usr/bin/bash

rm node_modules
ln -sf /srv/cache/fabrice/node_modules-prod node_modules
yarn build

rm node_modules
ln -sf /srv/cache/fabrice/node_modules node_modules
