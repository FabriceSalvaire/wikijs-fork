####################################################################################################

import json
import time
from pathlib import Path
from pprint import pprint

from github import Github

import requests

####################################################################################################

ROOT_SOURCE = Path(__file__).parents[1]
PR_DIR = ROOT_SOURCE.joinpath('pr')
PULLS_JSON_FILE = PR_DIR.joinpath('pulls.json')

REPOSITORY_NAME = 'requarks/wiki'

####################################################################################################

class Account:

    ##############################################

    def __init__(self) -> None:
        self._github = None

    ##############################################

    def login(self):
        if self._github is None:
            token_path = Path(__file__).parent.joinpath('.github-token')
            # ('~/.github-token).expanduser()
            # with open(token_path, 'r') as f:
            #     token = f.readline().strip()
            token = token_path.read_text().strip()
            self._github = Github(login_or_token=token)

    ##############################################

    @property
    def github(self):
        return self._github

####################################################################################################

def get_repo():
    account = Account()
    account.login()
    g = account.github
    repo = g.get_repo(REPOSITORY_NAME)
    return repo

####################################################################################################

def cleanup_dict(data: dict, keys: list[str]) -> dict:
    return {key: value for key, value in data.items() if key in keys}

def cleanup_user(data: dict) -> dict:
    return cleanup_dict(data, ('login', 'id'))

def cleanup_repo(data: dict) -> dict:
    return cleanup_dict(data, ('url', 'id'))

def cleanup_pulls(data: dict) -> None:
    for key, value in data.items():
        match key:
            case 'user' | 'assignee' | 'owner':
                if isinstance(value, dict):
                    data[key] = cleanup_user(value)
            case 'assignees' | 'requested_reviewers':
                data[key] = [cleanup_user(_) for _ in value]
            case 'repo':
                data[key] = cleanup_repo(value)
        match value:
            case dict():
                cleanup_pulls(value)

####################################################################################################

def dump_pull_request(dump_json: bool = True) -> None:
    pulls_json = {}

    pulls = repo.get_pulls(state='open', sort='created', base='main')
    for pr in pulls:
        time.sleep(1)
        print(pr)
        # pprint(pr.__dict__)
        # pprint(pr._rawData)
        # pulls_json[pr.number] = {
        #     'title': pr.title,
        # }
        # raw data contains a lot of noises !
        pulls_json[pr.number] = pr._rawData
        pulls_json[pr.number]['comments'] = [_._rawData for _ in pr.get_comments()]
        # Write Diff
        diff_file = PR_DIR.joinpath(f'pr-{pr.number}.diff')
        if not diff_file.exists():
            # [Get pull request diff from API](https://github.com/orgs/community/discussions/24460)
            # f'https://github.com/{REPOSITORY_NAME}/pull/{pr.number}.diff'
            rq = requests.get(pr.diff_url)
            diff_file.write_text(rq.text)

    if dump_json:
        cleanup_pulls(pulls_json)
        with open(PULLS_JSON_FILE, 'w', encoding='utf8') as fh:
            json.dump(
                pulls_json,
                fh,
                sort_keys=True,
                indent=4,
            )

####################################################################################################

repo = get_repo()
dump_pull_request()

# issues = repo.get_issues()
# for _ in issues:
#     print(_)
#     print(list(_.get_labels()))
#     print(list(_.get_comments()))
#     time.sleep(10)

# with open(PULLS_JSON_FILE, 'r', encoding='utf8') as fh:
#     pulls_json = json.load(fh)
