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

from flask import g, jsonify, session, request
from flask_restful import Resource
from v.user.model.userMdl import UserMdl
from v.tools.exception import ExceptionRest
from v.tools.v import processing_rest_exception, processing_rest_success, \
    type_of_insert_rest, type_of_update_rest
from v.tools.validate import validate_rest
from v.auth.model.authMdl import AuthMdl


class Auth:

    def __init__(self):
        pass

    def login(self, data):
        _login = None
        try:
            _email = data.get('email')
            _uid = data.get('uid')
            _auth = data.get('auth')
            _token = data.get('token')
            _mode = data.get('mode', 'app')
            _errors = []
            if not _email:
                _errors.append({'email': 'Is required'})
            if not _uid:
                _errors.append({'uid': 'Is required'})
            if not _auth:
                _errors.append({'auth': 'Is required'})
            if not _token:
                _errors.append({'token': 'Is required'})
            _login = jsonify()
            if len(_errors) == 0:
                qry = "SELECT login('%s', '%s', '%s', '%s');" % (_email, _uid, _auth, _token)
                g.db_conn.execute(qry)
                if g.db_conn.count() > 0:
                    _data_qry = g.db_conn.one()[0]
                    if _data_qry:
                        _status_code = _data_qry['status_code']
                        del _data_qry[u'status_code']
                        if _mode == 'web':
                            # session.pop('X-Authorization', None)
                            # session.pop('User', None)
                            session['X-Authorization'] = _data_qry.get('user').get('token')
                            session['user'] = _data_qry.get('user')
                            _login = processing_rest_success(None, status_code=_status_code)
                        else:
                            _login = jsonify(_data_qry)
                            _login.status_code = _status_code
                    else:
                        raise ExceptionRest(status_code=404, message="Verifique su usuario y contrseña")
            else:
                raise ExceptionRest(status_code=404, message="El usuario no esta registrado")
        except (Exception, ExceptionRest), e:
            _login = processing_rest_exception(e)
        print _login
        return _login

    def logout(self, type, token, uid):
        pass

    def is_login(self, token):
        _response = {}
        if not token:
            _is_login = jsonify({'headers': 'X-Authorization is required'})
            _is_login.status_code = 401
            _response.update({'error': _is_login})
        if 'error' not in _response:
            _qry = "SELECT is_login ('%s')" %(token, )
            g.db_conn.execute(_qry)
            if g.db_conn.count() > 0:
                _data_query = g.db_conn.one()[0]
                if _data_query[u'status_code'] == 200:
                    _user = _data_query[u'user']
                    user = UserMdl(id=_user['id'],
                                name=_user['name'],
                                email=_user['email'],
                                last_name=_user['last_name'],
                                cover=_user['cover'],
                                timezone=_user['timezone']
                                )
                    _response.update({'user': user})
                else:
                    _error = jsonify()
                    _error.status_code = _data_query[u'status_code']
                    _response.update({'error': _error})
        return _response


class AuthListRst(Resource, AuthMdl):
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


class UserRst(Resource, AuthMdl):
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
