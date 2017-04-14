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

from flask import Flask, request, render_template, \
    send_from_directory, g, session, url_for, redirect
from flask_mail import Mail
from flask_babel import Babel
from flask_restful import Api

from V.Tools.Db import PsqlAoL

# User
from V.Auth.Controller.ResetPassword import ResetPasswordCtl
from V.Auth.Rest.Auth import Auth
from V.Auth.Rest.User import UserListRst

# Project
from V.Project.Controller.Project import ProjectCtl
from V.Project.Rest.Project import ProjectRst, ProjectListRst
from V.Project.Rest.ProjectTask import ProjectTaskRst, ProjectTaskListRst
from V.Project.Rest.ProjectTaskParticipated import ProjectParticipatedRst, ProjectParticipatedListRst
from V.Project.Rest.ProjectTaskIssue import ProjectIssueRst, ProjectIssueListRst

# Wish list
from V.Wish.Rest.Wish import WishRst, WishListRst

# Yourself
from V.Yourself.Controller.Yourself import YourselfCtl
from V.Yourself.Habit.Rest.Habit import HabitRst, HabitListRst
from V.Yourself.Habit.Rest.HabitHistory import HistoryHabitRst, HistoryHabitListRst
from V.Yourself.Dream.Rest.Dream import DreamRst, DreamListRst
from V.Yourself.Pending.Rest.Pending import PendingRst, PendingListRst

# Pomodoro
from V.Pomodoro.Controller.Pomodoro import PomodoroCtl
from V.Pomodoro.Rest.Pomodoro import PomodoroRst, PomodoroListRst
# Dashboard user / index
from V.Dashboard.Dashboard import DashboardCtl

# Landing page / home / frontend
from V.Home.Home import HomeCtl

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


# @babel.localeselector
# def get_locate():
#     pass
#
#
# @babel.timezoneselector
# def get_timezone():
#     pass

# RESTful AOL
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
api.add_resource(UserListRst, api_v1 + 'user')

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


# Url Admin
@app.route(prefix_admin + '/dashboard', endpoint=startpoint_admin + '/dashboard')
@is_login
def dashboard():
    return DashboardCtl.index()


@app.route(prefix_admin + '/yourself', endpoint=startpoint_admin + '/yourself')
@is_login
def yourself():
    return YourselfCtl.index()


# start - Projects
@app.route(prefix_admin + '/project', endpoint=startpoint_admin + '/project')
@is_login
def project():
    return ProjectCtl.index()


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


# end - Projects


# start - Projects
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


# Url testing
@app.route('/test')
def test():
    return render_template('test.html')


# Url testing

if __name__ == '__main__':
    app.run()
