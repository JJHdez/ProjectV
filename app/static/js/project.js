/**
 * Copyright 2017 ProjectV Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * */

window.addEventListener('load', function ()
{

    var projectV = null;
    var taskV = null;

    // Project controller
    var projectDialog = null;

    // Project task controller
    var taskDialog = null;

    /// PROJECT TASK CONTROLLER
    taskV = new Vue({
        delimiters: libzr.getDelimiterVue(),
        el: '#project-tasks-panel',
        data: {
            groupTasks: [],

            tasksToday : [],
            taskTodayModel: {'name':''},

            tasksTomorrow : [],
            taskTomorrowModel : {'name':''},

            tasksUpcoming : [],
            taskUpcomingModel : {'name':''},

            tasksSomeday : [],
            taskSomedayModel : {'name':''},

            currentGroupTask: null,

            url: libzr.getApi() + 'project/task',

        //    General controller
            //users: [],
            today: new Date().format('yyyy-M-d'),
        //    Data sub-task     //
            urlSubTask: libzr.getApi() + 'project/task/participated',
            flagNewSubTask: true,
            subTasks: [],
            subTaskModel: {
                index: -1,
                id: -1,
                name: '',
                start_date_at: '',
                due_date_at: '',
                project_task_id:'',
                description:'',
                assigned_user_id:-1
            },
        //    Data issues      //
            issues: [],
            issueModel: {
                index: -1,
                id: -1,
                name: '',
                kind: '',
                priority: '',
                project_task_participed_id:'',
                description:'',
                assigned_user_id:-1
            },
            urlIssue: libzr.getApi() + 'project/task/issue',
            flagNewIssue: true,
        // Model comments
            comments: [],
            commentModel: {
                'comment': '',
                'id': -1
            },
            urlComment:libzr.getApi() + 'project/comment'
        },

        methods: {

            init: function (workspace_id) {
                this.groupTasks = [];
                this.tasksToday = [];
                this.tasksTomorrow = [];
                this.tasksUpcoming = [];
                this.tasksSomeday = [];
                this.issues = [];
                this.subTasks=[];
                var _url = this.url+"?by=project_id&project_id="+workspace_id+"&completed=False";
                this._callback(null, _url, 'GET', 'init');
            },

            _callback: function (_data, _url, _method, _action) {
                var self = this;
                var _json = null;
                if (_data)
                    _json = JSON.stringify(_data);
                $.ajax({
                    url: _url,
                    type: _method,
                    data: _json,
                    contentType: 'application/json'
                }).done(function (response) {
                    if (response.status_code === 200 || response.status_code === 201) {

                        switch (_action) {
                            case 'init':
                                for (var c = 0; c < response.data.project_tasks.length; c++) {
                                    var _project_task  = response.data.project_tasks[c];
                                    self.groupTasks.push(_project_task);
                                    self.loadSubTaskById(_project_task, c);
                                }
                                break;
                        }
                    } else {
                        notify({message: response.message});
                        return false;
                    }
                }).fail(function () {
                    notify({message: 'Error al generar la peticion, favor interntar mas tarde! :('});
                    return false;
                });
            },

        //  Controller sub-task
            loadSubTaskById: function (task, index) {
                var _urlSubTask = this.urlSubTask +"?completed=False&by=project_task_id&project_task_id="+task.id;
                this._requestSubTask(null, _urlSubTask, 'GET', 'loadSubTaskById', task);
            },

            acceptSubTask: function (task, index, flagNewSubTask) {
                this.flagNewSubTask = flagNewSubTask;
                var _action = this.flagNewSubTask ? 'new' : 'edit';
                var _method = this.flagNewSubTask ? 'POST' : 'PUT';

                var today = new Date();
                var due_date = new Date();
                var start_date = new Date();
                var _subTasKModel = null;
                var project_task_id =  null;
                if (this.flagNewSubTask){
                    switch (task.name){
                        case 'Today':
                            _subTasKModel = this.taskTodayModel;
                            break;
                        case 'Tomorrow':
                            _subTasKModel = this.taskTomorrowModel;
                            due_date = new Date(due_date.setDate(today.getDate()+1)).format('yyyy-M-d');
                            break;
                        case 'Upcoming':
                             _subTasKModel = this.taskUpcomingModel;
                             due_date = new Date(due_date.setDate(today.getDate()+5)).format('yyyy-M-d');
                            break;
                        case 'Someday':
                             _subTasKModel = this.taskSomedayModel;
                             due_date = new Date(due_date.setDate(today.getDate()+10)).format('yyyy-M-d');
                            break;
                    }
                    project_task_id = task.id;
                    start_date = start_date.format('yyyy-M-d');
                    if(_subTasKModel.name.length<=3){
                        _subTasKModel =  null;
                        console.log('Es necesario escribir minimo 3 letra!')
                    }
                }else{
                    _subTasKModel = this.subTaskModel;
                    project_task_id  = _subTasKModel.project_task_id;
                    start_date = null;
                    if (_subTasKModel.due_date_at)
                        due_date =_subTasKModel.due_date_at
                }
                if (_subTasKModel){
                    var _url = this.flagNewSubTask ? this.urlSubTask : this.urlSubTask + '/' + _subTasKModel.id;

                    var new_project_sub_task = {
                        name: _subTasKModel.name,
                        project_task_id: project_task_id
                    };
                    if (start_date)
                        new_project_sub_task['start_date_at'] = start_date;
                    if (due_date)
                        new_project_sub_task['due_date_at'] = due_date;
                    this._requestSubTask(new_project_sub_task, _url, _method, _action, task);
                }

            },

            doneSubTask: function () {
                var _values = {'completed_at': libzr.getUtcDate(new Date()).format('yyyy-M-d h:m:s')};
                //this.subTaskModel.index = index;
                this._requestSubTask(_values, this.urlSubTask + '/' + this.subTaskModel.id,
                    'PUT', 'done', this.currentGroupTask);
            },

            removeSubTask: function () {
                this._requestSubTask(null, this.urlSubTask + '/' + this.subTaskModel.id,
                    'DELETE', 'remove', this.currentGroupTask);
            },

            _requestSubTask: function (_data, _url, _method, _action, context=null) {
                var self = this;
                var _json = null;
                if (_data)
                    _json = JSON.stringify(_data);
                $.ajax({
                    url: _url,
                    type: _method,
                    data: _json,
                    contentType: 'application/json'
                }).done(function (response) {
                   // console.log(response)
                    if (response.status_code === 200 || response.status_code === 201) {
                        switch (_action) {
                            case 'init':
                                for (var c = 0; c < response.data.project_task_participed.length; c++) {
                                    self.subTasks.push(response.data.project_task_participed[c])
                                }
                                break;
                            case 'done':
                            case 'remove':
                                switch (context.name){
                                        case 'Today':
                                            self.tasksToday.splice(self.subTaskModel.index, 1);
                                            break;
                                        case 'Tomorrow':
                                            self.tasksTomorrow.splice(self.subTaskModel.index, 1);
                                            break;
                                        case 'Upcoming':
                                            self.tasksUpcoming.splice(self.subTaskModel.index, 1);
                                            break;
                                        case 'Someday':
                                            self.tasksSomeday.splice(self.subTaskModel.index, 1);
                                            break;
                                    }
                                self.closeDialogSubTask();
                                break;
                            case 'new':
                                _data['id'] = response.data.project_task_participed[0].id;
                                switch (context.name){
                                    case 'Today':
                                        self.tasksToday.push(_data);
                                        break;
                                    case 'Tomorrow':
                                        self.tasksTomorrow.push(_data);
                                        break;
                                    case 'Upcoming':
                                        self.tasksUpcoming.push(_data);
                                        break;
                                    case 'Someday':
                                        self.tasksSomeday.push(_data);
                                        break;

                                }
                                self.cleanSubTask(context);
                                break;
                            case 'edit':
                                _data['id'] = self.subTaskModel.id;
                                // _data['created_at'] = self.subTaskModel.created_at;
                                // _data['due_date_at'] = self.subTaskModel.due_date_at;
                                self.subTasks.splice(self.subTaskModel.index, 1, _data);
                                self.closeDialogSubTask();
                                break;
                            case  'loadSubTaskById':
                                for (var c = 0; c < response.data.project_task_participed.length; c++) {
                                    switch (context.name){
                                        case 'Today':
                                            self.tasksToday.push(response.data.project_task_participed[c]);
                                            break;
                                        case 'Tomorrow':
                                            self.tasksTomorrow.push(response.data.project_task_participed[c]);
                                            break;
                                        case 'Upcoming':
                                            self.tasksUpcoming.push(response.data.project_task_participed[c]);
                                            break;
                                        case 'Someday':
                                            self.tasksSomeday.push(response.data.project_task_participed[c]);
                                            break;
                                    }
                                }
                                break;
                        }
                    } else {
                        if (response.status_code != 404){
                            if (response.message)
                                notify({message: response.message});
                        }
                        return false;
                    }
                }).fail(function () {
                    notify({message: 'Error al generar la peticion, favor interntar mas tarde! :('});
                    return false;
                });
            },

            cleanSubTask: function (context) {
                if (context.name){
                    switch (context.name){
                        case 'Today':
                            this.taskTodayModel.name = '';
                            break;
                        case 'Tomorrow':
                             this.taskTomorrowModel.name = '';
                            break;
                        case 'Upcoming':
                             this.taskUpcomingModel.name = '';
                            break;
                        case 'Someday':
                             this.taskSomedayModel.name = '';
                            break;
                    }
                }
            },
            
            getSubTaskIconByName: function (_name) {
                var _icon = '';
                switch (_name){
                    case  'Today':
                        _icon = 'star';
                        break;
                    case  'Tomorrow':
                        _icon = 'star_half';
                        break;
                    case  'Upcoming':
                    case  'Someday':
                        _icon = 'star_border';
                        break;

                }
                return _icon
            },
            
            getSubTaskIconColourByName: function (_name) {
                var _icon_colour = 'material-icons';
                switch (_name){
                    case  'Today':
                        _icon_colour = _icon_colour + ' mdl-color-text--red';
                        break;
                    case  'Tomorrow':
                        _icon_colour = _icon_colour + ' mdl-color-text--light-green';
                        break;
                    case  'Upcoming':
                        _icon_colour = _icon_colour + '';
                        break;
                    case  'Someday':
                        _icon_colour = _icon_colour + ' mdl-color-text--blue';
                        break;

                }
                return _icon_colour;
            },
            openDialogSubTask: function (subTask, index, groupTask) {
                this.subTaskModel =  subTask;
                this.subTaskModel.index =  index;
                this.currentGroupTask = this.getGroupTaskByName(groupTask);
                if (taskDialog)
                    taskDialog.showModal();
                    this.initIssue(subTask, index);
                    this.initComment(subTask, index);
            },

            closeDialogSubTask: function () {
                if (taskDialog){
                    taskDialog.close();
                }
            },

        //  Controller Issue

            initIssue: function (task, index) {
                this.issues = [];
                var _url = this.urlIssue+"?completed=False&by=project_task_participed_id&project_task_participed_id="+task.id;
                this._requestIssue(null, _url, 'GET', 'init');
            },

            acceptIssue: function (flagNewIssue) {
                this.flagNewIssue = flagNewIssue;
                if (this.flagNewIssue){
                    if (this.validation.issueQuickAdd){
                        var _action = this.flagNewIssue ? 'new' : 'edit';
                        var _method = this.flagNewIssue ? 'POST' : 'PUT';
                        var _url = this.flagNewIssue ? this.urlIssue : this.urlIssue + '/' + this.issueModel.id;

                        var new_project_task_issue = {
                            name: this.issueModel.name,
                            project_task_participed_id: this.subTaskModel.id
                        };
                        this._requestIssue(new_project_task_issue, _url, _method, _action);
                    }else{

                    }
                }else{

                }
            },

            doneIssue: function (issue, index) {
                var _values = {'completed_at': libzr.getUtcDate(new Date()).format('yyyy-M-d h:m:s')};
                this.issueModel.index = index;
                this._requestIssue(_values, this.urlIssue + '/' + issue.id, 'PUT', 'done');
            },

            removeIssue: function (issue, index) {
                this.issueModel = issue;
                this.issueModel.index = index;
                this._requestIssue(null, this.urlIssue + '/' + this.issueModel.id, 'DELETE', 'remove');
            },

            _requestIssue: function (_data, _url, _method, _action) {
                var self = this;
                var _json = null;
                if (_data)
                    _json = JSON.stringify(_data);
                $.ajax({
                    url: _url,
                    type: _method,
                    data: _json,
                    contentType: 'application/json'
                }).done(function (response) {
                    if (response.status_code == 200 || response.status_code == 201) {
                        switch (_action) {
                            case 'init':
                                for (var c = 0; c < response.data.project_task_issues.length; c++) {
                                    self.issues.push(response.data.project_task_issues[c])
                                }
                                break;
                            case 'done':
                                self.issues.splice(self.issueModel.index, 1);
                                break;
                            case 'remove':
                                self.issues.splice(self.issueModel.index, 1);
                                break;
                            case 'new':
                                _data['id'] = response.data.project_task_issues[0].id;
                                self.issues.unshift(_data);
                                break;
                            case 'edit':
                                _data['id'] = self.issueModel.id;
                                // _data['created_at'] = self.issueModel.created_at;
                                // _data['due_date_at'] = self.issueModel.due_date_at;
                                self.issues.splice(self.issueModel.index, 1, _data);
                                issue_dialog_close();
                                break;
                        }
                        self.cleanIssue();
                        return true;
                    } else {
                        if (response.status_code != 404 ){
                            if (response.message)
                                notify({message: response.message});
                        }
                        return false;
                    }
                }).fail(function () {
                    notify({message: 'Error al generar la peticion, favor interntar mas tarde! :('});
                    return false;
                });
            },
            
            cleanIssue: function () {
                this.issueModel.index = -1;
                this.issueModel.id = -1;
                this.issueModel.name = '';
                this.issueModel.kind = '';
                this.issueModel.priority = '';
                this.issueModel.description= '';
                this.issueModel.project_task_id= -1;
                this.issueModel.user_assigned_id = -1;
            },

            initComment: function (task, index) {
                this.comments = [];
                var _url = this.urlComment+"?by=resource&resource=project.task.participed&resource_id="+task.id;
                this._requestComment(null, _url, 'GET', 'init');
            },

            acceptComment: function (isNew) {

                if (isNew){
                    if (this.validation.commentQuickAdd){
                        var _action = isNew ? 'new' : 'edit';
                        var _method = isNew ? 'POST' : 'PUT';
                        var _url = isNew ? this.urlComment : this.urlComment + '/' + this.commentModel.id;

                        var _new_comment = {
                            'comment': this.commentModel.comment,
                            'resource': 'project.task.participed',
                            'resource_id': this.subTaskModel.id,
                            // 'user_name': '',
                            // 'user_cover': ''
                        };
                        this._requestComment(_new_comment, _url, _method, _action);
                    }else{

                    }
                }else{

                }
            },

            _requestComment: function (_data, _url, _method, _action) {
                var self = this;
                var _json = null;
                if (_data)
                    _json = JSON.stringify(_data);
                $.ajax({
                    url: _url,
                    type: _method,
                    data: _json,
                    contentType: 'application/json'
                }).done(function (response) {
                    if (response.status_code == 200 || response.status_code == 201) {
                        switch (_action) {
                            case 'init':
                                for (var c = 0; c < response.data.project_comments.length; c++) {
                                    self.comments.push(response.data.project_comments[c])
                                }
                                break;
                            // case 'done':
                            //     self.issues.splice(self.issueModel.index, 1);
                            //     break;
                            // case 'remove':
                            //     self.issues.splice(self.issueModel.index, 1);
                            //     break;
                            case 'new':
                                _data['id'] = response.data.project_comments[0].id;
                                self.comments.unshift(_data);
                                self.cleanBy({'model':'comment'});
                                break;
                            // case 'edit':
                            //     _data['id'] = self.issueModel.id;
                            //     // _data['created_at'] = self.issueModel.created_at;
                            //     // _data['due_date_at'] = self.issueModel.due_date_at;
                            //     self.issues.splice(self.issueModel.index, 1, _data);
                            //     issue_dialog_close();
                            //     break;
                        }
                        return true;
                    } else {
                        if (response.status_code != 404 ){
                            if (response.message)
                                notify({message: response.message});
                        }
                        return false;
                    }
                }).fail(function () {
                    notify({message: 'Error al generar la peticion, favor interntar mas tarde! :('});
                    return false;
                });
            },

            compiledMarkdown: function (comment) {
                  return marked(comment, { sanitize: true })
            },

            cleanBy: function (object) {
                if (object.model == 'comment'){
                    this.commentModel.comment = '';
                    this.commentModel.id = -1;
                }
            },

            getGroupTaskByName: function (_name) {
                var _task = null;
                for (var i =0; i < this.groupTasks.length; i++){
                  if (this.groupTasks[i]['name'] == _name){
                      _task =this.groupTasks[i];
                      break;
                  }
                }
                return _task;
            },
            onMoveToday : function (relatedContext) {
                this.changeGroup(this.getGroupTaskByName('Today'),
                    relatedContext.item['_underlying_vm_'].id
                );
            },
            onMoveTomorrow : function (relatedContext) {
                this.changeGroup(this.getGroupTaskByName('Tomorrow'),
                    relatedContext.item['_underlying_vm_'].id
                );
            },
            onMoveUpcoming: function (relatedContext) {
                this.changeGroup(this.getGroupTaskByName('Upcoming'),
                    relatedContext.item['_underlying_vm_'].id
                );

            },
            onMoveSomeday: function (relatedContext) {
                this.changeGroup(
                    this.getGroupTaskByName('Someday'),
                    relatedContext.item['_underlying_vm_'].id
                );
            },
            changeGroup: function (group, subTaskId) {
                if (group){
                    var groupId = group.id;
                    this._requestSubTask(
                        {'project_task_id':groupId},
                        this.urlSubTask + '/' + subTaskId,
                        'PUT', 'changeGroup', null
                    );
                }
            }

            
        }, // end methods

        computed: {

            validation: function () {
                return {
                    subTaskEdit: this.subTaskModel.name.trim().length >= 3,
                    issueQuickAdd: this.issueModel.name.trim().length > 3,
                    commentQuickAdd: this.commentModel.comment.trim().length > 3
                }
            }
        }
    });

    taskDialog = document.querySelector('#task-dialog');

    if (!taskDialog.showModal) {
         dialogPolyfill.registerDialog(taskDialog);
     }

    // PROJECT CONTROLLER //

    projectV = new Vue({
        delimiters: libzr.getDelimiterVue(),
        el: '#projects-panel',
        data: {
            projects: [],
            projectModel: {
                id: -1,
                name: '',
                index: -1
            },
            workspaceModelQuickAdd:{
              name:''
            },
            url: libzr.getApi() + 'project',
            flagNew: true,
            current_project: null
        },

        methods: {

            init: function () {
                document.querySelector("#menu-quick-planning").style.borderBottom = "4px solid #000";
                this._callback(null, this.url, 'GET', 'init');
            },

            accept: function (flagNew) {
                var _workspace = null;
                if (flagNew){
                    if (this.validation.workspaceQuickAdd){
                        this.flagNew = flagNew;
                       _workspace =  this.workspaceModelQuickAdd;
                    }else{
                        console.log('Tiene que escribir minimo 3 caracteres!')
                    }
                }else{
                    if (this.validation.workspaceEdit){
                        _workspace =  this.projectModel
                    }else{
                        console.log('Tiene que escribir minimo 3 caracteres!')
                    }
                }
                if (_workspace){
                     var _action = this.flagNew ? 'new' : 'edit';
                    var _method = this.flagNew ? 'POST' : 'PUT';
                    var _url = this.flagNew ? this.url : this.url + '/' + _workspace.id;
                    var _new = {
                        name: _workspace.name
                    };
                    this._callback(_new, _url, _method, _action);
                }
            },

            done: function (data, index) {
                var _values = {'completed_at': getDateUtc(new Date(), 'datetime')};
                this.projectModel.index = index;
                this._callback(_values, this.url + '/' + data.id, 'PUT', 'done');
            },

            edit: function (data, index) {
                this.projectModel.name = data.name;
                this.projectModel.id = data.id;
                this.projectModel.index = index;
                this.openDialog(false);
            },

            remove: function () {
                this._callback(null, this.url + '/' + this.projectModel.id, 'DELETE', 'remove');
            },

            viewTask : function(data, index){
                this.current_project = data;
                taskV.init(this.current_project.id);
            },

            openDialog: function (isNew) {
                this.flagNew= isNew;
                if (this.flagNew)
                    this._clean();
                if (projectDialog)
                    projectDialog.showModal();
            },

            closeDialog: function () {
                this._clean();
                if (projectDialog){
                    projectDialog.close();
                }
            },

            activeWorkspace: function(workspace, index){
                var _addColourWorkspace = 'mdl-chip mdl-chip--contact mdl-chip--deletable';
                if (this.current_project.name === workspace.name){
                    _addColourWorkspace = _addColourWorkspace +' mdl-color--amber';
                }
                return _addColourWorkspace;
            },

            _clean: function () {
                this.projectModel.name = '';
                this.projectModel.index = -1;
                this.projectModel.id = -1;
                this.workspaceModelQuickAdd.name = '';
            },

            _callback: function (_data, _url, _method, _action) {
                var self = this;
                var _json = null;
                if (_data)
                    _json = JSON.stringify(_data);
                $.ajax({
                    url: _url,
                    type: _method,
                    data: _json,
                    contentType: 'application/json'
                }).done(function (response) {
                    if (response.status_code == 200 || response.status_code == 201) {
                        switch (_action) {
                            case 'init':
                                for (var c = 0; c < response.data.projects.length; c++) {
                                    var _workspace = response.data.projects[c];
                                    self.projects.push(_workspace);
                                    if (c == 0){
                                        self.viewTask(_workspace, c);
                                    }
                                }
                                break;
                            case 'done':
                                self.projects.splice(self.projectModel.index, 1);
                                break;
                            case 'remove':
                                self.projects.splice(self.projectModel.index, 1);
                                self.closeDialog();
                                break;
                            case 'new':
                                _data['id'] = response.data.projects[0].id;
                                self.projects.push(_data);
                                break;
                            case 'edit':
                                _data['id'] = self.projectModel.id;
                                self.projects.splice(self.projectModel.index, 1, _data);
                                self.closeDialog();
                                break;
                        }
                        self._clean();
                        return true;
                    } else {
                        if (response.message)
                            notify({message: response.message});
                        return false;
                    }
                }).fail(function () {
                    notify({message: 'Error al generar la peticion, favor interntar mas tarde! :('});
                    return false;
                });
            },

        }, // end methods

        computed: {
            validation: function () {
                return{
                    workspaceQuickAdd : this.workspaceModelQuickAdd.name.trim().length>3,
                    workspaceEdit: this.projectModel.name.trim().length > 3,
                    workspaceRemove: !this.flagNew
                }
            }

        }

    });

    projectV.init();

    projectDialog = document.querySelector('#project-dialog');
    if (!projectDialog.showModal) {
         dialogPolyfill.registerDialog(projectDialog);
    }

});