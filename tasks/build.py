####################################################################################################

from pathlib import Path
import subprocess
# import sys

from invoke import task

# from . import settings as S
from .settings import NODE, NODE_MODULES

####################################################################################################

# "start": "node server",
# "dev": "NODE_OPTIONS=--openssl-legacy-provider node dev",
# "build": "NODE_OPTIONS=--openssl-legacy-provider webpack --profile --config dev/webpack/webpack.prod.js",
# "watch": "NODE_OPTIONS=--openssl-legacy-provider webpack --config dev/webpack/webpack.dev.js",
# "test": "eslint --format codeframe --ext .js,.vue . && pug-lint server/views && jest",
# "cypress:open": "cypress open",
# "postinstall": "patch-package"

####################################################################################################

@task
def dev(ctx):
    # cmd='NODE_OPTIONS=--openssl-legacy-provider node dev'
    # subprocess.run(cmd, shell=True)
    subprocess.run(
        (NODE, 'dev'),
        env={
            'NODE_OPTIONS': '--openssl-legacy-provider',
        },
    )

####################################################################################################

def symlink_node_module(target: Path | str) -> None:
    if NODE_MODULES.exists():
        if str(NODE_MODULES.readlink()) == str(target):
            print(f"node_modules -> {target} is already set")
            return
        if NODE_MODULES.is_symlink():
            # Security Note: unlink does not delete directory
            NODE_MODULES.unlink(missing_ok=True)
        else:
            raise ValueError('node_modules is not a symlink')
    target = Path(target)
    if target.exists():
        NODE_MODULES.symlink_to(target)
    else:
        raise ValueError(f"Target {target} does not exists")

@task
def symlink_dev(ctx):
    symlink_node_module(ctx.config.node_modules.dev)

@task
def symlink_prod(ctx):
    symlink_node_module(ctx.config.node_modules.prod)

@task(pre=[symlink_dev], post=[])
def build(ctx):
    cmd = (
        NODE,
        str(NODE_MODULES.joinpath('webpack/bin/webpack.js')),
        '--color=true',   # to force color else it detects a pipe instead of tty
        '--profile',
        '--config',
        'dev/webpack/webpack.prod.js',
    )
    print(' '.join(cmd))
    subprocess.run(
        cmd,
        env={
            'NODE_OPTIONS': '--openssl-legacy-provider',
        },
    )
