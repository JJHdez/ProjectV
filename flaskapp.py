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

from flask import Flask, request, send_from_directory, g, session, url_for, redirect
from flask_mail import Mail
from flask_babel import Babel
from flask_restful import Api

from v.tools.db import PsqlAoL

# User
from v.auth.rest.authRst import Auth, AuthListRst

# Project
from v.project.controller.projectCtl import ProjectCtl
from v.project.rest.projectRst import ProjectRst, ProjectListRst
from v.project.rest.projectTaskRst import ProjectTaskRst, ProjectTaskListRst
from v.project.rest.projectTaskParticipatedRst import ProjectParticipatedRst, ProjectParticipatedListRst
from v.project.rest.projectTaskIssueRst import ProjectIssueRst, ProjectIssueListRst

# Wish list
from v.wish.rest.wishRst import WishRst, WishListRst

# Yourself
from v.yourself.controller.yourselfCtl import YourselfCtl
from v.yourself.habit.rest.habitRst import HabitRst, HabitListRst
from v.yourself.habit.rest.historyHabitRst import HistoryHabitRst, HistoryHabitListRst
from v.yourself.dream.rest.dreamRst import DreamRst, DreamListRst
from v.yourself.pending.rest.pendingRst import PendingRst, PendingListRst

# Pomodoro
from v.pomodoro.controller.pomodoroCtl import PomodoroCtl
from v.pomodoro.rest.pomodoroRst import PomodoroRst, PomodoroListRst

# Dashboard
from v.dashboard.controller.dashboardCtl import DashboardCtl

# Frontend index
from v.frontend.controller.homeCtl import HomeCtl
from v.frontend.controller.resetPasswordCtl import ResetPasswordCtl

app = Flask(__name__)

app.config.from_pyfile('flaskapp.cfg')
api = Api(app)
mail = Mail(app)
babel = Babel(app)


@app.before_request
def open_db():
    g.db_conn = PsqlAoL(
        user=app.config.get('DB_USER'),
        password=app.config.get('DB_PASSWORD'),
        database=app.config.get('DB_NAME'),
        port=app.config.get('DB_PORT'),
        host=app.config.get('DB_HOST')
    )
    g.mail = mail

    if g.db_conn:
        g.db_conn.execute("set timezone to 'UTC';")
    _url_path = str(request.url_rule)
    _url_endpoint = str(request.endpoint)
    _url = _url_path.replace(_url_endpoint, '')
    if api_v1 in _url:
        if _url_endpoint != 'login':
            _token = request.headers.get('X-Authorization')
            # print session
            if 'X-Authorization' in session and 'user' in session:
                _token = session['X-Authorization']
            _auth = Auth()
            _rs = _auth.is_login(token=_token)
            if 'error' in _rs:
                return _rs['error']
            else:
                g.user = _rs['user']


# RESTful
api_v1 = '/api/v1/'

# Yourself
# Habit
api.add_resource(HabitListRst, api_v1 + 'habit')
api.add_resource(HabitRst, api_v1 + 'habit/<int:habit_id>')
api.add_resource(HistoryHabitListRst, api_v1 + 'habit/history')
api.add_resource(HistoryHabitRst, api_v1 + 'habit/history/<int:history_habit_id>')
# wish
api.add_resource(WishListRst, api_v1 + 'wish')
api.add_resource(WishRst, api_v1 + 'wish/<int:id>')
# dream
api.add_resource(DreamListRst, api_v1 + 'dream')
api.add_resource(DreamRst, api_v1 + 'dream/<int:id>')
# Pending
api.add_resource(PendingListRst, api_v1 + 'pending')
api.add_resource(PendingRst, api_v1 + 'pending/<int:id>')

# Project
api.add_resource(ProjectListRst, api_v1 + 'project')
api.add_resource(ProjectRst, api_v1 + 'project/<int:id>')
api.add_resource(ProjectTaskListRst, api_v1 + 'project/task')
api.add_resource(ProjectTaskRst, api_v1 + 'project/task/<int:id>')
api.add_resource(ProjectParticipatedListRst, api_v1 + 'project/task/participated')
api.add_resource(ProjectParticipatedRst, api_v1 + 'project/task/participated/<int:id>')
api.add_resource(ProjectIssueListRst, api_v1 + 'project/task/issue')
api.add_resource(ProjectIssueRst, api_v1 + 'project/task/issue/<int:id>')

# User
api.add_resource(AuthListRst, api_v1 + 'user')

# Pomodoro
api.add_resource(PomodoroListRst, api_v1 + 'pomodoro')
api.add_resource(PomodoroRst, api_v1 + 'pomodoro/<int:id>')


@app.route(api_v1 + 'login', methods=['POST'])
def login():
    _data = request.json
    _auth = Auth()
    return _auth.login(data=_data)


# Web App
@app.route('/', endpoint='/')
def index():
    return HomeCtl.index()


@app.route('/<path:resource>')
def serveStaticResource(resource):
    return send_from_directory('static/', resource)


prefix_admin = app.config.get('APP_PREFIX_ADMIN')
startpoint_admin = prefix_admin[1:]


@app.context_processor
def prefix_admin_template():
    return dict(prefix_admin=startpoint_admin)


@app.context_processor
def app_name():
    return dict(app_name=app.config.get('APP_NAME', ''))


def is_login(func):
    def func_wrapper():
        if 'X-Authorization' not in session and 'user' not in session:
            return redirect(url_for('/'))
        else:
            return func()

    return func_wrapper


@app.route('/logout', endpoint='/logout')
@is_login
def logout():
    session.pop('X-Authorization', None)
    session.pop('user', None)
    return redirect(url_for('/'))


@app.route(prefix_admin + '/dashboard', endpoint=startpoint_admin + '/dashboard')
@is_login
def dashboard():
    return DashboardCtl.index()


@app.route(prefix_admin + '/yourself', endpoint=startpoint_admin + '/yourself')
@is_login
def yourself():
    return YourselfCtl.index()


@app.route(prefix_admin + '/quick-list', endpoint=startpoint_admin + '/quick-list')
@is_login
def quick_list():
    return ProjectCtl.index()

"""
@app.route(prefix_admin + '/project/task', endpoint=startpoint_admin + '/project/task')
@is_login
def tasks():
    return ProjectCtl.task()


@app.route(prefix_admin + '/project/task/subtask', endpoint=startpoint_admin + '/project/task/subtask')
@is_login
def subtask():
    return ProjectCtl.subtask()


@app.route(prefix_admin + '/project/task/issue', endpoint=startpoint_admin + '/project/task/issue')
@is_login
def issue():
    return ProjectCtl.bug()
"""

@app.route(prefix_admin + '/pomodoro', endpoint=startpoint_admin + '/pomodoro')
@is_login
def pomodoro():
    return PomodoroCtl.index()


@app.route('/reset/password', endpoint='reset/password', methods=['GET', 'POST', 'PUT'])
def reset_password():
    if request.method == 'GET':
        return ResetPasswordCtl.index()
    elif request.method == 'PUT':
        return ResetPasswordCtl.token()
    elif request.method == 'POST':
        return ResetPasswordCtl.password_change()

if __name__ == '__main__':
    app.run()
