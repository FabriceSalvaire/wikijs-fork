####################################################################################################

from pathlib import Path
import subprocess

from invoke import task

from . settings import DENO
from .lib.helper import printc, join_cmd

####################################################################################################

@task
def format(ctx, path, check=True):
    # config in deno.json
    # https://docs.deno.com/runtime/fundamentals/configuration/#formatting
    # https://dprint.dev/plugins/typescript/
    path = Path(path).resolve()
    cmd = [
        DENO,
        'fmt',
    ]
    if check:
        cmd.append('--check')
    cmd.append(str(path))
    print(join_cmd(cmd))
    subprocess.run(cmd)
