####################################################################################################

from pathlib import Path
# from pprint import pprint
# import json
# import sys
import subprocess

from invoke import task

# try:
from .lib.graphql import GraphQL
# except ImportError:
#     pass

# from .lib.helper import printc

from . import settings as S

####################################################################################################

@task
def schema(ctx, host=S.HOST, output='schema.graphql'):
    gql = GraphQL(host)
    gql.write_schema(output)

####################################################################################################

@task
def generate(ctx, input='schema.graphql', output='model.py', type_='pydantic'):
    input = Path(input)
    output = Path(output)
    if output.exists():
        raise NameError(f"Ouput {output} exists")
    match input.suffix:
        # supported input types: auto, openapi, jsonschema, json, yaml, dict, csv, graphql
        # not compatible
        # case '.json':
        #     input_type = 'jsonschema'
        case '.graphql':
            input_type = 'graphql'
        case _:
            raise ValueError(f'Unsupported type {input}')
        # supported output types: pydantic.BaseModel, pydantic_v2.BaseModel, dataclasses.dataclass,
        #  typing.TypedDict, msgspec.Struct
    match type_:
        case 'pydantic':
            output_type = 'pydantic_v2.BaseModel'
        case 'dataclass':
            output_type = 'dataclasses.dataclass'
        case _:
            raise ValueError(f'Unknow type {output_type}')
    # print(f"Type is {input_type}")
    cmd = (
        'datamodel-codegen',
        '--input-file-type', input_type,
        '--input', input,
        '--output-model-type', output_type,
        '--output', output,
    )
    subprocess.run(cmd)

####################################################################################################

@task
def login(ctx, host=S.HOST, username=S.FAKE_EMAIL, password=S.FAKE_PASSWORD):
    gql = GraphQL(host)
    gql.login(username, password)
    gql.info()
