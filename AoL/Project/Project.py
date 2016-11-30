# -*- coding: utf-8 -*-
# ZERO 1/0 © 2016
from flask_restful import Resource
from flask import request, g
from AoL.Utils.Exception import ExceptionRest
from AoL.Utils.Utils import processing_rest_exception, processing_rest_success
from AoL.Utils.Validate import validate_rest


class ProjectR:
    _table = 'projects'
    _fields = {
        u'name': {
            'required': True,
            'length': {'min': 3}
        }
    }

    def __init__(self):
        pass


class ProjectList(Resource, ProjectR):

    def get(self):
        try:
            _qrg = """
                SELECT array_to_json(array_agg(row_to_json(t) )) as collection
                FROM ( SELECT id,finished ,name FROM %s WHERE deleted_date IS NULL and create_id=%s )t;
                """ % (self._table, g.user.id, )
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
                _qrp = """
                    INSERT INTO %s (create_id, name) VALUES (%s,'%s')
                    RETURNING (select row_to_json(collection) FROM (VALUES(id)) collection(id));
                """ % (self._table, g.user.id, _request['name'])
                g.db_conn.execute(_qrp)
                if g.db_conn.count() > 0:
                    _data = {self._table: g.db_conn.one()}
                    _post = processing_rest_success(data=_data, message='El proyecto fue creado correctamente',
                                                    status_code=201)
                else:
                    raise ExceptionRest(status_code=500, message='No se ha podido registrar el proyecto.')
            else:
                raise ExceptionRest(status_code=400, errors=_errors)
        except (Exception, ExceptionRest), e:
            _post = processing_rest_exception(e)
        return _post


class Project(Resource, ProjectR):

    def get(self, id):
        try:
            _qrg = """
                    SELECT array_to_json(array_agg(row_to_json(t) )) as collection
                    FROM ( SELECT id,finished , name FROM %s WHERE deleted_date IS NULL and create_id=%s and id = %s)t;
                """ % (self._table, g.user.id, id, )
            g.db_conn.execute(_qrg)
            if g.db_conn.count() > 0 and g.db_conn.one()[0]:
                _data = {self._table: g.db_conn.one()[0]}
                _get = processing_rest_success(data=_data)
            else:
                raise ExceptionRest(status_code=404, message="No se han encontrado resultados")
        except (Exception, ExceptionRest), e:
            _get = processing_rest_exception(e)
        # print _ge
        return _get

    def put(self, id):
        _request = request.json
        try:
            _errors = validate_rest(fields=self._fields, request=_request)
            if not _errors:
                _qrp = "UPDATE %s SET name='%s' WHERE id=%s;" % (self._table, _request['name'], id)
                g.db_conn.execute(_qrp)
                if g.db_conn.count() > 0:
                    _put = processing_rest_success(status_code=201, message="El registro fue actualizado correctamente")
                else:
                    raise ExceptionRest(status_code=404, message="No se ha podio encontrar el registro, para actualizar.")
            else:
                raise ExceptionRest(status_code=400, errors=_errors)
        except (Exception, ExceptionRest), e:
            _put = processing_rest_exception(e)
        return _put

    def delete(self, id):
        try:
            _qrd = "UPDATE %s SET deleted_date=current_timestamp AT TIME ZONE 'UTC' WHERE id=%s;" % (self._table, id)
            g.db_conn.execute(_qrd)
            if g.db_conn.count() > 0:
                _delete = processing_rest_success(status_code=201, message="El registro fue eliminado correctamente")
            else:
                raise ExceptionRest(status_code=404,
                                    message="No se ha podio encontrar el registro, para eliminar.")
        except (Exception, ExceptionRest), e:
            _delete = processing_rest_exception(e)
        return _delete
