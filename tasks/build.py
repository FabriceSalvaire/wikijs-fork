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

SOURCE_PATH = Path(__file__).parents[1]
NODE_MODULES = SOURCE_PATH.joinpath('node_modules')

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

####################################################################################################

@task
def bind_dev(ctx):
    if not list(NODE_MODULES.iterdir()):
        ctx.run(f"sudo mount --bind {ctx.config.node_modules.prod} {NODE_MODULES}")

####################################################################################################

#@task(pre=[symlink_dev], post=[])
@task(pre=[bind_dev], post=[])
def build(ctx, verbose=False):
    cmd = [
        NODE,
        str(NODE_MODULES.joinpath('webpack/bin/webpack.js')),
        '--color=true',   # to force color else it detects a pipe instead of tty
        '--profile',   # captures timing information for each step of the compilation and includes this in the output
        '--config',
        'dev/webpack/webpack.prod.js',
    ]
    if verbose:
        cmd.append('--verbose')
    print(' '.join(cmd))
    subprocess.run(
        cmd,
        env={
            'NODE_OPTIONS': '--openssl-legacy-provider',
        },
    )
    if not SOURCE_PATH.joinpath('assets', 'manifest.json'):
        print("Build Failed")
    else:
        print("Build succeed")

####################################################################################################

@task
def start(ctx):
    cmd = [
        NODE,
        'server',
    ]
    subprocess.run(
        cmd,
        # env={
        #     'NODE_OPTIONS': '--openssl-legacy-provider',
        # },
    )
