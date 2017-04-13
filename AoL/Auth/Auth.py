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

from flask import g, jsonify, session
from AoL.Auth.User import User
from AoL.Utils.Exception import ExceptionRest
from AoL.Utils.Utils import processing_rest_exception, processing_rest_success


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
                    user = User(id=_user['id'],
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

