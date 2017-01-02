# -*- coding: utf-8 -*-
# ZERO 1/0 © 2016
from flask_restful import Resource
from flask import request, g
from AoL.Utils.Exception import ExceptionRest
from AoL.Utils.Utils import processing_rest_exception, processing_rest_success, \
    type_of_insert_rest, type_of_update_rest
from AoL.Utils.Validate import validate_rest


class ProjectParticipatedR:
    _table = 'project_task_participed'
    _fields = {
        u'project_task_id': {
            'required': True,
            'typeof': 'int',
        },
        u'assigned_user_id': {
            'required': True,
            'typeof': 'int',
        },
        u'name': {
            'required': True,
            'typeof': 'str',
        },
        u'description': {
            'typeof': 'str',
        },
        u'start_date_at': {
            'typeof': 'date',
        },
        u'due_date_at': {
            'typeof': 'date',
        },
        u'completed_at': {
            'typeof': 'datetime',
        }

    }

    def __init__(self):
        pass

    _query_get = """
        SELECT array_to_json(array_agg(row_to_json(t) )) as collection FROM (
            SELECT id,project_task_id, assigned_user_id, name, description, start_date_at, due_date_at, completed_at
             FROM project_task_participed %s
         )t;
    """


class ProjectParticipatedList(Resource, ProjectParticipatedR):
    def get(self):
        try:
            _where = " WHERE deleted_at is null "
            _by = request.args.get("by", False)
            if _by:
                if _by == 'project_task_id':
                    _project_task_id = request.args.get('project_task_id', False)
                    _where = _where + " and project_task_id=%s " % (_project_task_id,)
                else:
                    _where = _where + " and create_id =%s " % (g.user.id,)
            else:
                _where = _where + " and create_id =%s " % (g.user.id,)
            _completed = request.args.get("completed")
            if _completed == 'True' or _completed == 'true':
                _where = _where + " and completed_at is not null "
            elif _completed == 'False' or _completed == 'false':
                _where = _where + " and completed_at is null "

            _qrg = self._query_get % _where
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
            print _request
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


class ProjectParticipated(Resource, ProjectParticipatedR):
    def get(self, id):
        try:
            _qrg = self._query_get + " WHERE deleted_at is NULL and id = %s" % (id, )
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
            _errors = validate_rest(fields=self._fields, request=_request, method="put")
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
