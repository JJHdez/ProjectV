#!/usr/bin/env bash
#ssh 58078eb62d5271587c0000bd@art0flife-zero1zero.rhcloud.com <<EOF
#cd app-root/repo/AoL/bin
#python backup.py
#ls -t backup | head -n 1
#EOF
#scp 58078eb62d5271587c0000bd@art0flife-zero1zero.rhcloud.com:~/app-root/repo/AoL/bin/backup/"aol_2016-11-24.19-17.sql.pgdump" ./
#pg_restore -i -h localhost -p 5432 -U odoo -d aol -v -c backup/art0flife_2016-11-30.01-07.sql.pgdump