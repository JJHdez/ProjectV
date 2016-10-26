# -*- coding: utf-8 -*-
# © 2016. by Zero 1/0.
from types import NoneType, IntType
from datetime import datetime


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