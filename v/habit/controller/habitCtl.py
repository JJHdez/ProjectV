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

from flask import render_template, g
from flask_mail import Message

class HabitCtl:

    def __init__(self):
        pass

    @staticmethod
    def index():
        return render_template('habit/index.html')

    @staticmethod
    def reminder(mail, params={}):
        print params
        _template = render_template('habit/reminder.html',
                                    user_name=params.get('user_name', '').encode('utf-8'),
                                    habit_name=params.get('habit_name', ''))
        try:
            msg = Message(
                sender=("Focus", "jsphzb@gmail.com"),
                recipients=[params.get('user_email', False)],
                subject="{} :)".format(params.get('habit_name', '').encode('utf-8')).upper()
            )
            msg.html = _template
            mail.send(msg)
        except Exception as e:
            print e.message, e.args