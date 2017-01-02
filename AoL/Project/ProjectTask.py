# -*- coding: utf-8 -*-
# ZERO 1/0 © 2016
from flask_restful import Resource
from flask import request, g
from AoL.Utils.Exception import ExceptionRest
from AoL.Utils.Utils import processing_rest_exception, processing_rest_success,\
    type_of_insert_rest, type_of_update_rest
from AoL.Utils.Validate import validate_rest


class ProjectTaskR:
    _table = 'project_tasks'
    _fields = {
        u'name': {
            'required': True,
            'length': {'min': 3},
            'typeof': 'str'
        },
        u'description': {
            'length': {'min': 3},
            'typeof': 'str'
        },
        u'project_id': {
            'required': True,
            'typeof': 'int'
        },
        # u'parent_id': {
        #     'typeof': 'int'
        # },
        u'start_date_at': {
            'typeof': 'date'
        },
        u'due_date_at': {
            'typeof': 'date'
        },
        u'completed_at': {
            'typeof': 'date'
        },
    }

    def __init__(self):
        pass

    _query_get = """
        SELECT array_to_json(array_agg(row_to_json(t) )) as collection FROM (
            SELECT id,project_id, parent_id, name, description, start_date_at, due_date_at, completed_at
            FROM project_tasks %s
            )t;
    """


class ProjectTaskList(Resource, ProjectTaskR):
    def get(self):
        try:
            # owner
            # by project id
            _where = " WHERE deleted_at is null "
            _by = request.args.get("by", False)
            if _by:
                if _by == 'project_id':
                    _project_id = request.args.get('project_id', False)
                    _where = _where + " and project_id=%s "% (_project_id, )
                else:
                    _where = _where + " and create_id =%s " % (g.user.id,)

            else:
                _where = _where + " and create_id =%s " % (g.user.id, )
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
            _errors = validate_rest(fields=self._fields, request=_request)
            if not _errors:
                _col, _val = type_of_insert_rest(self._fields, _request)
                _qrp = """
                    INSERT INTO %s (create_id, %s) VALUES (%s, %s)
                    RETURNING (select row_to_json(collection) FROM (VALUES(id)) collection(id));
                """ % (self._table, _col, g.user.id, _val)
                g.db_conn.execute(_qrp)
                if g.db_conn.count() > 0:
                    _data = {self._table: g.db_conn.one()}
                    _post = processing_rest_success(data=_data, message='Fue creada correctamente',
                                                    status_code=201)
                else:
                    raise ExceptionRest(status_code=500, message='No se ha podido registrar.')
            else:
                raise ExceptionRest(status_code=400, errors=_errors)
        except (Exception, ExceptionRest), e:
            _post = processing_rest_exception(e)
        return _post


class ProjectTask(Resource, ProjectTaskR):
    def get(self, id):
        try:
            _qrg = self._query_get + " WHERE deleted_at IS NULL and id = %s" % (id, )
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
                print _qrp
                g.db_conn.execute(_qrp)
                if g.db_conn.count() > 0:
                    _put = processing_rest_success(status_code=201, message="El registro fue actualizado correctamente")
                else:
                    raise ExceptionRest(status_code=404,
                                        message="No se ha podio encontrar el registro, para actualizar.")
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
                                    message="No se ha podio encontrar el registro, para eliminar.")
        except (Exception, ExceptionRest), e:
            _delete = processing_rest_exception(e)
        return _delete
