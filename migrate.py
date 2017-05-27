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

from flask import Flask
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config.from_pyfile('flaskapp.cfg')

db = SQLAlchemy(app)


class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    create_date = db.Column(db.TIMESTAMP, default="timezone('UTC'::text, now())", nullable=False)
    facebook = db.Column(db.VARCHAR, default='NULL', unique=True)
    google_plus = db.Column(db.VARCHAR, default='NULL', unique=True)
    email = db.Column(db.VARCHAR, nullable=False, unique=True)
    name = db.Column(db.VARCHAR, nullable=False)
    last_name = db.Column(db.VARCHAR, nullable=True)
    cover = db.Column(db.Text, nullable=True)
    timezone = db.Column(db.VARCHAR, default='UTC')
    password = db.Column(db.VARCHAR, nullable=True)


class Dream(db.Model):
    __tablename__ = 'dreams'

    id = db.Column(db.Integer, primary_key=True)
    create_date = db.Column(db.TIMESTAMP, default="now()", nullable=False)
    deleted_at = db.Column(db.TIMESTAMP, default="NULL", nullable=True)
    create_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    name = db.Column(db.VARCHAR, nullable=False)
    due_date_at = db.Column(db.Date, nullable=True)
    completed_at = db.Column(db.TIMESTAMP,  nullable=True)


class Habit(db.Model):
    __tablename__ = 'habits'

    id = db.Column(db.Integer, primary_key=True)
    created_date = db.Column(db.TIMESTAMP, default="now()", nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    finished_date = db.Column(db.TIMESTAMP,  nullable=True)
    closed_date = db.Column(db.TIMESTAMP,  nullable=True)
    name = db.Column(db.VARCHAR, nullable=False)


class HabitHistory(db.Model):
    __tablename__ = 'history_habits'

    id = db.Column(db.Integer, primary_key=True)
    created_date = db.Column(db.TIMESTAMP, default="now()", nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    habit_id = db.Column(db.Integer, db.ForeignKey('habits.id'))
    state = db.Column(db.VARCHAR, nullable=True)


class Pendings(db.Model):

    __tablename__ = 'pendings'

    id = db.Column(db.Integer, primary_key=True)
    created_at = db.Column(db.TIMESTAMP, default="now()", nullable=False)
    deleted_at = db.Column(db.TIMESTAMP, default="NULL", nullable=True)
    create_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    name = db.Column(db.VARCHAR, nullable=False)
    description = db.Column(db.Text, nullable=True)
    completed_at = db.Column(db.TIMESTAMP, default="NULL", nullable=True)


class Pomodoro(db.Model):

    __tablename__ = 'pomodoro_activities'

    id = db.Column(db.Integer, primary_key=True)
    created_at = db.Column(db.TIMESTAMP, default="now()", nullable=False)
    deleted_at = db.Column(db.TIMESTAMP, default="NULL", nullable=True)
    create_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    name = db.Column(db.VARCHAR, nullable=False)
    timer = db.Column(db.Time, nullable=False)
    start_datetime_at = db.Column(db.TIMESTAMP, default="NULL", nullable=True)
    due_datetime_at = db.Column(db.TIMESTAMP, default="NULL", nullable=True)


class Wishes(db.Model):
    __tablename__ = 'wishes'

    id = db.Column(db.Integer, primary_key=True)
    created_at = db.Column(db.TIMESTAMP, default="now()", nullable=False)
    deleted_at = db.Column(db.TIMESTAMP, default="NULL", nullable=True)
    create_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    name = db.Column(db.VARCHAR, nullable=False)
    priority = db.Column(db.Integer, default=1)
    due_date_at = db.Column(db.Date, default="NULL", nullable=True)
    completed_at = db.Column(db.TIMESTAMP, default="NULL", nullable=True)


class Projects(db.Model):

    __tablename__ = 'projects'

    id = db.Column(db.Integer, primary_key=True)
    created_at = db.Column(db.TIMESTAMP, default="now()", nullable=False)
    deleted_at = db.Column(db.TIMESTAMP, default="NULL", nullable=True)
    create_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    name = db.Column(db.VARCHAR, nullable=False)
    completed_at = db.Column(db.TIMESTAMP, default="NULL", nullable=True)


class ProjectTasks(db.Model):

    __tablename__ = 'project_tasks'

    id = db.Column(db.Integer, primary_key=True)
    created_at = db.Column(db.TIMESTAMP, default="now()", nullable=False)
    deleted_at = db.Column(db.TIMESTAMP, default="NULL", nullable=True)
    create_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'))
    parent_id = db.Column(db.Integer, nullable=True)
    name = db.Column(db.VARCHAR, nullable=False)
    description = db.Column(db.Text, nullable=True)
    start_date_at = db.Column(db.Date, default="NULL", nullable=True)
    due_date_at = db.Column(db.Date, default="NULL", nullable=True)
    completed_at = db.Column(db.TIMESTAMP, default="NULL", nullable=True)


class ProjectTaskParticiped(db.Model):

    __tablename__ = 'project_task_participed'

    id = db.Column(db.Integer, primary_key=True)
    created_at = db.Column(db.TIMESTAMP, default="now()", nullable=False)
    deleted_at = db.Column(db.TIMESTAMP, default="NULL", nullable=True)
    create_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    project_task_id = db.Column(db.Integer, db.ForeignKey('project_tasks.id'))
    assigned_user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    name = db.Column(db.VARCHAR, nullable=False)
    description = db.Column(db.Text, nullable=True)
    start_date_at = db.Column(db.Date, default="NULL", nullable=True)
    due_date_at = db.Column(db.Date, default="NULL", nullable=True)
    completed_at = db.Column(db.TIMESTAMP, default="NULL", nullable=True)


class ProjectTeams(db.Model):

    __tablename__ = 'project_teams'

    id = db.Column(db.Integer, primary_key=True)
    created_at = db.Column(db.TIMESTAMP, default="now()", nullable=False)
    deleted_at = db.Column(db.TIMESTAMP, default="NULL", nullable=True)
    create_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    name = db.Column(db.VARCHAR, nullable=False)


class ProjectTeamsProjects(db.Model):

    __tablename__ = 'project_teams_projects'

    id = db.Column(db.Integer, primary_key=True)
    created_at = db.Column(db.TIMESTAMP, default="now()", nullable=False)
    deleted_at = db.Column(db.TIMESTAMP, default="NULL", nullable=True)
    create_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'))
    team_id = db.Column(db.Integer, db.ForeignKey('project_teams.id'))


class ProjectTaskIssues(db.Model):

    __tablename__ = 'project_task_issues'

    id = db.Column(db.Integer, primary_key=True)
    created_at = db.Column(db.TIMESTAMP, default="now()", nullable=False)
    deleted_at = db.Column(db.TIMESTAMP, default="NULL", nullable=True)
    create_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    project_task_participed_id = db.Column(db.Integer, db.ForeignKey('project_task_participed.id'))
    assigned_user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    name = db.Column(db.VARCHAR, nullable=False)
    description = db.Column(db.Text, nullable=True)
    kind = db.Column(db.VARCHAR, nullable=True, default='bug')
    priority = db.Column(db.VARCHAR, nullable=True, default='major')
    completed_at = db.Column(db.TIMESTAMP, default="NULL", nullable=True)


class Token(db.Model):

    __tablename__ = 'token'
    id = db.Column(db.Integer, primary_key=True)
    create_date = db.Column(db.TIMESTAMP, default="now()", nullable=False)
    token = db.Column(db.VARCHAR, nullable=False)
    expired = db.Column(db.TIMESTAMP, default="NULL", nullable=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    name = db.Column(db.VARCHAR, nullable=False, default='auth-app')


class Tags(db.Model):

    __tablename__ = 'tags'

    id = db.Column(db.Integer, primary_key=True)
    created_at = db.Column(db.TIMESTAMP, default="now()", nullable=False)
    deleted_at = db.Column(db.TIMESTAMP, default="NULL", nullable=True)
    create_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    name = db.Column(db.VARCHAR, nullable=False)
    type = db.Column(db.VARCHAR, nullable=False)


