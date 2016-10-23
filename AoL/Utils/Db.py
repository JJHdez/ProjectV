# -*- coding: utf-8 -*-
# © 2016. by Zero 1/0.
import psycopg2 as psql
import psycopg2.extras


# class PsqlAoL:
#
#     def __init__(self):
#         pass
#
#     @staticmethod
#     def connect(user='odoo', password='0d004dm1n', database='aol', host='localhost', port=5432):
#         url = 'postgresql://{}:{}@{}:{}/{}'
#         url = url.format(user, password, host, port, database)
#         con = sqlalchemy.create_engine(url, client_encoding='utf8')
#         meta = sqlalchemy.MetaData(bind=con, reflect=True)
#         return con, meta


class PsqlAoL:

    __host = 'localhost'
    __port = 5432
    __database = None
    __user = None
    __password = None
    __connection = None
    __cursor = None

    def __init__(self, user=None, password=None, database=None, host=None, port=None):
        try:
            if host:
                self.__host = host
            if database:
                self.__database = database
            if user:
                self.__user = user
            if password:
                self.__password = password
            if port:
                self.__port = port
            self.__connect()
        except Exception, e:
            print e

    def __connect(self):
        '''

        :return: Object connection postgresql
        '''
        try:
            str_connection = "host='%s' dbname='%s' user='%s' password='%s'" % \
                                  (self.__host, self.__database, self.__user, self.__password)
            # print str_connection
            self.__connection = psql.connect(database=self.__database,user=self.__user,
                                             password=self.__password,host=self.__host, port=self.__port)
            self.__cursor = self.__connection.cursor(cursor_factory=psycopg2.extras.DictCursor)
        except Exception, e:
            print e
        return self.__connection

    def execute(self, query, params=None, autocommit=True):
        self.__cursor.execute(query, params)
        if autocommit:
            self.commit()
            return self.__cursor

    def close(self):
        self.__connection.close()

    def commit(self):
        self.__connection.commit()

    def rollback(self):
        self.__connection.rollback()

    def one(self):
        return self.__cursor.fetchone()

    def many(self, size=0):
        _many = None
        if size > 0:
            _many = self.__cursor.fetchmany(size)
        else:
            _many = self.__cursor.fetchall()
        return _many

    def count(self):
        return self.__cursor.rowcount
