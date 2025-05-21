####################################################################################################

from pathlib import Path
import subprocess

from invoke import task

from .lib.helper import join_cmd
from .settings import SOURCE_PATH, NODE_MODULES

####################################################################################################

RULE = '-'*50

####################################################################################################

def run_command(cmd: list[str]) -> None:
    print(join_cmd(cmd))
    subprocess.run(cmd, shell=False, check=True)

####################################################################################################

def run_pre_post(ctx, operation: str) -> None:
    config = ctx.config.sync
    cmd = (
        config.ssh,
        config.host,
        '-t',
        config[operation],
    )
    run_command(cmd)

####################################################################################################

# /!\ using --delete could delete / !!!
#
# rsync foo 'bar:file' /
#   Unexpected remote arg: bar:file
#
# [rsync(1) manpage](https://download.samba.org/pub/rsync/rsync.1)

def rsync(ctx, src: str, dst: str = '', dry_run: bool = False) -> None:
    config = ctx.config.sync
    RSYNC = config.rsync
    HOST = config.host
    DEST = config.dest

    cmd = [RSYNC, '-av', '--delete', '--delete-before']
    if dry_run:
        cmd.append('--dry-run')
    cmd.append(src)
    cmd.append(f'{HOST}:{DEST}/{dst}')

    run_command(cmd)

####################################################################################################

def sync_source(ctx, filename: str) -> None:
    print()
    print(RULE)
    print(f"Sync {filename}")
    rsync(ctx, filename)

def sync_package(ctx, package: str) -> None:
    print()
    print(RULE)
    print(f"Sync node module {package}")
    rsync(ctx, f'node_modules/{package}', 'node_modules')

def sync_node_modules(ctx) -> None:
    print()
    print(RULE)
    print("Sync node_modules")
    # src = NODE_MODULES + '/'
    src = ctx.config.node_modules.prod + '/'
    rsync(ctx, src, 'node_modules/')

####################################################################################################

@task
def pre(ctx):
    run_pre_post(ctx, 'pre')

@task
def post(ctx):
    run_pre_post(ctx, 'post')

####################################################################################################

@task(pre=[pre], post=[post])
def sync(ctx):
    # sync_node_modules(ctx)
    sync_source(ctx, 'assets')
    sync_source(ctx, 'server')
    # to set dev = false
    #   cf. server/core/config.js
    #     const packageInfo = require(path.join(WIKI.ROOTPATH, 'package.json'))
    #! sync_source(ctx, 'package.json')
