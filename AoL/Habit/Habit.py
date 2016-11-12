 # -*- coding: utf-8 -*-
# © 2016. by Zero 1/0.
from flask_restful import Resource
from flask import request, abort, g, jsonify
from AoL.Utils.Utils import tuple2list
from AoL.Utils.Exception import ExceptionRest


class HabitR:
    _fields = ['id', 'created_date', 'user_id', 'finished_date', 'closed_date', 'name']
    _table = 'habits'

    def __init__(self):
        pass


class HabitList(Resource, HabitR):

    def get(self):
        _get = jsonify()
        try:
            _view = request.args.get("view")
            if not _view:
                data = g.db_conn.execute("select * from %s where user_id='%s' order by id asc;"
                                         % (self._table, g.user.id,))
                if g.db_conn.count() > 0:
                    _get = jsonify(tuple2list(self._fields, data))
                    _get.status_code = 200
                else:
                    raise ExceptionRest(status_code=404)
            elif _view == 'current_task':
                _date = request.args.get("date")
                _get = jsonify(self.current_task(_date))
                _get.status_code = 200
            else:
                raise ExceptionRest(status_code=404)
        except ExceptionRest, e:
            _get.status_code = e.status_code
        return _get

    def current_task (self, _date):
        # print _date
        _qrs = """SELECT
          d.id,
          d.name,
          '' state,
          (SELECT count(id) FROM history_habits tdh1 WHERE tdh1.habit_id =d.id and tdh1.user_id =d.user_id and tdh1.state='success') success,
          (SELECT count(id) FROM history_habits tdh1 WHERE tdh1.habit_id =d.id and tdh1.user_id =d.user_id and tdh1.state='fail') fail
        FROM habits d LEFT JOIN history_habits dh
        ON d.id =dh.habit_id AND d.user_id = dh.user_id
        AND dh.created_date::timestamp::DATE='%s'
        WHERE
          d.closed_date IS NULL
          and d.user_id = %s
          and dh.id is NULL
        ;""" % (_date, g.user.id)
        # print _qrs
        _current_task = []
        _data = g.db_conn.execute(_qrs)
        if g.db_conn.count() > 0:
            _current_task = tuple2list(['id', 'name', 'status', 'success', 'fail'], _data)
        else:
            raise ExceptionRest(status_code=404)
        return _current_task

    def post(self):
        _data = request.json
        _insert = []
        _post = _insert
        qri = "insert into %s (user_id, name) values(%s,'%s') returning id;" \
              % (self._table, g.user.id, _data.get('name'))
        g.db_conn.execute(qri)
        if g.db_conn.count() > 0:
            _insert.append({"id": g.db_conn.one()[0]})
        _post = jsonify(_insert)
        return _post


class Habit(Resource, HabitR):

    def get(self, habit_id):
        data = g.db_conn.execute('select * from %s where user_id =%s and id = %s;'
                                 % (self._table, g.user.id, str(habit_id)))
        _get = tuple2list(self._fields, data)
        r = jsonify(_get)
        if len(_get) <= 0:
            r.status_code = 404
        else:
            r.status_code = 200
        return r

    def delete(self, habit_id):
        qrd = "delete from %s where user_id=%s and id=%s" % (self._table, g.user.id, habit_id)
        _data = g.db_conn.execute(qrd)
        _delete = jsonify()
        if g.db_conn.count() > 0:
            _delete.status_code = 200
        else:
            _delete.status_code = 404
        return _delete

    def put(self, habit_id):
        _data = request.json
        _put = jsonify()
        # print _data
        qru = "update  %s set name ='%s' where user_id=%s and id = %s" % \
              (self._table, _data.get('name'), g.user.id, habit_id)
        g.db_conn.execute(qru)
        if g.db_conn.count() > 0:
            _put.status_code = 200
        else:
            _put.status_code = 404
        return _put
