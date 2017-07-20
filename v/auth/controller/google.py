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

from flask_oauth import OAuth
from urllib2 import Request, urlopen, URLError
from flask import g, json, session
from v.user.model.userMdl import UserMdl


class Google:

    def __init__(self, client_id, client_secret):
        self.client_id = client_id
        self.client_secret = client_secret
        self.oauth = OAuth()
        self.g = self.oauth.remote_app('google',
           base_url='https://www.google.com/accounts/',
           authorize_url='https://accounts.google.com/o/oauth2/auth',
           request_token_url=None,
           request_token_params={
               'scope': 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
                'response_type': 'code'
           },
           access_token_url='https://accounts.google.com/o/oauth2/token',
           access_token_method='POST',
           access_token_params={'grant_type': 'authorization_code'},
           consumer_key=self.client_id,
           consumer_secret=self.client_secret)
        self.authorized = None
        self.user = UserMdl(-1)

    def get_authorized(self, key=None):
        if key:
            return self.authorized.get(key, None)
        return self.authorized

    def get_user_info(self):
        access_token = self.get_authorized('access_token')
        headers = {'Authorization': 'OAuth ' + access_token}
        req = Request('https://www.googleapis.com/oauth2/v1/userinfo',
                      None, headers)
        res = None
        try:
            res = urlopen(req)
            user = json.loads(res.read())
            self.user.google_plus = user.get('id', -1)
            self.user.name = user.get('given_name', None)
            self.user.email = user.get('email', None)
            self.user.last_name = user.get('family_name', None)
            self.user.cover = user.get('picture', None)
            # self.user.timezone = user.get('timezone', None)

        except URLError, e:
            print e
            return False
        return True

    def start_session(self):
        user = self.user_exists(self.user)
        if user.id > 0:
            self.user_update(user, self.user)
        else:
            user = self.user_add(self.user)
        qry = "SELECT login('%s', '%s', '%s', '%s');" % \
              (user.email, user.google_plus, 'google', self.get_authorized('access_token'))
        g.db_conn.execute(qry)
        if g.db_conn.count() > 0:
            data = g.db_conn.one()[0]
            if data:
                if data.get('status_code', 500) == 200:
                    session['X-Authorization'] = data.get('user').get('token')
                    session['user'] = data.get('user')
                    return True
        return False
    def user_exists(self, user):
        qry = "SELECT * FROM users where google_plus =  '{}' and email= '{}';".format(
            user.google_plus, user.email
        )
        g.db_conn.execute(qry)
        user_tmp = UserMdl(-1)
        if g.db_conn.count() > 0:
            for row in g.db_conn.fetch():
                user_tmp.id = row['id']
                user_tmp.google_plus = row['google_plus']
                user_tmp.name = row['name']
                user_tmp.email = row['email']
                user_tmp.last_name = row['last_name']
                user_tmp.cover = row['cover']
        return user_tmp

    def user_add(self, user):
        qry =" insert into users (google_plus, email, name, last_name, cover)VALUES('{}','{}','{}','{}','{}')" \
             "RETURNING id;".format\
                (
                    user.google_plus, user.email, user.name, user.last_name, user.cover
                )
        g.db_conn.execute(qry)
        if g.db_conn.count() > 0:
            user.id = g.db_conn.one()[0]
        return user

    def user_update(self, user_current, user_new):
        to_update = ''
        if user_current.name != user_new.name:
            to_update += " name='{}',".format(user_new.name)
        if user_current.last_name != user_new.last_name:
            to_update += " last_name='{}',".format(user_new.last_name)
        if user_current.cover != user_new.cover:
            to_update += " cover='{}',".format(user_new.cover)
        if len(to_update) > 0:
            qry = "update users set {} where id={}".format(to_update[:-1], user_current.id)
            g.db_conn.execute(qry)
        return True
