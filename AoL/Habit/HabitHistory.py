# -*- coding: utf-8 -*-
# © 2016. by Zero 1/0.
from flask_restful import Resource
from flask import request, g, jsonify
from AoL.Utils.Utils import tuple2list
from AoL.Utils.Exception import ExceptionRest


class HistoryHabitR:
    _table = 'history_habits'
    _fields = ['id', 'created_date', 'user_id', 'habit_id', 'state']

    def __init__(self):
        pass


class HistoryHabitList(Resource, HistoryHabitR):

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


class HistoryHabit(Resource, HistoryHabitR):

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
