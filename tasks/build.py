####################################################################################################

from pathlib import Path
import subprocess
import sys

from invoke import task

####################################################################################################

# "start": "node server",
# "dev": "NODE_OPTIONS=--openssl-legacy-provider node dev",
# "build": "NODE_OPTIONS=--openssl-legacy-provider webpack --profile --config dev/webpack/webpack.prod.js",
# "watch": "NODE_OPTIONS=--openssl-legacy-provider webpack --config dev/webpack/webpack.dev.js",
# "test": "eslint --format codeframe --ext .js,.vue . && pug-lint server/views && jest",
# "cypress:open": "cypress open",
# "postinstall": "patch-package"

####################################################################################################

NODE = '/usr/bin/node'
NPX = '/usr/bin/npx'

WIKIJS_DIR = Path(__file__).parents[1]
NODE_MODULES = WIKIJS_DIR.joinpath('node_modules')

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
    # sh: line 1: webpack: command not found
    # cmd = ('webpack', '--profile', '--config', 'dev/webpack/webpack.prod.js')
    # cmd = ' '.join(cmd)
    # cmd = (NPX, '-c', ...)
    # cmd = f"{NPX} -c '{cmd}'"
    cmd = (
        NODE,
        str(NODE_MODULES.joinpath('webpack/bin/webpack.js')),
        '--profile',
        '--color=true',
        '--config',
        'dev/webpack/webpack.prod.js',
    )
    print(' '.join(cmd))
    subprocess.run(
        cmd,
        # ' '.join(cmd),
        # shell=True,
        env={
            'NODE_OPTIONS': '--openssl-legacy-provider',
        },
        # cwd=WIKIJS_DIR,
    )
