# -*- coding: utf-8 -*-
# ZERO 1/0 © 2016
from time import gmtime, strftime
import subprocess
import os
import datetime
DB_PASSWORD = os.environ.get('OPENSHIFT_POSTGRESQL_DB_PASSWORD', '0d004dm1n')
DB_NAME = os.environ.get('PGDATABASE', 'aol')
DB_USER = os.environ.get('OPENSHIFT_POSTGRESQL_DB_USERNAME', 'odoo')
DB_HOST = os.environ.get('OPENSHIFT_POSTGRESQL_DB_HOST', 'localhost')
DB_PORT = int(os.environ.get('OPENSHIFT_POSTGRESQL_DB_PORT', 5432))
BACKUP_DIR = os.getcwd() + '/backup/'


def log(string):
    print str(datetime.datetime.now()) + ": " + str(string)

database_list = subprocess.Popen(
    'echo "select datname from pg_database" | psql -t -U %s -h %s template1' % (DB_USER, DB_HOST), shell=True,
    stdout=subprocess.PIPE).stdout.readlines()

for database_name in database_list:
    if database_name.strip() == DB_NAME:
        log("dump started for %s" % database_name.strip())
        thetime = str(strftime("%Y-%m-%d.%H-%M"))
        file_name = database_name.strip() + '_' + thetime + ".sql.pgdump"
        log(file_name)
        # pg_dump
        command = "pg_dump -i -h %s -p %s -U %s -F c -b -v -f \"%s\" %s" \
                  % (DB_HOST, DB_PORT, DB_USER,  BACKUP_DIR + file_name, database_name.strip())
        log(command)
        subprocess.call(command, shell=True)
        log("%s dump finished" % database_name)
log("Backup job complete.")