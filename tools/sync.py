#! /usr/bin/env python3

####################################################################################################

import subprocess

####################################################################################################

NODE_MODULES = '/srv/cache/fabrice/node_modules-prod'
HOST = 'vps-vpn'
DEST = '/var/www/wikijs'

DRY_RUN = False

RULE = '-'*50

####################################################################################################

# /!\ using --delete could delete / !!!
#
# rsync foo 'bar:file' /
#   Unexpected remote arg: bar:file
#
# [rsync(1) manpage](https://download.samba.org/pub/rsync/rsync.1)

def run(src: str, dst: str = '') -> None:
    cmd = ['/usr/bin/rsync', '-av', '--delete', '--delete-before']
    if DRY_RUN:
        cmd.append('--dry-run')
    cmd.append(src)
    cmd.append(f'{HOST}:{DEST}/{dst}')
    print(' '.join(cmd))
    subprocess.run(cmd, shell=False, check=True)

####################################################################################################

def sync(filename: str) -> None:
    print()
    print(RULE)
    print(f"Sync {filename}")
    run(filename)

def sync_node_module(package: str) -> None:
    print()
    print(RULE)
    print(f"Sync node module {package}")
    run(f'node_modules/{package}', 'node_modules')

def sync_node_modules() -> None:
    print()
    print(RULE)
    print("Sync node_modules")
    run(f'{NODE_MODULES}/', 'node_modules/')


####################################################################################################

# systemctl stop wikijs
# systemctl start wikijs

# sync_node_modules()
sync('assets')
# sync('server')

# to set dev = false
#   cf. server/core/config.js
#     const packageInfo = require(path.join(WIKI.ROOTPATH, 'package.json'))
#! sync('package.json')

####################################################################################################

## SYNC_NODE_MODULE katex
## SYNC_NODE_MODULE 'markdown-it*'

## SYNC yarn.lock
