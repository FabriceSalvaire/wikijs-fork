####################################################################################################

import subprocess

from invoke import task

from . settings import DENO

####################################################################################################

@task
def format(ctx, path):
    # config in deno.json
    # https://docs.deno.com/runtime/fundamentals/configuration/#formatting
    # https://dprint.dev/plugins/typescript/
    cmd = (
        DENO,
        'fmt',
        '--check',
        path
    )
    subprocess.run(cmd)
