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
from flask import request, g
from v.tools.exception import ExceptionRest
from v.tools.v import processing_rest_exception, processing_rest_success, type_of_insert_rest, type_of_update_rest
from v.tools.validate import validate_rest
from v.reminder.models.reminderMdl import ReminderMdl
from flask_babel import _
import json

class ReminderCtl(Resource, ReminderMdl):

    def put(self, reminder_id):
        _request = request.json
        try:
            _params = _request.get('params', None)
            val_params = ''
            if _params:
                del _request['params']
                val_params = " params=cast('{}' as json), ".format(json.dumps(_params))
            _errors = validate_rest(fields=self._fields, request=_request, method="put")
            if not _errors:
                _val = type_of_update_rest(self._fields, _request)
                _qrp = "UPDATE {} SET {} last_datetime_notify=NULL, {} WHERE id={};".format(self._table, val_params, _val, reminder_id)
                print _qrp
                g.db_conn.execute(_qrp)
                if g.db_conn.count() > 0:
                    _put = processing_rest_success(status_code=200, message=_("The record was successfully updated"))
                else:
                    raise ExceptionRest(status_code=404, message=_("Not found record"))
            else:
                raise ExceptionRest(status_code=400, errors=_errors)
        except (Exception, ExceptionRest), e:
            _put = processing_rest_exception(e)
        return _put


class ReminderListCtl(Resource, ReminderMdl):

    def get(self):
        try:
            _resource = request.args.get("resource", 'all')
            if _resource == 'habit':
                _resource_id = request.args.get("resource_id", 0)
                _qrg = """
                        SELECT array_to_json(array_agg(row_to_json(t) )) as collection
                        FROM ( SELECT * FROM {} WHERE
                        deleted_at IS NULL and resource='habit' and resource_id ={})t;
                    """.format(self._table, _resource_id)
                g.db_conn.execute(_qrg)
                if g.db_conn.count() > 0:
                    _data = g.db_conn.one()[0]
                    if _data:
                        _get = processing_rest_success(data={self._table: _data})
                    else:
                        raise ExceptionRest(status_code=404, message=_("Not found record"))
                else:
                    raise ExceptionRest(status_code=404, message=_("Not found record"))
            else:
                raise ExceptionRest(status_code=400, message=_("Bad request"))
        except (Exception, ExceptionRest), e:
            _get = processing_rest_exception(e)
        return _get