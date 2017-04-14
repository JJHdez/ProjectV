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

from flask import render_template, request, redirect
from v.tools.validate import validate_rest
from v.tools.exception import ExceptionRest
from v.tools.v import processing_rest_exception, processing_rest_success
from v.frontend.model.resetPasswordMdl import ResetPasswordMdl


class ResetPasswordCtl:

    def __init__(self):
        pass

    @staticmethod
    def index():
        _token = request.args.get('token', False)
        rpo = ResetPasswordMdl()
        if _token and rpo.token_available(_token):
            return render_template('frontend/resetPassword.html', token=_token)
        else:
            return redirect('/')

    @staticmethod
    def token():
        _request = request.json
        _field = {'email': {'required': True}}
        try:
            _errors = validate_rest(fields=_field, request=_request)
            if not _errors:
                _email = _request['email']
                rpo = ResetPasswordMdl()
                rpo.account_exists(email=_email)
                _get = processing_rest_success(
                    data=None,
                    message='El token fue enviado correctamente para actualizar su contraseña!',
                    status_code=200)
            else:
                raise ExceptionRest(status_code=400, errors=_errors)
        except (Exception, ExceptionRest), e:
            _get = processing_rest_exception(e)
        return _get

    @staticmethod
    def password_change():
        _request = request.json
        _fields = {'password': {'required': True},'token': {'required': True}}
        try:
            _errors = validate_rest(fields=_fields, request=_request)
            if not _errors:
                _new_password = _request['password']
                _token = _request['token']
                rpo = ResetPasswordMdl()
                if rpo.password_change(_new_password, _token):
                    _change = processing_rest_success(
                        data=None,
                        message='La contraseña fue actualizado correctamente!',
                        status_code=200)
                else:
                    raise ExceptionRest(status_code=400,
                                        message='Ocurrio un problema al intentar cambiar la contraseña, por favor intenta mas tarde :(')
            else:
                raise ExceptionRest(status_code=400, errors=_errors)
        except (Exception, ExceptionRest), e:
            _change = processing_rest_exception(e)
        return _change
