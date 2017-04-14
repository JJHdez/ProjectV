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

from flask import render_template, g, request
from V.Tools.Exception import ExceptionRest
from flask_mail import Message
import uuid


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
