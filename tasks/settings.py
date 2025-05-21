####################################################################################################
#
# See also invoke.yaml
#  ctx.config.foo...
#
####################################################################################################

from pathlib import Path
import base64

####################################################################################################

SOURCE_PATH = Path(__file__).parents[1]
SERVER_PATH = SOURCE_PATH / 'wikijs-server'
NODE_MODULES = SOURCE_PATH.joinpath('node_modules')

####################################################################################################

HOST = 'http://localhost:3001'

# Default fake (encoded) email and password
FAKE_EMAIL = base64.b64decode(b'YWRtaW5Ad2lraWpzLm9yZw==').decode('utf8')
FAKE_PASSWORD = 'wikijs'

####################################################################################################

NODE = '/usr/bin/node'
NPX = '/usr/bin/npx'
PNPM = str(Path('~/.local/share/pnpm/pnpm').expanduser())
DENO = '/usr/local/bin/deno'
