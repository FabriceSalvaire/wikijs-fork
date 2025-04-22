#! /usr/bin/bash

ssh vps-vpn -t '/root/bin/pre-wikijs-upgrade.sh'
./tools/sync.py
ssh vps-vpn -t '/root/bin/post-wikijs-upgrade.sh'
