from flask import render_template


class HomeCtl:

    def __init__(self):
        pass

    @staticmethod
    def index():
        return render_template('index.html')


class HomeMdl:
    pass