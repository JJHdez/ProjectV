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


class Validate:
    def __init__(self):
        pass

    @staticmethod
    def params(*args, **kwargs):
        return kwargs['field'], kwargs['request'], kwargs['constraints']

    @staticmethod
    def exists(**kwargs):
        return True if kwargs['field'] in kwargs['request'] else False

    @staticmethod
    def required(*args, **kwargs):
        _field, _request, _constraints = Validate.params(*args, **kwargs)
        if _constraints and _field in _request:
            return None
        return 'El campo es requerido.'

    @staticmethod
    def length(*args, **kwargs):
        _field, _request, _constraints = Validate.params(*args, **kwargs)
        if Validate.exists(field=_field, request=_request):
            _msg = ''
            if 'min' in _constraints and 'max' not in _constraints:
                if not (len(_request[_field]) >= _constraints['min']):
                    _msg = 'El minimo de caracteres debe ser %s' % _constraints['min']
            if 'min' not in _constraints and 'max' in _constraints:
                if not(len(_request[_field]) <= _constraints['max']):
                    _msg = 'El maximo de caracteres debe ser %s' % _constraints['max']
            if 'min' in _constraints and 'max' in _constraints:
                if not (len(_request[_field]) <= _constraints['max'] and len(request[_field]) >= _constraints['min']):
                    _msg = 'El minimo de caracteres debe ser de %s y elmaximo de caracteres debe ser %s' % (_constraints['min'],_constraints['max'])
            if len(_msg) > 0:
                return _msg
        return None

    @staticmethod
    def typeof(*args, **kwargs):
        return None

def call2str(*args, **kwargs):
    if 'object' in kwargs:
        _method = kwargs['method']
        # def kwargs['method']
        _object = kwargs['object']
        # def kwargs['object']
        return getattr(locals().get(_object) or globals().get(_object), _method)(*args, **kwargs)
    return None


# def validate_rest(*argsv, **kwargsv):
#     def decorator(func):
#         def wrapper(*args, **kwargs):
#             if 'fields' in kwargsv and 'request' in kwargsv:
#                 _fields = kwargsv['fields']
#                 _request = kwargsv['request']
#                 _errors = {}
#
#                 for _field in _fields:
#                     _properties = _fields[_field]
#                     _errors.update({_field: ''})
#                     for _property in _properties:
#                         _constraints = _properties[_property]
#                         _result = call2str(object="ValidatorRestParams", method=_property,
#                                             constraints=_constraints, field=_field, request=_request)
#                         if _result:
#                             _errors[_field] = _result + ' ' + _errors[_field]
#                     if len(_errors[_field]) == 0:
#                         del _errors[_field]
#                 if len(_errors) == 0:
#                     return func(*args, **kwargs)
#                 else:
#                     _response = jsonify({'errors': _errors})
#                     _response.status_code = 404
#                     return _response
#             else:
#                 return func(*args, **kwargs)
#         return wrapper
#     return decorator

def validate_rest(*args, **kwargs):
    if 'fields' in kwargs and 'request' in kwargs:
        _fields = kwargs['fields']
        _request = kwargs['request']
        _method = kwargs['method'] if 'method' in kwargs else ''
        _errors = {}
        for _field in _fields:
            _properties = _fields[_field]
            _errors.update({_field: ''})
            for _property in _properties:
                if _property == 'required' and _method in ['put']:
                    continue
                _constraints = _properties[_property]
                _result = call2str(object="Validate", method=_property,
                                    constraints=_constraints, field=_field, request=_request)
                if _result:
                    _errors[_field] = _result + ' ' + _errors[_field]
            if len(_errors[_field]) == 0:
                del _errors[_field]
        if len(_errors) > 0:
            return _errors
    return None
