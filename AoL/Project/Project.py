# -*- coding: utf-8 -*-
# ZERO 1/0 © 2016
from flask_restful import Resource
from flask import request, g
from AoL.Utils.Exception import ExceptionRest
from AoL.Utils.Utils import processing_rest_exception, processing_rest_success, type_of_insert_rest, type_of_update_rest
from AoL.Utils.Validate import validate_rest


class ProjectR:
    _table = 'projects'
    _fields = {
        u'name': {
            'required': True,
            'length': {'min': 3}
        },
        u'completed_at': {
            'typeof': 'date'
        },
    }

    def __init__(self):
        pass

    _query_get = """
    SELECT array_to_json(array_agg(row_to_json(t) )) as collection
        FROM (
            select
                id, created_at, deleted_at, create_id, name, completed_at, null team
            from
                projects where deleted_at is null %s

                union all

            select
                p.id,
                p.created_at,
                p.deleted_at,
                p.create_id,
                p.name,
                p.completed_at,
                pt.name
            from
                project_teams pt inner join project_teams_projects ptp on pt.id = ptp.team_id
                inner join projects p on ptp.project_id = p.id
            where pt.deleted_at is null and ptp.deleted_at is null %s
        )t
    """


class ProjectList(Resource, ProjectR):

    def get(self):
        try:
            where1 = " and id not in ( (select project_id from project_teams_projects where user_id = %s) ) " \
                     " and create_id =%s " % (g.user.id, g.user.id, )
            where2 = " and ptp.user_id =%s " % (g.user.id, )
            _completed = request.args.get("completed")
            if _completed == 'True' or _completed == 'true':
                where1 = where1 + " and completed_at is not null "
                where2 = where2 + " and p.completed_at is not null "
            elif _completed == 'False' or _completed == 'false':
                where1 = where1 + " and completed_at is null "
                where2 = where2 + " and p.completed_at is null "

            _qrg = self._query_get % (where1, where2)
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
                    INSERT INTO %s (create_id, %s) VALUES (%s,%s)
                    RETURNING (select row_to_json(collection) FROM (VALUES(id)) collection(id));
                """ % (self._table, _col, g.user.id, _val)
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
                    FROM ( SELECT id, name, completed_at FROM %s WHERE
                    deleted_at IS NULL id = %s)t;
                """ % (self._table, id, )
            g.db_conn.execute(_qrg)
            if g.db_conn.count() > 0:
                _data = g.db_conn.one()[0]
                if _data:
                    _get = processing_rest_success(data={self._table:_data})
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
                _qrp = "UPDATE %s SET %s WHERE id=%s;" % (self._table, _val, id)
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
            _qrd = "UPDATE %s SET deleted_at=current_timestamp WHERE id=%s;" % (self._table, id)
            g.db_conn.execute(_qrd)
            if g.db_conn.count() > 0:
                _delete = processing_rest_success(status_code=201, message="El registro fue eliminado correctamente")
            else:
                raise ExceptionRest(status_code=404,
                                    message="No se ha podio encontrar el registro, para eliminar.")
        except (Exception, ExceptionRest), e:
            _delete = processing_rest_exception(e)
        return _delete
