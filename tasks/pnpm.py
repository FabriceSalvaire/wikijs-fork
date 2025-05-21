####################################################################################################

# from pprint import pprint
from pathlib import Path
import os
import subprocess

from invoke import task

from .lib.helper import SOURCE_PATH, printc, join_cmd
from .lib.node import PackageJson

from .settings import PNPM

####################################################################################################

def read_package_json(source_path) -> PackageJson:
    package_json_file = source_path.joinpath('package.json')
    return PackageJson(package_json_file)

####################################################################################################

@task
def remove_dev_dependencies(ctx, source_path) -> None:
    source_path = Path(source_path).absolute()
    os.chdir(source_path)
    printc(f'<green>CWD</green> <blue>{Path.cwd()}</blue>')
    print()
    package_json = read_package_json(source_path)
    for _ in package_json.dev_dependencies.values():
        printc(f'  <red>Remove</red> <blue>{_.name}</blue>')
        cmd = (
            PNPM,
            'remove',
            '--save-dev',
            _.name,
        )
        print(join_cmd(cmd))
        subprocess.run(cmd, shell=False, check=True)
    # cmd = [
    #     PNPM,
    #     'remove',
    #     '--save-dev',
    # ]
    # cmd.extend(package_json.dev_dependencies)
    # print(join_cmd(cmd))
    # subprocess.run(cmd, shell=False, check=True)
