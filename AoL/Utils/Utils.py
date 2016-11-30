# -*- coding: utf-8 -*-
# © 2016. by Zero 1/0.
from types import NoneType, IntType
from datetime import datetime
from flask import jsonify


def tuple2list(fields, tuple):
    _tl = []
    for row in tuple:
        _dic = {}
        for i, val in enumerate(fields):
            _row = row[i]
            if type(row[i]) == datetime:
                _row = row[i].strftime("%Y-%m-%d %H:%M:%S")
            # if type(row[i]) == NoneType:
            #     _row = 'null'
            if type(row[i]) == unicode:
                _row = str(row[i])
            _dic.update({val: _row})
        _tl.append(_dic)
    return _tl


def var(var, var_type):
    _var = False
    if type(var) == var_type:
        _var = True
    return _var


def insertdb(fields, data, required=None):
    _to_insert = []
    for _data in data:
        _columns = ""
        _values = ""
        for _field in fields:
            if _field in _data:
                _columns = _columns + _field + ","
                _values = _values +  " %s ," % (_data.get(_field),)
        if len(_columns) > 0 and len(_values) > 0:
            _columns = _columns[:-1]
            _values = _values[:-1]
            _to_insert.append({"columns": _columns, "values": _values})
    return _to_insert


def str2datetime(data):
    '''

    :param data: 2016-05-01 {10,13}:34:34
    :return: datetime
    '''
    return None


def processing_rest_exception(e):
    if hasattr(e, 'status_code'):
        _tmp_rpc = {}
        if e.errors:
            _tmp_rpc.update({'errors': e.errors})
        if e.message:
            _tmp_rpc.update({'message': e.message})
        if e.status_code:
            _tmp_rpc.update({'status_code': e.status_code})
        _response = jsonify(_tmp_rpc)
        _response.status_code = 200
    else:
        _response = jsonify({'message': e.message})
        _response.status_code = 500
    return _response


def processing_rest_success(data=None, message=None, errors=None, info=None, warning=None, status_code=200):
    _tmp_data = {}
    if data:
        _tmp_data.update({'data': data})
    if message:
        _tmp_data.update({'message': message})
    if errors:
        pass
    if info:
        _tmp_data.update({'info': info})
    if warning:
        _tmp_data.update({'warning': warning})
    if status_code:
        _tmp_data.update({'status_code': status_code})
    _response = jsonify(_tmp_data)
    _response.status_code = status_code if status_code != 200 else 200
    return _response


def _typeof(val, type_of):
    type_vars = {
        'str': {'str', 'date', 'datetime'},
        'int': {'int', 'float'}
    }
    _return = '\'%s\'' % val
    for type_var in type_vars:
        if type_of in type_vars[type_var]:
            if type_of == 'str':
                _return = '\'%s\'' % val
            elif type_of == 'int':
                _return = '%s' % val
    return _return


def type_of_insert_rest(fields, request):
    _col = ''
    _val = ''
    for field in fields:
        if field in request:
            _col = _col + field + ','
            _type_of = fields[field]['typeof'] if 'typeof' in fields[field] else ''
            _val = _val + _typeof(request[field], _type_of) + ','
    return _col[:-1], _val[:-1]


def type_of_update_rest(fields, request):
    _vals = ''
    for field in fields:
        if field in request:
            _type_of = fields[field]['typeof'] if 'typeof' in fields[field] else ''
            _val =_typeof(request[field], _type_of) + "AT TIME ZONE 'UTC'" if _type_of == 'datetime' \
                else _typeof(request[field], _type_of)
            _vals = _vals + field + '=' + _val + ','
    return _vals[:-1]