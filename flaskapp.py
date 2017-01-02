# -*- coding: utf-8 -*-
# ZERO 1/0 © 2016
from flask import Flask, request, render_template, send_from_directory, g
from AoL.Utils.Db import PsqlAoL
from flask_restful import Api
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

app = Flask(__name__)
app.config.from_pyfile('flaskapp.cfg')
api = Api(app)

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
    _url_path = str(request.url_rule)
    _url_endpoint = str(request.endpoint)
    _url = _url_path.replace(_url_endpoint, '')
    if api_v1 in _url:
        if _url_endpoint != 'login':
            _token = request.headers.get('X-Authorization')
            _auth = Auth()
            _rs = _auth.is_login(token=_token)
            if 'error' in _rs:
                return _rs['error']
            else:
                g.user = _rs['user']


@app.route('/')
def index():
    return render_template('index.html')


@app.route(api_v1 + 'login', methods=['POST'])
def login():
    _data = request.json
    _auth = Auth()
    return _auth.login(data=_data)


@app.route('/<path:resource>')
def serveStaticResource(resource):
    return send_from_directory('static/', resource)


if __name__ == '__main__':
    app.run()
