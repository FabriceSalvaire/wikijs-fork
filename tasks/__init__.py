# http://www.pyinvoke.org
#   last is 2.2.0 2023-07-12

####################################################################################################

from types import ModuleType

from invoke import Collection

####################################################################################################

from . import build
from . import clean
from . import explore
from . import fixture
from . import gh
from . import GraphQL
from . import linter
from . import pnpm
from . import sync
from . import yarn

modules = [obj for name, obj in globals().items() if isinstance(obj, ModuleType)]
ns = Collection()
for _ in modules:
    ns.add_collection(Collection.from_module(_))

# ns = Collection()
# ns.add_collection(Collection.from_module(anaconda))
