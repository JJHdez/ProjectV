from flask import render_template


class YourselfCtl:

    def __init__(self):
        pass

    @staticmethod
    def index():
        return render_template('UL/Yourself/index.html')

class YourselfMdl:
    pass