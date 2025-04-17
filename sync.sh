#! /bin/bash

####################################################################################################

NODE_MODULES='/srv/cache/fabrice/node_modules-prod'
HOST='vps-vpn'
DEST='/var/www/wikijs'

# DRY_RUN='--dry-run'
DRY_RUN=''

RULE='--------------------------------------------------'

####################################################################################################

# /!\ using --delete could delete / !!!
#
# rsync foo 'bar:file' /
#   Unexpected remote arg: bar:file
#
# [rsync(1) manpage](https://download.samba.org/pub/rsync/rsync.1)

function RSYNC() {
    echo
    echo ${RULE}
    echo "Sync $1"
    rsync -av --delete ${DRY_RUN}  "$1"  "${HOST}:${DEST}"
}

function RSYNC_NODE_MODULE() {
    echo
    echo ${RULE}
    echo "Sync node module $1"
    rsync -av --delete ${DRY_RUN}  "node_modules/$1"  "${HOST}:${DEST}/node_modules"
}

function RSYNC_NODE_MODULES() {
    echo
    echo ${RULE}
    echo "Sync node_modules"
    rsync -av --delete --delete-before ${DRY_RUN}  "${NODE_MODULES}/"  "${HOST}:${DEST}/node_modules/"
}

####################################################################################################

# systemctl stop wikijs
# systemctl start wikijs

#! RSYNC_NODE_MODULES
RSYNC assets
#! RSYNC server

# to set dev = false
#   cf. server/core/config.js
#     const packageInfo = require(path.join(WIKI.ROOTPATH, 'package.json'))
#! RSYNC package.json

####################################################################################################

## RSYNC_NODE_MODULE katex
## RSYNC_NODE_MODULE 'markdown-it*'

## RSYNC yarn.lock
