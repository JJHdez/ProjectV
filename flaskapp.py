# -*- coding: utf-8 -*-
# ZERO 1/0 © 2016
# Fask Core
from flask import Flask, request, render_template, send_from_directory, g, session, url_for, redirect
from flask_mail import Mail
from flask_babel import Babel
from AoL.Utils.Db import PsqlAoL
from flask_restful import Api
# AOL Core RESTFul
from AoL.Auth.Auth import Auth
from AoL.Auth.User import UserList
from AoL.Habit.Habit import Habit, HabitList
from AoL.Habit.HabitHistory import HistoryHabit, HistoryHabitList
from AoL.Project.Project import Project, ProjectList
from AoL.Project.ProjectTask import ProjectTask, ProjectTaskList
from AoL.Project.ProjectTaskParticipated import ProjectParticipated, ProjectParticipatedList
from AoL.Project.ProjectTaskIssue import ProjectIssue, ProjectIssueList
from AoL.Wish.Wish import Wish, WishList
from AoL.Dream.Dream import Dream, DreamList
from AoL.Pending.Pending import Pending, PendingList
from AoL.Pomodoro.Pomodoro import Pomodoro, PomodoroList
# UL Core
from UL.Dashboard.Dashboard import DashboardCtl
from UL.Project.Project import ProjectCtl
from UL.Yourself.Yourself import YourselfCtl
from UL.Home.Home import HomeCtl
from UL.Auth.ResetPassword import ResetPasswordCtl
from UL.Pomodoro.Pomodoro import PomodoroCtl
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
# Habit
api.add_resource(HabitList, api_v1 + 'habit')
api.add_resource(Habit, api_v1 + 'habit/<int:habit_id>')
api.add_resource(HistoryHabitList, api_v1 + 'habit/history')
api.add_resource(HistoryHabit, api_v1 + 'habit/history/<int:history_habit_id>')
# Project
api.add_resource(ProjectList, api_v1 + 'project')
api.add_resource(Project, api_v1 + 'project/<int:id>')
api.add_resource(ProjectTaskList, api_v1 + 'project/task')
api.add_resource(ProjectTask, api_v1 + 'project/task/<int:id>')
api.add_resource(ProjectParticipatedList, api_v1 + 'project/task/participated')
api.add_resource(ProjectParticipated, api_v1 + 'project/task/participated/<int:id>')
api.add_resource(ProjectIssueList, api_v1 + 'project/task/issue')
api.add_resource(ProjectIssue, api_v1 + 'project/task/issue/<int:id>')
# wish
api.add_resource(WishList, api_v1 + 'wish')
api.add_resource(Wish, api_v1 + 'wish/<int:id>')
# dream
api.add_resource(DreamList, api_v1 + 'dream')
api.add_resource(Dream, api_v1 + 'dream/<int:id>')
# Pending
api.add_resource(PendingList, api_v1 + 'pending')
api.add_resource(Pending, api_v1 + 'pending/<int:id>')
# User
api.add_resource(UserList, api_v1+'user')
# Pomodoro
api.add_resource(PomodoroList, api_v1 + 'pomodoro')
api.add_resource(Pomodoro, api_v1 + 'pomodoro/<int:id>')


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
@app.route(prefix_admin+'/dashboard', endpoint=startpoint_admin+'/dashboard')
@is_login
def dashboard():
    return DashboardCtl.index()


@app.route(prefix_admin+'/yourself', endpoint=startpoint_admin+'/yourself')
@is_login
def yourself():
    return YourselfCtl.index()


# start - Projects
@app.route(prefix_admin+'/project', endpoint=startpoint_admin+'/project')
@is_login
def project():
    return ProjectCtl.index()


@app.route(prefix_admin+'/project/task', endpoint=startpoint_admin+'/project/task')
@is_login
def tasks():
    return ProjectCtl.task()


@app.route(prefix_admin+'/project/task/subtask', endpoint=startpoint_admin+'/project/task/subtask')
@is_login
def subtask():
    return ProjectCtl.subtask()


@app.route(prefix_admin+'/project/task/issue', endpoint=startpoint_admin+'/project/task/issue')
@is_login
def issue():
    return ProjectCtl.bug()
# end - Projects


# start - Projects
@app.route(prefix_admin+'/pomodoro', endpoint=startpoint_admin+'/porodoro')
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
