# -*- coding: utf-8 -*-
# © 2016. by Zero 1/0.
from flask_restful import Resource
from flask import request, abort, g, jsonify
from AoL.Utils.Utils import tuple2list


class DisciplineR:
    _fields = ['id', 'created_date', 'user_id', 'finished_date', 'closed_date', 'name']

    def __init__(self):
        pass


class DisciplineList(Resource, DisciplineR):

    def get(self):
        data = g.db_conn.execute("select * from discipline where user_id='%s'" % (g.user.id, ))
        if g.db_conn.count() <= 0:
            abort(404)
        _get = tuple2list(self._fields, data)
        _get = jsonify(_get)
        _get.status_code = 200
        return _get

    def post(self):
        _data = request.json
        _insert = []
        _post = _insert
        for data in _data:
            qri = "insert into discipline (user_id, name) values(%s,'%s') returning id;" \
                  % (g.user.id, data.get('name'))
            g.db_conn.execute(qri)
            if g.db_conn.count() > 0:
                _insert.append({"id": g.db_conn.one()[0]})
        _post = jsonify(_insert)
        return _post


class Discipline(Resource, DisciplineR):

    def get(self, discipline_id):
        data = g.db_conn.execute('select * from discipline where user_id =%s and id = %s;'
                                 % (g.user.id, str(discipline_id)))
        _get = tuple2list(self._fields, data)
        r = jsonify(_get)
        if len(_get) <= 0:
            r.status_code = 404
        else:
            r.status_code = 200
        return r

    def delete(self, discipline_id):
        qrd = "delete from discipline where user_id=%s and id=%s" % (g.user.id, discipline_id)
        _data = g.db_conn.execute(qrd)
        _delete = jsonify()
        if g.db_conn.count() > 0:
            _delete.status_code = 200
        else:
            _delete.status_code = 404
        return _delete

    def put(self, discipline_id):
        _data = request.json
        _put = jsonify()
        qru = "update discipline set name ='%s' where user_id=%s and id = %s" % \
              (_data.get('name'), g.user.id, discipline_id)
        g.db_conn.execute(qru)
        if g.db_conn.count() > 0:
            _put.status_code = 200
        else:
            _put.status_code = 404
        return _put
