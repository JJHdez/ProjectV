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

from flask_restful import Resource
from flask import request, g, jsonify
from v.tools.v import tuple2list
from v.tools.exception import ExceptionRest
from v.habit.model.historyHabitMdl import HistoryHabitMdl


class HistoryHabitListRst(Resource, HistoryHabitMdl):

    def get(self):
        _get = jsonify()
        try:
            data = g.db_conn.execute("select * from %s where user_id='%s'" % (self._table, g.user.id,))
            if g.db_conn.count() > 0:
                _get = tuple2list(self._fields, data)
                _get = jsonify(_get)
                _get.status_code = 200
            else:
                raise ExceptionRest(status_code=404)
        except ExceptionRest, e:
            _get.status_code = e.status_code
        return _get

    def post(self):
        _post = jsonify()
        try:
            _data = request.json
            _insert = []
            qri = "insert into %s (user_id, habit_id, state) values(%s, %s, '%s') returning id;" \
                  % (self._table, g.user.id, _data.get('habit_id'), _data.get('state'))
            g.db_conn.execute(qri)
            if g.db_conn.count() > 0:
                _insert.append({"id": g.db_conn.one()[0]})
                _post = jsonify(_insert)
                _post.status_code = 201
            else:
                raise ExceptionRest(status_code=400)
        except ExceptionRest, e:
            _post.status_code = e.status_code
        return _post


class HistoryHabitRst(Resource, HistoryHabitMdl):

    def get(self, history_habit_id):
        _get = jsonify()
        try:
            g.db_conn.execute('select * from %s where user_id =%s and id = %s;'
                                     % (self._table, g.user.id, str(history_habit_id)))
            if g.db_conn.count() > 0:
                _get = jsonify(tuple2list(self._fields, g.db_conn.fetch()))
                _get.status_code = 200
            else:
                raise ExceptionRest(status_code=404)
        except ExceptionRest, e:
            _get.status_code = e.status_code
        return _get

    def delete(self, history_habit_id):
        _delete = jsonify()
        try:
            qrd = "delete from %s where user_id=%s and id=%s" % (self._table, g.user.id, history_habit_id)
            g.db_conn.execute(qrd)
            if g.db_conn.count() > 0:
                _delete.status_code = 204
            else:
                _delete.status_code = 404
        except ExceptionRest, e:
            _delete.status_code = e.status_code
        return _delete

    def put(self, history_habit_id):
        _put = jsonify()
        try:
            raise ExceptionRest(status_code=401)
            _data = request.json
            qru = "update %s set state ='%s' where user_id=%s and id = %s" % \
                  (self._table, _data.get('state'), g.user.id, history_habit_id)
            g.db_conn.execute(qru)
            if g.db_conn.count() > 0:
                _put.status_code = 201
            else:
                raise ExceptionRest(status_code=404)
        except ExceptionRest, e:
            _put.status_code = e.status_code
        return _put
