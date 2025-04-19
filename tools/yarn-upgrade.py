#! /usr/bin/env python3

####################################################################################################

import shutil
import subprocess
from datetime import datetime

def upgrade(name: str, semver: str) -> None:
    # Fixme: dev
    # print(name, semver)
    cmd = f'yarn upgrade --ignore-optional {name}@{semver}'
    print()
    print(cmd)
    subprocess.run(cmd, shell=True, check=True)

def upgrades(packages: dict) -> None:
    args = []
    for name, semver in packages.items():
        args.append(f'{name}@{semver}')
    args = ' '.join(args)
    cmd = f'yarn add --ignore-optional {args}'
    print(cmd)
    subprocess.run(cmd, shell=True, check=True)

####################################################################################################

packages = {
    # To solve postcss config issue
    # dev
    #! "postcss": "^8.1.0",   # 8.5.3
    #! "postcss-loader": "4.x",   # 4.3.0

    # upgrade
    #! "katex": "0.16.22",

    "@mdi/font": "7.4.47",
}

# for name, semver in packages.items():
#     upgrade(name, semver)

filename = 'yarn.lock'
date = datetime.now().isoformat()
shutil.copyfile(filename, f'{filename}-{date}')

upgrades(packages)
