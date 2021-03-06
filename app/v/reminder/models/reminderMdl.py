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


class ReminderMdl:
    _table = 'reminder'
    
    _fields = {
        u'resource': {
            'required': True,
            'typeof': 'str'
        },
        u'resource_id': {
            'required': True,
            'typeof': 'int'
        },
        u'every': {
            'required': True,
            'typeof': 'int'
        },
        u'by': {
            'required': True,
        },
        u'due_date': {
            'required': True,
        },
        u'email_notify': {
            'typeof': 'bool'
        },
        u'date_notify': {

        },
        u'time_notify': {

        },
       # u'last_datetime_notify': {

        #},
        #u'params': {

        #},
    }

    def __init__(self):
        pass
