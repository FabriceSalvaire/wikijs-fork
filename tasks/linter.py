####################################################################################################

from pathlib import Path
import subprocess

from invoke import task

from . settings import DENO
from .lib.helper import printc, join_cmd

####################################################################################################

@task
def format(ctx, path, ext='.js', check=True):
    # config in deno.json
    # https://docs.deno.com/runtime/fundamentals/configuration/#formatting
    # https://dprint.dev/plugins/typescript/
    path = Path(path)   # .resolve()
    cmd = [
        DENO,
        'fmt',
    ]
    if check:
        cmd.append('--check')
    if path.is_file():
        print(join_cmd(cmd))
        cmd.append(str(path))
        subprocess.run(cmd)
    else:
        for root, dirs, files in path.walk():
            root = Path(root)
            # protection
            for _ in ('assets', 'node_modules'):
                if _ in dirs:
                    dirs.remove(_)
            for _ in files:
                _ = root.joinpath(_)
                if _.name in (
                    'eslint.config-orig.js',
                ):
                    continue
                if _.suffix == ext:
                    cmd_ = cmd + [str(_)]
                    print(join_cmd(cmd_))
                    subprocess.run(cmd_)
