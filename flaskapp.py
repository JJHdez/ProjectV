# -*- coding: utf-8 -*-
# © 2016. by Zero 1/0.
from flask import Flask, request, render_template,  send_from_directory, g
from AoL.Utils.Db import PsqlAoL
from flask_restful import Api
from AoL.Auth.Auth import Auth
from AoL.Auth.User import User
from AoL.Habit.Habit import Habit, HabitList
from AoL.Habit.HabitHistory import HistoryHabit, HistoryHabitList
from AoL.Habit.Wish import Wish, WishList
from json import loads

app = Flask(__name__)
app.config.from_pyfile('flaskapp.cfg')
api = Api(app)
api_v1 = '/api/v1/'
# Habit
api.add_resource(HabitList, api_v1 + 'habit')
api.add_resource(Habit, api_v1 + 'habit/<int:habit_id>')
api.add_resource(HistoryHabitList, api_v1 + 'habit/history')
api.add_resource(HistoryHabit, api_v1 + 'habit/history/<int:history_habit_id>')

api.add_resource(WishList, api_v1 + 'wish')
api.add_resource(Wish, api_v1 + 'wish/<int:wish_id>')


@app.before_request
def open_db():
    g.db_conn = PsqlAoL(
        user=app.config.get('DB_USER'),
        password=app.config.get('DB_PASSWORD'),
        database=app.config.get('DB_NAME'),
        port=app.config.get('DB_PORT')
    )
    _url_path = str(request.url_rule)
    _url_endpoint = str(request.endpoint)
    _url = _url_path.replace(_url_endpoint, '')
    if api_v1 in _url:
        if _url_endpoint != 'login':
            _token = request.headers.get('X-Authorization')
            _auth = Auth()
            _rs = _auth.is_login(token=_token)
            if _rs.status_code != 200:
                return _rs
            else:
                g.user = User(id=loads(_rs.response[0])[u'user_id'])


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
