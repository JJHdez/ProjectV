# -*- coding: utf-8 -*-
# © 2016. by Zero 1/0.
from flask import g, jsonify
# from AoL.Utils.Db import PsqlAoL


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
        _errors = []
        _is_login = {}
        if not token:
            _errors.append({'headers': 'X-Authorization is required'})
            _is_login =jsonify(_errors)
            _is_login.status_code = 400
        if len(_errors) == 0:
            _qry = "SELECT is_login ('%s')" %(token, )
            g.db_conn.execute(_qry)
            if g.db_conn.count() > 0:
                _data_query = g.db_conn.one()[0]
                _status_code = _data_query[u'status_code']
                del _data_query[u'status_code']
                _is_login = jsonify(_data_query)
                _is_login.status_code = _status_code
        return _is_login
