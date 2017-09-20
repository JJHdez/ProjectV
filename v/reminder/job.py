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

import time
import datetime

from v.tools.v import FORMAT_DATE, FORMAT_DATETIME, FORMAT_TIME
from v.habit.controller.habitCtl import HabitCtl


class jobReminder:
    db = None
    mail = None

    def __init__(self, db, mail):
        self.db = db
        self.mail = mail

    def habit(self, dt_now=None):

        qry = """
        SELECT
          r.id,
          r.created_at,
          r.every,
          r.by,
          h.created_date start_date,
          r.due_date,
          r.push_notify,
          r.email_notify,
          r.date_notify,
          r.time_notify,
          r.last_datetime_notify,
          r.params,
          h.id habit_id,
          h.name habit_name,
          hh.state,
          u.id user_id,
          u.name user_name,
          u.email user_email          
        FROM
          remember r INNER JOIN habits h
            ON r.resource = 'habit' AND r.resource_id = h.id
               AND h.finished_date IS NULL AND r.create_id = h.user_id
            LEFT JOIN history_habits hh ON h.id = hh.habit_id and CAST(hh.created_date AS DATE)= now()
            INNER JOIN users u ON h.user_id = u.id;
        """

        self.db.execute(qry)
        if self.db.count() > 0:
            habits = self.db.fetch()
            for id, created_at, every, by, start_date, due_date, push_notify, email_notify, date_notify, time_notify, \
                last_datetime_notify, params, habit_id, habit_name, state, user_id, user_name, user_email in habits:

                print str(habit_name).upper(), str(user_name).upper()
                print 'start'.upper(), self.dt2str(start_date), 'due'.upper(), self.dt2str(due_date), 'notifications'.upper()
                print 'date'.upper(), self.dt2str(due_date, format=FORMAT_DATE), 'Time'.upper(), self.dt2str(time_notify, format=FORMAT_TIME),'notifications'.upper()

                datetime_now = datetime.datetime.now() if dt_now is None else dt_now
                date_now = datetime_now.date()
                time_now = datetime_now.time()
                print 'current time'.upper(), self.dt2str(datetime_now)
                # Do not due datetime notification
                if due_date >= datetime_now:
                    params_template = {
                        'user_name': user_name,
                        'habit_name': habit_name,
                        'user_email': user_email
                    }
                    is_send_notify = False
                    if by == 'daily':
                        if time_now >= time_notify:
                            if last_datetime_notify is None:
                                    is_send_notify = True
                            else:
                                if last_datetime_notify.date() != date_now:
                                    last_dt_notify_add_every = last_datetime_notify + datetime.timedelta(days=every)
                                    if last_dt_notify_add_every.date() == date_now:
                                        is_send_notify = True
                    if by == 'weekly':
                        if time_notify <= time_now:
                            if 'week_days' in params:
                                week_days = params.get('week_days', False)
                                last_week = start_date.date()
                                days_to_weekend = last_week.weekday() - 6
                                i = 0
                                while True:
                                    next_week = last_week + datetime.timedelta(days=days_to_weekend)
                                    if (i % every) == 0:
                                        if last_week <= date_now <= next_week:
                                            if date_now.strftime("%A").lower() in week_days:
                                                if last_datetime_notify is None:
                                                    is_send_notify = True
                                                else:
                                                    if last_datetime_notify.date() != date_now:
                                                        is_send_notify = True
                                    days_to_weekend = 6
                                    last_week = next_week
                                    i += 1
                                    if last_week >= date_now:
                                        break

                #     Send notify
                    if is_send_notify:
                        if dt_now is None:
                            self.send_notify(id, params_template, email_notify=email_notify, push_notify=push_notify)
                        else:
                            self.put_habit_fail(user_id, habit_id)
                print ('.' * 50)

    def put_habit_fail(self, user_id, habit_id):
        qry = "INSERT INTO history_habits (created_date, user_id, habit_id, state)VALUES(now()- INTERVAL  '7 hours', {},{},'fail');".format(user_id, habit_id)
        self.db.execute(qry)

    def send_notify(self, id, params, email_notify=False, push_notify=False):
        if push_notify:
            self.template_push(params)
        if email_notify:
            self.template_email(params)
        qry = "update remember set last_datetime_notify= now() where id={}" \
            .format(id)
        self.db.execute(qry)

    def template_email(self, params):
        HabitCtl.reminder(self.mail, params=params)

    def template_push(self, params={}):
        templ = """I want improvement/or make {}.                                
                    Take care,{}. :)            
                """.format(params.get('habit_name', ''), params.get('user_name', ''))
        print templ

    def dt2str(self, dt, format="%Y-%m-%d %H:%M:%S"):
        s = ''
        try:
            s = dt.strftime(format)
        except Exception, e:
            pass
        return s

# o = jobRemember(None)
# o.get_week_notify()
