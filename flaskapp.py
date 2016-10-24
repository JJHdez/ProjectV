import os
from datetime import datetime
from flask import Flask, request, render_template,  send_from_directory, g
from AoL.Utils.Db import PsqlAoL
from flask_restful import Api
from AoL.Auth.Auth import Auth
from AoL.Auth.User import User
from AoL.Discipline.Discipline import Discipline, DisciplineList
from AoL.Discipline.DisciplineHistory import  DisciplineHistory, DisciplineHistoryList
from json import loads

app = Flask(__name__)
app.config.from_pyfile('flaskapp.cfg')
api = Api(app)
api_v1 = '/api/v1/'
api.add_resource(DisciplineList, api_v1 + 'discipline')
api.add_resource(Discipline, api_v1 + 'discipline/<int:discipline_id>')
api.add_resource(DisciplineHistoryList, api_v1 + 'discipline/history')
api.add_resource(DisciplineHistory, api_v1 + 'discipline/history/<int:discipline_history_id>')


@app.before_request
def open_db():
    g.db_conn = PsqlAoL(
        user=app.config.get('DB_USER'),
        password=app.config.get('DB_PASSWORD'),
        database=app.config.get('DB_NAME')
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
