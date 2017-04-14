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


class ProjectMdl:
    _table = 'projects'
    _fields = {
        u'name': {
            'required': True,
            'length': {'min': 3}
        },
        u'completed_at': {
            'typeof': 'date'
        },
    }

    def __init__(self):
        pass

    _query_get = """
    SELECT array_to_json(array_agg(row_to_json(t) )) as collection
        FROM (
            select
                id, created_at, deleted_at, create_id, name, completed_at, null team
            from
                projects where deleted_at is null %s

                union all

            select
                p.id,
                p.created_at,
                p.deleted_at,
                p.create_id,
                p.name,
                p.completed_at,
                pt.name
            from
                project_teams pt inner join project_teams_projects ptp on pt.id = ptp.team_id
                inner join projects p on ptp.project_id = p.id
            where pt.deleted_at is null and ptp.deleted_at is null %s
        )t
    """