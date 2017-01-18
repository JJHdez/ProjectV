from flask import render_template


class ProjectCtl:

    def __init__(self):
        pass

    @staticmethod
    def index():
        return render_template('UL/Project/index.html')

    @staticmethod
    def project():
        pass

    @staticmethod
    def task():
        return render_template('UL/Project/task.html')

    @staticmethod
    def subtask():
        return render_template('UL/Project/subtask.html')

    @staticmethod
    def bug():
        return render_template('UL/Project/issue.html')

class ProjectMdl:
    pass