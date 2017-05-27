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
from flask import request, g
from v.tools.exception import ExceptionRest
from v.tools.v import processing_rest_exception, processing_rest_success, type_of_insert_rest, type_of_update_rest
from v.tools.validate import validate_rest
from v.project.model.projectCommentMdl import ProjectCommentMdl


class ProjectCommentCtl(ProjectCommentMdl):

    def __init__(self):
        pass

    @staticmethod
    def endpoint(api=False, method=False):
        _api = ''
        if api:
            _api = '{}'.format(api)
        _method = ''
        if method and method in ['DELETE', 'PUT']:
            _method = '/<int:id>'
        return '{}project/comment{}'.format(_api, _method)

    def get_by(self):
        try:
            _data = []
            _by = request.args.get("by", False)
            _resource = request.args.get("resource", False)
            _resource_id = request.args.get("resource_id", False)
            if _by == 'resource':
                if _resource and _resource_id:
                    _data = self.get_comment_by_resource(_resource, _resource_id)
                    if len(_data) > 0:
                        _data = {self._table: _data}
            if _data:
                _get = processing_rest_success(data=_data, status_code=200)
            else:
                raise ExceptionRest(status_code=404, message="No se han encontrado resultados")
        except (Exception, ExceptionRest), e:
            _get = processing_rest_exception(e)
        return _get

    def get(self):
        pass

    def put(self):
        pass

    def delete(self):
        pass

    def post(self):
        _request = request.json
        try:
            _errors = validate_rest(fields=self._fields, request=_request)
            if not _errors:
                _col, _val = type_of_insert_rest(self._fields, _request)
                _qrp = """
                            INSERT INTO %s (create_id, %s) VALUES (%s,%s)
                            RETURNING (select row_to_json(collection) FROM (VALUES(id)) collection(id));
                        """ % (self._table, _col, g.user.id, _val)
                g.db_conn.execute(_qrp)
                if g.db_conn.count() > 0:
                    _data = g.db_conn.one()
                    _data = {self._table: _data}
                    _post = processing_rest_success(data=_data,
                                                    message='El comentario fue creado correctamente',
                                                    status_code=201)
                else:
                    raise ExceptionRest(status_code=500,
                                        message='No se ha podido registrar el comentario.')
            else:
                raise ExceptionRest(status_code=400, errors=_errors)
        except (Exception, ExceptionRest), e:
            _post = processing_rest_exception(e)
        return _post


