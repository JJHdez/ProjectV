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
from flask import request, g, abort
from AoL.Utils.Exception import ExceptionRest
from AoL.Utils.Utils import processing_rest_exception, processing_rest_success, \
    type_of_insert_rest, type_of_update_rest
from AoL.Utils.Validate import validate_rest


class User(object):

    def __init__(self, id, email=None, name=None, last_name=None, cover=None, timezone=None):
        self.id = id
        self.email = email
        self.name = name
        self.last_name = last_name
        self.cover = cover
        self.timezone = timezone


class UserR:
    _table = 'users'
    _fields = {}

    def __init__(self):
        pass


class UserList(Resource, UserR):
    def get(self):
        try:
            _get = request.args.get("get", False)
            _qrg = ''
            # """
            #     SELECT array_to_json(array_agg(row_to_json(t) )) as collection
            #     FROM ( SELECT id, email, name, last_name FROM %s WHERE
            #     deleted_at IS NULL AND create_id=%s )t;
            #     """ % (self._table, g.user.id,)

            if _get == 'team':
                _by = request.args.get('by', False)
                if _by == 'project_task_id':
                    _project_task_id = request.args.get('project_task_id', False)
                    _qrg = """
                    SELECT array_to_json(array_agg(row_to_json(t) )) as collection FROM (
                        SELECT
                          id, email, name, last_name FROM users
                        WHERE id = %s
                          UNION ALL
                        SELECT
                          u.id, u.email, u.name, u.last_name
                        FROM
                          project_teams pt INNER JOIN
                            project_teams_projects ptp
                          ON pt.id = ptp.team_id AND ptp.deleted_at IS NULL AND pt.deleted_at IS NULL
                          INNER JOIN
                            users u ON u.id = ptp.user_id
                        WHERE ptp.project_id = (SELECT project_id FROM project_tasks WHERE id = %s)
                          AND  u.id NOT IN (%s)
                     )t;

                    """ % (g.user.id, _project_task_id, g.user.id)

            else:
                abort(404)
            g.db_conn.execute(_qrg)
            if g.db_conn.count() > 0:
                _collection = g.db_conn.one()[0]
                if _collection:
                    _data = {self._table: _collection}
                    _get = processing_rest_success(data=_data)
                else:
                    raise ExceptionRest(status_code=404, message="No se han encontrado resultados")
            else:
                raise ExceptionRest(status_code=404, message="No se han encontrado resultados")
        except (Exception, ExceptionRest), e:
            _get = processing_rest_exception(e)
        return _get

    def post(self):
        _request = request.json
        try:
            _errors = validate_rest(fields=self._fields, request=_request)
            if not _errors:
                _col, _val = type_of_insert_rest(self._fields, _request)
                _qrp = """
                    INSERT INTO %s (create_id , %s ) VALUES (%s, %s)
                    RETURNING (select row_to_json(collection) FROM (VALUES(id)) collection(id));
                """ % (self._table, _col, g.user.id, _val)
                g.db_conn.execute(_qrp)
                if g.db_conn.count() > 0:
                    _data = {self._table: g.db_conn.one()}
                    _post = processing_rest_success(data=_data, message='Fue creado correctamente',
                                                    status_code=201)
                else:
                    raise ExceptionRest(status_code=500, message='No se ha podido registrar')
            else:
                raise ExceptionRest(status_code=400, errors=_errors)
        except (Exception, ExceptionRest), e:
            _post = processing_rest_exception(e)
        return _post


class UserU(Resource, UserR):
    def get(self, id):
        try:
            _qrg = """
                    SELECT array_to_json(array_agg(row_to_json(t) )) as collection
                    FROM ( SELECT * FROM %s WHERE deleted_at IS NULL AND create_id=%s and id = %s)t;
                """ % (self._table, g.user.id, id,)
            g.db_conn.execute(_qrg)
            if g.db_conn.count() > 0:
                _collection = g.db_conn.one()[0]
                if _collection:
                    _data = {self._table: _collection}
                    _get = processing_rest_success(data=_data)
                else:
                    raise ExceptionRest(status_code=404, message="No se han encontrado resultados")
            else:
                raise ExceptionRest(status_code=404, message="No se han encontrado resultados")
        except (Exception, ExceptionRest), e:
            _get = processing_rest_exception(e)
        return _get

    def put(self, id):
        _request = request.json
        try:
            _errors = validate_rest(fields=self._fields, request=_request)
            if not _errors:
                _val = type_of_update_rest(self._fields, _request)
                _qrp = "UPDATE %s SET %s WHERE id=%s;" % (self._table, _val, id,)
                g.db_conn.execute(_qrp)
                if g.db_conn.count() > 0:
                    _put = processing_rest_success(status_code=201, message="El registro fue actualizado correctamente")
                else:
                    raise ExceptionRest(status_code=404,
                                        message="No se ha podido encontrar el registro, para actualizar.")
            else:
                raise ExceptionRest(status_code=400, errors=_errors)
        except (Exception, ExceptionRest), e:
            _put = processing_rest_exception(e)
        return _put

    def delete(self, id):
        try:
            _qrd = "UPDATE %s SET deleted_at=current_timestamp WHERE id=%s;" % (self._table, id,)
            g.db_conn.execute(_qrd)
            if g.db_conn.count() > 0:
                _delete = processing_rest_success(status_code=201, message="El registro fue eliminado correctamente")
            else:
                raise ExceptionRest(status_code=404,
                                    message="No se ha podido encontrar el registro, para eliminar.")
        except (Exception, ExceptionRest), e:
            _delete = processing_rest_exception(e)
        return _delete
