# -*- coding: utf-8 -*-
# © 2016. by Zero 1/0.
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