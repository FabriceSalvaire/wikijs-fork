####################################################################################################

from pathlib import Path

from invoke import task

####################################################################################################

def find(file_filter, src: Path = Path('.')):
    to_delete = []
    for root, _, filenames in src.walk():
        root = Path(root)
        for _ in filenames:
            path = root.joinpath(_)
            if file_filter(path):
                to_delete.append(path)
    if to_delete:
        to_delete.sort()
        rule = '='*100
        print(rule)
        for path in to_delete:
            print(path)
        print(rule)
        rc = input('remove ? [n]/y ')
        # if rc == 'y':
        #     for path in to_delete:
        #         path.unlink(missing_ok=True)

####################################################################################################

@task
def emacs_backup(ctx):
    # ctx.run('find . -name "*~" -type f -exec /usr/bin/rm -f {} \;')
    find(lambda filename: filename.suffix.endswith('~'))

@task(emacs_backup)
def clean(ctx):
    pass
