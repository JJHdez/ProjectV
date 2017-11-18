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

from flask import request, g, json
from datetime import date, timedelta
from v.tools.v import FORMAT_DATE, FORMAT_DATETIME,FORMAT_TIME
import calendar
import random

class PomodoroMdl:
    _table = 'pomodoro_activities'
    _fields = {
        'name': {'required': True, 'typeof': 'str'},
        'timer': {'required': True},
        'start_datetime_at': {'typeof': 'datetime'},
        'due_datetime_at': {'typeof': 'datetime'}
    }

    def __init__(self):
        pass

    def get_statistic_of_the_week(self, timezone, user_id):
        _today = date.today()
        _start_date = _today - timedelta(days=_today.weekday())
        _qrys_week = """
        select
            (start_datetime_at  at time zone '{0}')::date week_day,
            sum (
            	DateDiff(
            	'minute',
            		(start_datetime_at  at time zone '{0}')::timestamp,
            		(due_datetime_at at time zone '{0}')::timestamp
            	)
            ) mimutes
            from
            pomodoro_activities
            where start_datetime_at is not null and due_datetime_at is not null
            and (start_datetime_at at time zone '{0}')::date>='{1}'
            and (due_datetime_at at time zone '{0}')::date<='{2}'
            and create_id = {3}
            group by (start_datetime_at  at time zone '{0}')::date
        """.format(timezone, _start_date.strftime(FORMAT_DATE),
                   _today.strftime(FORMAT_DATE), user_id)
        g.db_conn.execute(_qrys_week)
        _colletion_of_the_week = []
        if g.db_conn.count() > 0:
            _colletion_of_the_week = [row for row in g.db_conn.fetch()]
        _statistic = []
        _statistic.append(["Minutes", "Minutes", { 'role': 'style' } ])
        for y in range(0,(_today.weekday()+1)):
            _start_date = _start_date + timedelta(days=(0 if y==0 else 1))
            _day=[]
            _day.append(calendar.day_name[y]+' '+ _start_date.strftime(FORMAT_DATE))
            _minutes = 0
            for week_day, minutes in _colletion_of_the_week:
                if _start_date.strftime(FORMAT_DATE) == week_day.strftime(FORMAT_DATE):
                    _minutes = minutes
            _day.append(_minutes)
            if (y) == _today.weekday():
                _day.append("#4BAF4F")
            else:
                _day.append("#8BC349")
            _statistic.append(_day)
        return _statistic

    def get_statistic_of_the_month(self, timezone, user_id):
        _today = date.today()
        _start_date = _today -timedelta(days=(_today.day-1))
        _qrys_month = """
        select
            (start_datetime_at  at time zone '{0}')::date month_day,
            sum (
            	DateDiff(
            	'minute',
            		(start_datetime_at  at time zone '{0}')::timestamp,
            		(due_datetime_at at time zone '{0}')::timestamp
            	)
            ) mimutes
            from
            pomodoro_activities
            where start_datetime_at is not null and due_datetime_at is not null
            and (start_datetime_at at time zone '{0}')::date>='{1}'
            and (due_datetime_at at time zone '{0}')::date<='{2}'
            and create_id = {3}
            group by (start_datetime_at  at time zone '{0}')::date
        """.format(timezone, _start_date.strftime(FORMAT_DATE),
                   _today.strftime(FORMAT_DATE), user_id)
        g.db_conn.execute(_qrys_month)
        _colletion_of_the_month = []
        if g.db_conn.count() > 0:
            _colletion_of_the_month = [row for row in g.db_conn.fetch()]
        _statistic = []
        _statistic.append([0,0])
        _minutes_tmp = 2
        for i in range(0,_today.day):
            _start_date = _start_date + timedelta(days=(0 if i==0 else 1))
            _day=[]
            _minutes = 0
            for month_day, minutes in _colletion_of_the_month:
                if _start_date.strftime(FORMAT_DATE) == month_day.strftime(FORMAT_DATE):
                    _minutes = float(minutes)
            _day.append((i+1))
            _day.append(_minutes)
            _statistic.append(_day)
        return _statistic

    def get_statistic_of_the_year(self, timezone, user_id):
        _today = date.today()
        _qrys_year = """
        select
            to_char((start_datetime_at  at time zone '{0}')::date,'YYYY-MM') month_year,
            sum (
            	DateDiff(
            	'minute',
            		(start_datetime_at  at time zone '{0}')::timestamp,
            		(due_datetime_at at time zone '{0}')::timestamp
            	)
            ) mimutes
            from
            pomodoro_activities
            where start_datetime_at is not null and due_datetime_at is not null
            and (start_datetime_at at time zone '{0}')::date>='{1}'
            and (due_datetime_at at time zone '{0}')::date<='{2}'
            and create_id = {3}
            group by to_char((start_datetime_at  at time zone '{0}')::date,'YYYY-MM')
        """.format(timezone, (_today.strftime("%Y")+'-01-01'),
                   _today.strftime(FORMAT_DATE), user_id)
        g.db_conn.execute(_qrys_year)
        _colletion_of_the_year = []
        if g.db_conn.count() > 0:
            _colletion_of_the_year = [row for row in g.db_conn.fetch()]
        _statistic = []
        _statistic.append(['Minutes', 'Minutes per Month'])
        for i in range(0,_today.month):
            _day=[]
            _minutes = 0
            for month_year, minutes in _colletion_of_the_year:
                _month = '0' + str(i+1) if i <=9 else str(i)
                _month = str(_today.year)+'-' + _month
                if _month == month_year:
                    _minutes = float(minutes)
            _day.append(calendar.month_name[(i+1)])
            _day.append(_minutes)
            _statistic.append(_day)
        return _statistic

    def get_activities_registred(self, user_id):
        qrys_activities = """
        select
            id,name, timer, start_datetime_at, due_datetime_at
        from pomodoro_activities
        where
            create_id = {} and deleted_at is null and
            start_datetime_at is null and due_datetime_at is null
        """.format(user_id)
        g.db_conn.execute(qrys_activities)
        _colletion = []
        if g.db_conn.count() > 0:
            for _id,name,_timer,start_datetime_at,due_datetime_at in g.db_conn.fetch():
                _colletion.append({
                    'id': _id,
                    'name': name,
                    'timer': _timer.strftime(FORMAT_TIME),
                    'start_datetime_at': start_datetime_at,
                    'due_datetime_at': due_datetime_at
                })
        return {self._table:_colletion}
