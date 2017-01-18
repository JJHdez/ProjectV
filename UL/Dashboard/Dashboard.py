from flask import render_template


class DashboardCtl:

    def __init__(self):
        pass

    @staticmethod
    def index():
        return render_template('UL/dashboard.html')

class DashboardMdl:
    pass