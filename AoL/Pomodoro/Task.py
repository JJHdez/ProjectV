# -*- coding: utf-8 -*-
# Copyright 2017 ProjectV Authors. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

from flask_restful import Resource, reqparse
from flask import g, request
from sqlalchemy import Table, Column, Integer, String, DateTime


class TaskList(Resource):

    def get(self):
        # parser = reqparse.RequestParser()
        # parser.add_argument('email', type=str, help='Email address to create user')
        # parser.add_argument('password', type=str, help='Password to create user')
        # args = parser.parse_args()
        # _userEmail = args['email']
        # _userPassword = args['password']
        # print _userEmail, _userPassword
        print request.json
        return {'status': 200}

    def post(self):
        pass


class Task(Resource):

    def get(self, id):
        pass

    def delete(self, id):
        pass

    def put(self, id):
        pass


class TaskSql:
    def __init__(self):
        pass

    def v1(self):
        v1 = Table('pomodoro_task', g.db_meta,
                   Column('id', Integer, primary_key=True),
                   Column('create_date', DateTime),
                   Column('name', String),
                   Column('state', String),
                   Column('user_id', Integer)
                   )
        g.db_meta.create_all(g.db_conn)