# -*- coding: utf-8 -*-
# ZERO 1/0 © 2016


class User(object):

    def __init__(self, id, email=None, name=None, last_name=None, cover=None, timezone=None):
        self.id = id
        self.email = email
        self.name = name
        self.last_name = last_name
        self.cover = cover
        self.timezone = timezone