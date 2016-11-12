# -*- coding: utf-8 -*-
# © 2016. by Zero 1/0.


class ExceptionRest(Exception):

    def __init__(self, message=None, status_code=400, errors=None):
        super(ExceptionRest, self).__init__(message)
        self.status_code = status_code
        self.errors = errors
