####################################################################################################

from pprint import pprint

from invoke import task

####################################################################################################

@task
def test1(ctx):
    from .lib.graphql import Model as M
    _ = {'system': {'info': {'currentVersion': '2.0.0',
'groupsTotal': 2,
'latestVersion': '2.0.0',
'pagesTotal': 0,
'tagsTotal': 0,
'usersTotal': 2}}}
    _ = M.SystemQuery(**_['system'])
    pprint(_)
    pprint(_.info)
