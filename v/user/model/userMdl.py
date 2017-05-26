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
from migrate import db


class UserMdl(object):

    def __init__(self, id, email=None, name=None, last_name=None, cover=None, timezone=None):
        self.id = id
        self.email = email
        self.name = name
        self.last_name = last_name
        self.cover = cover
        self.timezone = timezone


class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    create_date = db.Column(db.DateTime, default="timezone('UTC'::text, now())", nullable=False)
    facebook = db.Column(db.VARCHAR, default='NULL')
    google_plus = db.Column(db.VARCHAR, default='NULL')
    email = db.Column(db.VARCHAR, nullable=False)
    name = db.Column(db.VARCHAR, nullable=False)
    last_name = db.Column(db.VARCHAR, nullable=True)
    cover = db.Column(db.Text, nullable=True)
    timezone = db.Column(db.VARCHAR, default='UTC')
    password = db.Column(db.VARCHAR, nullable=True)
