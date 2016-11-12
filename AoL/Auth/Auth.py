# -*- coding: utf-8 -*-
# © 2016. by Zero 1/0.
from flask import g, jsonify
from AoL.Auth.User import User


class Auth:

    def __init__(self):
        pass

    def login(self, data):
        _email = data.get('email')
        _uid = data.get('uid')
        _auth = data.get('auth')
        _token = data.get('token')
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
                _status_code = _data_qry['status_code']
                del _data_qry[u'status_code']
                # print _status_code
                _login = jsonify(_data_qry)
                _login.status_code = _status_code
        else:
            _login = jsonify(_errors)
            _login.status_code = 400
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

