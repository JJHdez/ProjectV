# -*- coding: utf-8 -*-
# ZERO 1/0 © 2016
from flask import render_template, g, request, redirect
from AoL.Utils.Validate import validate_rest
from AoL.Utils.Exception import ExceptionRest
from AoL.Utils.Utils import processing_rest_exception, processing_rest_success
from flask_mail import Message
import uuid


class ResetPasswordCtl:

    def __init__(self):
        pass

    @staticmethod
    def index():
        _token = request.args.get('token', False)
        rpo = ResetPasswordMdl()
        if _token and rpo.token_available(_token):
            return render_template('reset_password.html', token=_token)
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


class ResetPasswordMdl:

    def __int__(self):
        pass

    def account_exists(self, email):
        id = False

        _qry = \
            """
                  SELECT id
                  FROM users WHERE email= '{}'
                  and (google_plus != ''   OR facebook != '');
            """.format(email)
        g.db_conn.execute(_qry)
        if g.db_conn.count() > 0:
            id = g.db_conn.one()[0]
            _token = str(uuid.uuid4())

            _qry_token = """
               select token ('create', '{}', {},'reset-password');
            """.format(_token, id)
            g.db_conn.execute(_qry_token)
            if g.db_conn.count()>0:
                _new_token = g.db_conn.one()[0]
                _url = request.url_root+'reset/password?token='+_new_token
                self.template_email_reset_password(email, _url)
            else:
                raise ExceptionRest(status_code=400, message='Error al generar el token, vuelva a intentar mas tarde!')
        else:
            raise ExceptionRest(status_code=400, message='La cuenta no esta registrada!')
        return id

    def template_email_reset_password(self, email, url):
        #email = 'jose.bautista@gvadeto.com'
        _template = render_template('Email/reset_password.html', email=email, url=url)
        msg = Message(
                      sender=("JMED MEXICO", "jmed.mexico@gmail.com"),
                      recipients=[email],
                      subject='Solicitud de cambio de contraseña de ULife')
        msg.html = _template
        g.mail.send(msg)

    def token_available(self, token):
        _qry_token = \
            """
            SELECT id FROM token WHERE
            token='{}'
            and kind='reset-password';
            """.format(token)
        g.db_conn.execute(_qry_token)
        available = False
        if g.db_conn.count() > 0:
            available = True
        return available

    def password_change(self, new_password, token):
        _qry_change_password = \
        """
          UPDATE users SET password = '{}'
          WHERE id = (SELECT user_id FROM token WHERE token='{}' AND  kind='reset-password');
        """.format(new_password, token)
        g.db_conn.execute(_qry_change_password)
        changed = False
        if g.db_conn.count() > 0:
            changed = True
        return changed
