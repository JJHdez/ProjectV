from flask import render_template


class PomodoroCtl:

    def __init__(self):
        pass

    @staticmethod
    def index():
        return render_template('UL/Pomodoro/index.html')

class PromodoroMdl:
    pass