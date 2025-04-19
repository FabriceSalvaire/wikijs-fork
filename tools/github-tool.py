####################################################################################################

import json
import time
from pathlib import Path
from pprint import pprint

from github import Github

import requests

####################################################################################################

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

root_source = Path(__file__).parents[1]
pr_dir = root_source.joinpath('pr')

repo = get_repo()

pulls_json = {}
pulls = repo.get_pulls(state='open', sort='created', base='main')
for pr in pulls:
    print(pr)
    # pprint(pr.__dict__)
    # pprint(pr._rawData)
    # pulls_json[pr.number] = {
    #     'title': pr.title,
    # }
    pulls_json[pr.number] = pr._rawData
    diff_file = pr_dir.joinpath(f'pr-{pr.number}.diff')
    if not diff_file.exists():
        # [Get pull request diff from API](https://github.com/orgs/community/discussions/24460)
        # f'https://github.com/{REPOSITORY_NAME}/pull/{pr.number}.diff'
        rq = requests.get(pr.diff_url)
        diff_file.write_text(rq.text)

JSON_FILE = pr_dir.joinpath('pulls.json')
with open(JSON_FILE, 'w', encoding='utf8') as fh:
    json.dump(
        pulls_json,
        fh,
        sort_keys=True,
        indent=4,
    )

# issues = repo.get_issues()
# for _ in issues:
#     print(_)
#     print(list(_.get_labels()))
#     print(list(_.get_comments()))
#     time.sleep(10)
