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
from flask import Flask, request, send_from_directory, g, session, url_for, redirect, abort
from flask_mail import Mail
from flask_babel import Babel
from flask_restful import Api
from v.tools.db import PsqlAoL
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from apscheduler.triggers.cron import CronTrigger

import functools
import time
import atexit
from datetime import datetime

# User
from v.auth.rest.authRst import Auth, AuthListRst
from v.auth.controller.google import Google
# Quick List
from v.project.controller.projectCtl import ProjectCtl
from v.project.rest.projectRst import ProjectRst, ProjectListRst
from v.project.rest.projectTaskRst import ProjectTaskRst, ProjectTaskListRst
from v.project.rest.projectTaskParticipatedRst import ProjectParticipatedRst, ProjectParticipatedListRst
from v.project.rest.projectTaskIssueRst import ProjectIssueRst, ProjectIssueListRst
from v.project.controller.projectCommentCtl import ProjectCommentCtl

# Wish list
from v.wish.rest.wishRst import WishRst, WishListRst

# Dream
from v.dream.controller.dreamCtl import DreamCtl
from v.dream.rest.dreamRst import DreamRst, DreamListRst

# Habit
from v.habit.controller.habitCtl import HabitCtl
from v.habit.rest.habitRst import HabitRst, HabitListRst
from v.habit.rest.historyHabitRst import HistoryHabitRst, HistoryHabitListRst

from v.reminder.controllers.reminderCtl import ReminderCtl, ReminderListCtl

# To buy
from v.buy.controller.buyCtl import BuyCtl
from v.buy.rest.pendingRst import PendingRst, PendingListRst

# Pomodoro
from v.pomodoro.controller.pomodoroCtl import PomodoroCtl
from v.pomodoro.rest.pomodoroRst import PomodoroRst, PomodoroListRst

# Dashboard
from v.dashboard.controller.dashboardCtl import DashboardCtl

#Remember
from v.reminder.job import jobReminder

# Frontend index
from v.frontend.controller.homeCtl import HomeCtl
from v.frontend.controller.resetPasswordCtl import ResetPasswordCtl
from v.frontend.model.resetPasswordMdl import ResetPasswordMdl

app = Flask(__name__)

app.config.from_pyfile('flaskapp.cfg')
api = Api(app)
mail = Mail(app)
babel = Babel(app)
google = Google(
    app.config.get('GOOGLE_CLIENT_ID'),
    app.config.get('GOOGLE_CLIENT_SECRET')
)


def habit_remember(dt_now=None):
    with app.app_context():
        db = PsqlAoL(
            user=app.config.get('DB_USER'),
            password=app.config.get('DB_PASSWORD'),
            database=app.config.get('DB_NAME'),
            port=app.config.get('DB_PORT'),
            host=app.config.get('DB_HOST')
        )
        mail = Mail(app)
        o = jobReminder(db=db, mail=mail)
        o.habit(dt_now=dt_now)


def habit_fail():
    datetime_now = datetime.now()
    datetime_now = datetime_now.replace(hour=23, minute=59)
    habit_remember(dt_now=datetime_now)


# @app.before_first_request
# def initialize():
#     # Add global object Connection
# 
#     # res
#     # # Add Schedule
#     import logging
#     logging.basicConfig()
#     scheduler = BackgroundScheduler()
#     # gconfig = {'apscheduler.logger': app.logger}
#     scheduler.start()
#     scheduler.add_job(
#         func=habit_remember,
#         trigger=IntervalTrigger(seconds=5),
#         id='habit_remember',
#         name='Send notification for remember habit',
#         replace_existing=True
#     )
#     scheduler.add_job(habit_fail, CronTrigger(hour='02', minute='01'))
#     # Shut down the scheduler when exiting the app
#     atexit.register(lambda: scheduler.shutdown())


@app.before_request
def open_db():
    g.db_conn = PsqlAoL(
        user=app.config.get('DB_USER'),
        password=app.config.get('DB_PASSWORD'),
        database=app.config.get('DB_NAME'),
        port=app.config.get('DB_PORT'),
        host=app.config.get('DB_HOST')
    )
    if g.db_conn:
        g.db_conn.execute("set timezone to 'UTC';")

    # Add global object Mail
    g.mail = mail

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

LANGUAGES = {
    'es': 'Español',
    'en': 'English'
}


@babel.localeselector
def get_locale():
    # user = getattr(g, 'user', None)
    # if user is not None:
    # return 'en' #user.locale
    # return request.accept_languages.best_match(LANGUAGES.keys())
    lang = 'en'
    if 'lang' in session:
        lang = session['lang']
    return lang


@babel.timezoneselector
def get_timezone():
    user = getattr(g, 'user', None)

    if user is not None:
        return user.timezone

# RESTful
api_v1 = '/api/v1/'

# Yourself
# Habit
api.add_resource(HabitListRst, api_v1 + 'habit')
api.add_resource(HabitRst, api_v1 + 'habit/<int:habit_id>')
api.add_resource(HistoryHabitListRst, api_v1 + 'habit/history')
api.add_resource(HistoryHabitRst, api_v1 + 'habit/history/<int:history_habit_id>')

api.add_resource(ReminderCtl, api_v1 + 'reminder/<int:reminder_id>')
api.add_resource(ReminderListCtl, api_v1 + 'reminder')

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
# Rest project commnet


@app.route(ProjectCommentCtl.endpoint(api=api_v1, method='PUT'), methods=['PUT', 'GET', 'DELETE'])
def project_comment_put_get_delete():
    project_comment_object = ProjectCommentCtl()
    if request.method == 'PUT':
        return project_comment_object.put()
    elif request.method == 'GET':
         return project_comment_object.get()
    elif request.method == 'DELETE':
        return project_comment_object.delete()
    else:
        abort(500)


@app.route(ProjectCommentCtl.endpoint(api=api_v1), methods=['GET', 'POST'])
def project_comment_get_post():
    project_comment_object = ProjectCommentCtl()
    if request.method == 'POST':
        return project_comment_object.post()
    elif request.method == 'GET':
        return project_comment_object.get_by()
    else:
        abort(500)

prefix_admin = app.config.get('APP_PREFIX_ADMIN')
startpoint_admin = prefix_admin[1:]

# User
api.add_resource(AuthListRst, api_v1 + 'user')

# Pomodoro
api.add_resource(PomodoroListRst, api_v1 + 'pomodoro')
api.add_resource(PomodoroRst, api_v1 + 'pomodoro/<int:id>')


# Auth by Api
@app.route(api_v1 + 'login', methods=['POST'])
def login():
    _data = request.json
    _auth = Auth()
    return _auth.login(data=_data)


##########################
# Frontend Web application
@app.route('/', endpoint='/')
def frontend_overview():
    return HomeCtl.overview()


@app.route('/pricing', endpoint='pricing')
def frontend_pricing():
    return HomeCtl.pricing()


@app.route('/google/login', endpoint='google/login')
def login_google():
    """
    redirect google accept term access account
    :return: Object Google authorization
    """
    callback = url_for('authorized_google', _external=True)
    return google.g.authorize(callback=callback)


@app.route('/google/oauth2callback')
@google.g.authorized_handler
def authorized_google(resp):
    google.authorized = resp
    if google.get_authorized('access_token'):
        if google.get_user_info():
            if google.start_session():
                return redirect('/ul/goal')
    return redirect('/', 404)


@app.route('/language', endpoint='language', methods=['GET'])
def language():
    lang = request.args.get('lang', 'en')
    if lang in LANGUAGES:
        session['lang'] = lang
    return redirect(url_for('/'))
# End frontend
##########################


@app.route('/<path:resource>')
def serveStaticResource(resource):
    return send_from_directory('static/', resource)


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


@app.route(prefix_admin + '/goal', endpoint=startpoint_admin + '/goal')
@is_login
def yourself():
    return DreamCtl.index()


@app.route(prefix_admin + '/to-buy', endpoint=startpoint_admin + '/to-buy')
@is_login
def to_buy():
    return BuyCtl.index()


@app.route(prefix_admin + '/habit', endpoint=startpoint_admin + '/habit')
@is_login
def habit():
    return HabitCtl.index()


@app.route(prefix_admin + '/quick-planning', endpoint=startpoint_admin + '/quick-planning')
@is_login
def quick_list():
    return ProjectCtl.index()


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
