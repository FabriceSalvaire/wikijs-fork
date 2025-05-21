####################################################################################################

from pathlib import Path
from pprint import pprint
import json

try:
    import requests
    import graphql as gql_core
except ModuleNotFoundError:
    pass

from ..helper import printc

from . import queries as Q

try:
    import pydantic
    from . import Model as M
except ModuleNotFoundError:
    pass

####################################################################################################

def xpath(data: dict, path: str) -> dict:
    d = data
    for _ in str(path).split('/'):
        d = d[_]
    return d

####################################################################################################

class GraphQL:

    ##############################################

    def __init__(self, host: str, api_key: str = None) -> None:
        self._api_url = f'{host}/graphql'
        self._logged = False
        if api_key:
            self._api_key = str(api_key)
            self._headers = {
                'Authorization': f'Bearer {api_key}',
                # 'content-type': 'application/json',
            }
        else:
            self._api_key = None
            self._headers = {}

    ##############################################

    @property
    def api_url(self) -> str:
        return self._api_url

    ##############################################

    def _from_json(self, data: dict):
        # Fixme:
        #   {'system': {'__typename': 'SystemQuery',
        pprint(data)
        for key, value in data.items():
            typename = value.get('__typename', None)
            if typename:
                return getattr(M, typename)(**value)

    ##############################################

    def query(self, query: dict, **variables) -> dict:
        payload = {
            # 'operationName': '',
            'variables': variables,
            'query': query,
        }
        response = requests.post(self._api_url, json=payload, headers=self._headers)
        if response.status_code != requests.codes.ok:
            raise NameError(f"Error {response}")
        data = response.json()
        if 'errors' in data:
            pprint(data)
            raise NameError
        else:
            return self._from_json(data['data'])

    ##############################################

    def write_schema(self, output: Path | str) -> None:
        # schema is directives and *.graphql files
        output = Path(output)
        if output.exists():
            raise NameError(f"Ouput {output} exists")
        json_schema = self.query(Q.INTROSPECTION)
        match output.suffix:
            case '.json':
                data = json.dumps(json_schema, indent=4)
            case '.graphql':
                schema = gql_core.build_client_schema(json_schema)
                data = gql_core.print_schema(schema)
            case _:
                raise ValueError(f"Unknow suffix {output}")
        output.write_text(data)

    ##############################################

    def login(self, username: str, password: str) -> None:
        printc(f'<blue>login using</> "<green>{username}</>" "<green>{password}</>"')
        authentication = self.query(
            Q.LOGIN,
            username=str(username),
            password=str(password),
            strategy='local',
        )
        login = authentication.login
        if login.responseResult.succeeded:
            jwt = login.jwt
            self._headers = {
                'Authorization': f'Bearer {jwt}',
            }
            self._logged = True
            printc(f'<green>login succeeded</>')

    ##############################################

    def info(self) -> None:
        data = self.query(Q.INFO)
        pprint(data)
