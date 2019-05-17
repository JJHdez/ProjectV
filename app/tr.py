#! /bin/python

import argparse
import os

PYBABEL = 'pybabel'
PATH_TRANSLATIONS = 'translations'

parse = argparse.ArgumentParser(description='Quick translate')

parse.add_argument(
    '-a',
    '--action',
    help='Action to execute',
    required=True,
    choices=['init', 'update', 'compile']
)

parse.add_argument('-l', '--language',
                   help='Language is necessary only when the action is init',
                   default='es', choices=['es', 'en'])

if __name__ == '__main__':
    args = parse.parse_args()
    if args.action == 'init':
        os.system(PYBABEL + ' extract -F babel.cfg -k lazy_gettext -o messages.pot .')
        os.system(PYBABEL + ' init -i messages.pot -d {} -l {} '.format(PATH_TRANSLATIONS,args.language))
        os.unlink('messages.pot')
    elif args.action == 'update':
        os.system(PYBABEL + ' extract -F babel.cfg -k lazy_gettext -o messages.pot .')
        os.system(PYBABEL + ' update -i messages.pot -d {}'.format(PATH_TRANSLATIONS))
        os.unlink('messages.pot')
    elif args.action == 'compile':
        os.system(PYBABEL + ' compile -d {}'.format(PATH_TRANSLATIONS))
