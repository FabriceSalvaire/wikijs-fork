####################################################################################################

from pathlib import Path
from pprint import pprint
import base64
import subprocess
import time
import sys
import yaml

from invoke import task

try:
    import requests
    import yaml
except ImportError:
    pass

from .lib.helper import printc

####################################################################################################

SOURCE_PATH = Path(__file__).parents[1]
SERVER_PATH = SOURCE_PATH / 'wikijs-server'

# Default fake (encoded) email and password
FAKE_EMAIL = base64.b64decode(b'YWRtaW5Ad2lraWpzLm9yZw==').decode('utf8')
FAKE_PASSWORD = 'wikijs'

NODE = '/usr/bin/node'

####################################################################################################

def load_config() -> dict:
    path = SERVER_PATH / 'config.yml'
    config_data = yaml.load(path.read_text(), Loader=yaml.SafeLoader)
    # pprint(config_data)
    return config_data

####################################################################################################

def read_output(process: subprocess.Popen, until: str) -> None:
    until  = until.encode('utf8')
    try:
        while True:
            _ = process.stdout.readline()
            if _:
                print(_.decode('utf8').rstrip())
                if until in _:
                    break
    except Exception:
        process.kill()


@task
def setup(
    ctx,
    host: str = 'http://localhost:3001',
    email: str = FAKE_EMAIL,
    password: str = FAKE_PASSWORD,
    run_node: bool = False,
):
    """Perfom a wiki setup"""
    config_data = load_config()
    db = SERVER_PATH / config_data['db']['storage']

    printc(f'db: <green>{db}</>')
    printc(f'email: <green>{email}</>')
    printc(f'password: <green>{password}</>')

    if not run_node and not db.exists():
        printc(f'<red>Server down ?</>')
        sys.exit(1)

    node = None
    if run_node:
        cmd = (NODE, 'server',)
        print()
        printc('<red>Start server...</>')
        node = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            # stderr=subprocess.PIPE,
        )
        read_output(node, until='🔺🔺🔺')

    # Send setup form data
    print()
    url = f'{host}/finalize'
    data = {
        'adminEmail': email,
        'adminPassword': password,
        'adminPasswordConfirm': password,
        'siteUrl': 'http://localhost:3001',
        'telemetry': False,
    }
    printc('<red>Post setup form...</>')
    pprint(data)
    _ = requests.post(url, json=data)
    printc('<red>Server reply is</>')
    print(_.text)

    if node:
        print()
        read_output(node, until='Rebuilding page tree: [ COMPLETED ]')
        node.kill()
        print()
        printc('<red>Done</>')
