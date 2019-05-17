# -*- coding: utf-8 -*-
# Copyright 2017 ProjectV Authors. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
from flask import g


class ProjectCommentMdl:
    _table = 'project_comments'
    _fields = {
        u'comment': {
            'typeof': 'string',
            'required': True,
        },
        u'resource': {
            'typeof': 'string',
            'required': True,
        },
        u'resource_id': {
            'required': True,
            'typeof': 'int'
        },
    }

    def __init__(self):
        pass

    def get_comment_by_resource(self, resource, resource_id):
        _qrys_comment_by_resource = """
            select u.name user_name, u.cover user_cover, pc.created_at, pc.comment 
            from  project_comments pc inner join users u on pc.create_id = u.id
            where  pc.deleted_at is null and pc.resource = '{}' and pc.resource_id = {}
            order by pc.created_at desc            
        """.format(resource, resource_id)
        g.db_conn.execute(_qrys_comment_by_resource)
        _collection_comments = []
        if g.db_conn.count() > 0:
            for user_name, user_cover, created_at, comment in g.db_conn.fetch():
                _collection_comments.append(
                    {'user_name':  user_name,
                     'user_cover': user_cover,
                     'created_at': created_at,
                     'comment': comment})
        return _collection_comments
