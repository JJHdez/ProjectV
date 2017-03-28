window.addEventListener('load', function ()
{

    var projectV = null;
    var taskV = null;

    // Project controller
    var projectDialog = null;
    var showProjectDialogButton = null;

    // Project task controller
    var taskDialog = null;
    var showTaskDialogButton = null;

    /// PROJECT TASK CONTROLLER
    taskV = new Vue({
        delimiters: libzr.getDelimiterVue(),
        el: '#project-tasks-panel',
        data: {
            tasks: [],
            taskModel: {
                index: -1,
                id: -1,
                name: '',
                due_date_at: '',
                start_date_at: '',
                project_id:'',
                description:''
            },
            url: libzr.getApi() + 'project/task',
            flagNew: true,
            current_task: null,
        //    General controller
            users: [],
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
                project_task_id:'',
                description:'',
                assigned_user_id:-1
            },
            urlIssue: libzr.getApi() + 'project/task/issue',
            flagNewIssue: true,
            kinds:[
                {value:'bug', text:'Problema'},
                {value:'enhancement', text:'Mejora'},
                {value:'proposal', text:'Tarea'},
                {value:'research', text:'Investigacion'}
            ],
            priorities:[
                {value:'trivial', text:'trivial'},
                {value:'minor', text:'Menor'},
                {value:'major', text:'Mayor'},
                {value:'critical', text:'Critico'},
                {value:'blocker', text:'Bloquear'}
            ]
        },

        methods: {

            init: function (_project_id) {
                var _url = this.url+"?by=project_id&project_id="+_project_id+"&completed=False";
                this._callback(null, _url, 'GET', 'init');
            },

            quickAddTask: function () {
                this.flagNew = true;
                this.acceptTask();
            },

            acceptTask: function () {
                var _action = this.flagNew ? 'new' : 'edit';
                var _method = this.flagNew ? 'POST' : 'PUT';
                var _url = this.flagNew ? this.url : this.url + '/' + this.taskModel.id;

                var new_project_task = {
                    name: this.taskModel.name,
                    project_id: projectV.current_project.id

                };
                if (this.taskModel.start_date_at.trim().length>9){
                    new_project_task['start_date_at']=this.taskModel.start_date_at.trim();
                }else{
                    new_project_task['start_date_at']=this.today;
                }
                if (this.taskModel.due_date_at.trim().length>9){
                    new_project_task['due_date_at']=this.taskModel.due_date_at.trim();
                }else {
                    new_project_task['due_date_at']=this.today;
                }
                if (this.taskModel.description.trim().length>3)
                    new_project_task['description']=this.taskModel.description.trim();
                this._callback(new_project_task, _url, _method, _action);
            },

            cleanTask: function () {
                this.taskModel.index = -1;
                this.taskModel.id = -1;
                this.taskModel.name = '';
                this.taskModel.start_date_at = '';
                this.taskModel.due_date_at = '';
                this.taskModel.description= '';
                this.taskModel.project_id= -1;
            },

            doneTask: function (data, index) {
                var _values = {'completed_at': libzr.getUtcDate(new Date()).format('yyyy-M-d h:m:s')};
                this.taskModel.index = index;
                this._callback(_values, this.url + '/' + data.id, 'PUT', 'done');
            },

            editTask: function (task, index) {
                this.taskModel.index = index;
                this.taskModel.id = task.id;
                this.taskModel.name = task.name;
                this.taskModel.start_date_at = task.start_date_at? task.start_date_at: '';
                this.taskModel.due_date_at = task.due_date_at? task.due_date_at: '';
                this.taskModel.description= task.description? task.description: '';
                this.getUsers(task, index);
                this.initSubTask(task,index);
                this.initIssue(task, index);
                this.openDialogTask(false);
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
                                for (var c = 0; c < response.data.project_tasks.length; c++) {
                                    self.tasks.push(response.data.project_tasks[c])
                                }
                                break;
                            case 'done':
                                self.tasks.splice(self.taskModel.index, 1);
                                break;
                            case 'remove':
                                self.tasks.splice(self.taskModel.index, 1);
                                self.closeDialogTask();
                                break;
                            case 'new':
                                _data['id'] = response.data.project_tasks[0].id;
                                self.tasks.push(_data);
                                break;
                            case 'edit':
                                _data['id'] = self.taskModel.id;
                                // _data['created_at'] = self.taskModel.created_at;
                                // _data['due_date_at'] = self.taskModel.due_date_at;
                                self.tasks.splice(self.taskModel.index, 1, _data);
                                self.closeDialogTask();
                                break
                        }
                        if (response.message)
                            notify({message: response.message});
                        self.cleanTask();
                        return true;
                    } else {
                        notify({message: response.message});
                        return false;
                    }
                }).fail(function () {
                    notify({message: 'Error al generar la peticion, favor interntar mas tarde! :('});
                    return false;
                });
            },

            removeTask: function () {
                this._callback(null, this.url + '/' + this.taskModel.id, 'DELETE', 'remove');
            },

            panelTask:function(_action){
                if (_action == 'hide'){
                    $("#project-tasks-panel").hide();
                    $("#show-task-dialog").hide();
                    $("#from-task-back-project").hide();
                }else {
                    $("#project-tasks-panel").show();
                    $("#show-task-dialog").show();
                    $("#from-task-back-project").show();
                }
            },

            backProject: function () {
                this.panelTask('hide');
                this.tasks = [];
                projectV.init();
                projectV.panelProject('show');
            },

            openDialogTask: function (isNew) {
                this.flagNew= isNew;
                if (this.flagNew)
                    this.cleanTask();
                if (taskDialog)
                    taskDialog.showModal();
            },

            closeDialogTask: function () {
                this.cleanTask();
                if (taskDialog){
                    taskDialog.close();
                }
            },

        //  General controller
            getUsers: function (task, index) {
                // this.subTaskModel.assigned_user_id = -1;
                this.users = [];
                var _url = libzr.getApi() +
                    "user?get=team&by=project_task_id&project_task_id="+task.id;
                this._requestSubTask(null, _url, 'GET','users');
            },

            getAssignedUser: function (userId) {
                var _name = '';
                for (var i =0 ; i<this.users.length;i++){
                    if (userId == this.users[i].id){
                        _name = this.users[i].name;
                        break;
                    }
                }
                return _name;
            },

            getColorDueDate: function (_due_date) {
                var _classColor='mdl-chip mdl-chip--deletable';
                if (_due_date){
                    var due_date = new Date(_due_date);
                    var today = new Date();
                    var days  =libzr.getDiffDay(due_date, today);
                    if (days < 0){
                        _classColor = _classColor+' mdl-color--red'
                    }else if (days==0){
                        _classColor = _classColor+' mdl-color--green'
                    }else if (days>0 && days < 3){
                        _classColor = _classColor+' mdl-color--yellow'
                    }
                }
                // mdl-color--yellow
                return _classColor;
            },

        //  Controller sub-task
            initSubTask: function (task, index) {
                this.subTasks=[];
                var _urlSubTask = this.urlSubTask +"?completed=False&by=project_task_id&project_task_id="+task.id;
                this._requestSubTask(null, _urlSubTask, 'GET', 'init');
            },

            _requestSubTask: function (_data, _url, _method, _action) {
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
                                for (var c = 0; c < response.data.project_task_participed.length; c++) {
                                    self.subTasks.push(response.data.project_task_participed[c])
                                }
                                break;
                            case 'done':
                                self.subTasks.splice(self.subTaskModel.index, 1);
                                break;
                            case 'remove':
                                self.subTasks.splice(self.subTaskModel.index, 1);
                                subTask_dialog_close();
                                break;
                            case 'new':
                                _data['id'] = response.data.project_task_participed[0].id;
                                self.subTasks.push(_data);
                                // subTask_dialog_close();
                                break;
                            case 'edit':
                                _data['id'] = self.subTaskModel.id;
                                // _data['created_at'] = self.subTaskModel.created_at;
                                // _data['due_date_at'] = self.subTaskModel.due_date_at;
                                self.subTasks.splice(self.subTaskModel.index, 1, _data);
                                subTask_dialog_close();
                                break;
                            case 'users':
                                for (var c = 0; c < response.data.users.length; c++) {
                                    self.users.push(response.data.users[c])
                                }
                                break;
                        }
                        if (response.message)
                            notify({message: response.message});
                        self.cleanSubTask();
                        return true;
                    } else {
                        if (response.message)
                            notify({message: response.message});
                        return false;
                    }
                }).fail(function () {
                    // notify({message: 'Error al generar la peticion, favor interntar mas tarde! :('});
                    return false;
                });
            },

            quickAddSubTask: function () {
                this.flagNewSubTask = true;
                this.acceptSubTask();
            },

            acceptSubTask: function () {
                var _action = this.flagNewSubTask ? 'new' : 'edit';
                var _method = this.flagNewSubTask ? 'POST' : 'PUT';
                var _url = this.flagNewSubTask ? this.urlSubTask : this.urlSubTask + '/' + this.subTaskModel.id;

                var new_project_sub_task = {
                    name: this.subTaskModel.name,
                    project_task_id: this.taskModel.id,
                    assigned_user_id: this.subTaskModel.assigned_user_id
                };
                var today = new Date().format('yyyy-M-d');

                if (this.subTaskModel.start_date_at.trim().length>9) {
                    new_project_sub_task['start_date_at'] = this.subTaskModel.start_date_at.trim();
                }else if (this.flagNewSubTask){
                    new_project_sub_task['start_date_at'] = today;
                }
                if (this.subTaskModel.due_date_at.trim().length>9) {
                    new_project_sub_task['due_date_at'] = this.subTaskModel.due_date_at.trim();
                }else if (this.flagNewSubTask){
                    new_project_sub_task['due_date_at'] = today;
                }
                if (this.subTaskModel.description.trim().length>3)
                    new_project_sub_task['description']=this.subTaskModel.description.trim();
                this._requestSubTask(new_project_sub_task, _url, _method, _action);
            },

            doneSubTask: function (subTask, index) {
                var _values = {'completed_at': libzr.getUtcDate(new Date()).format('yyyy-M-d h:m:s')};
                this.subTaskModel.index = index;
                this._requestSubTask(_values, this.urlSubTask + '/' + subTask.id, 'PUT', 'done');
            },

            cleanSubTask: function () {
                this.subTaskModel.index = -1;
                this.subTaskModel.id = -1;
                this.subTaskModel.name = '';
                this.subTaskModel.start_date_at = '';
                this.subTaskModel.due_date_at = '';
                this.subTaskModel.description= '';
                this.subTaskModel.task_id= -1;
                this.subTaskModel.user_assigned_id = -1;
            },

            editSubTask: function (subTask, index) {
                this.flagNewSubTask= false;
                this.subTaskModel.index = index;
                this.subTaskModel.id = subTask.id;
                this.subTaskModel.name = subTask.name;
                this.subTaskModel.start_date_at = subTask.start_date_at? subTask.start_date_at: '';
                this.subTaskModel.due_date_at = subTask.due_date_at? subTask.due_date_at: '';
                this.subTaskModel.description= subTask.description? subTask.description: '';
                this.subTaskModel.assigned_user_id = subTask.assigned_user_id;
                // task_dialog_close();
                // subTask_dialog_open();
            },

            RemoveSubTask: function () {
                this._requestSubTask(null, this.urlSubTask + '/' + this.subTaskModel.id, 'DELETE', 'remove');
            },

        //  Controller Issue

            initIssue: function (task, index) {
                this.issues = [];
                var _url = this.urlIssue+"?completed=False&by=project_task_id&project_task_id="+task.id;
                this._requestIssue(null, _url, 'GET', 'init');
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
                    console.log(response);
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
                                issue_dialog_close();
                                break;
                            case 'new':
                                _data['id'] = response.data.project_task_issues[0].id;
                                self.issues.push(_data);
                                issue_dialog_close();
                                break;
                            case 'edit':
                                _data['id'] = self.issueModel.id;
                                // _data['created_at'] = self.issueModel.created_at;
                                // _data['due_date_at'] = self.issueModel.due_date_at;
                                self.issues.splice(self.issueModel.index, 1, _data);
                                issue_dialog_close();
                                break;
                        }
                        if (response.message)
                            notify({message: response.message});
                        self.cleanIssue();
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

            getKind: function (kind) {
                var _kind = '';
                for (var i =0 ; i<this.kinds.length;i++){
                    if (kind == this.kinds[i].value){
                        _kind = this.kinds[i].text;
                        break;
                    }
                }
                return _kind;
            },

            getKindColor: function (kind) {
                var _colorClass = "mdl-chip";
                switch (kind){
                    case 'enhancement':
                        _colorClass = _colorClass+' mdl-color--cyan';
                        break;
                    case 'proposal':
                        _colorClass = _colorClass+' mdl-color--blue';
                        break;
                    case 'bug':
                        _colorClass = _colorClass+' mdl-color--red';
                        break;
                    case 'research':
                        _colorClass = _colorClass+' mdl-color--light-green';
                        break;
                }
                return _colorClass;
            },
            getPriority: function (priority) {
                var _priority= '';
                for (var i =0 ; i<this.priorities.length;i++){
                    if (priority == this.priorities[i].value){
                        _priority = this.priorities[i].text;
                        break;
                    }
                }
                return _priority;
            },

            getPriorityColor: function (priority) {
                var _colorClass = "mdl-chip";
                switch (priority){
                    case 'trivial' || 'minor':
                        _colorClass = _colorClass+' mdl-color--lime';
                        break;
                    case 'major':
                        _colorClass = _colorClass+' mdl-color--yellow';
                        break;
                    case 'critical':
                        _colorClass = _colorClass+' mdl-color--red';
                        break;
                    case 'blocker':
                        _colorClass = _colorClass+' mdl-color--indigo';
                        break;
                }
                return _colorClass;
            },

            quickAddIssue: function () {
                this.flagNewIssue = true;
                this.acceptIssue();
            },

            acceptIssue: function () {
                var _action = this.flagNewIssue ? 'new' : 'edit';
                var _method = this.flagNewIssue ? 'POST' : 'PUT';
                var _url = this.flagNewIssue ? this.urlIssue : this.urlIssue + '/' + this.issueModel.id;

                var new_project_task_issue = {
                    name: this.issueModel.name,
                    project_task_id: this.taskModel.id,
                    assigned_user_id: this.issueModel.assigned_user_id,
                    kind: this.issueModel.kind,
                    priority: this.issueModel.priority
                };
                if (this.issueModel.description.trim().length>3)
                    new_project_task_issue['description']=this.issueModel.description.trim();
                this._requestIssue(new_project_task_issue, _url, _method, _action);
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

            doneIssue: function (issue, index) {
                var _values = {'completed_at': libzr.getUtcDate(new Date()).format('yyyy-M-d h:m:s')};
                this.issueModel.index = index;
                this._requestIssue(_values, this.urlIssue + '/' + issue.id, 'PUT', 'done');
            },

            editIssue: function (issue, index) {
                this.flagNewIssue = false;
                this.issueModel.index = index;
                this.issueModel.id = issue.id;
                this.issueModel.name = issue.name;
                this.issueModel.kind = issue.kind;
                this.issueModel.priority = issue.priority;
                this.issueModel.description= issue.description;
                this.issueModel.assigned_user_id = issue.assigned_user_id;
                // issue_dialog_open();
            },

            removeIssue: function () {
                this._requestIssue(null, this.urlIssue + '/' + this.issueModel.id, 'DELETE', 'remove');
            },


        }, // end methods

        computed: {
            validationTaskModel: function () {
                return {
                    accept: this.taskModel.name.trim().length > 3,
                    remove: !this.flagNew
                }
            },

            validationSubTaskModel: function () {
                return {
                    accept: this.subTaskModel.name.trim().length > 3,
                    remove: !this.flagNewSubTask
                }
            },

            validationIssueModel: function () {
                return {
                    accept: this.issueModel.name.trim().length > 3,
                    remove: !this.flagNewIssue
                }
            },

            project_name: function () {
                var _title = '';
                if (projectV!= null)
                    if(projectV.current_project!= null)
                        _title = projectV.current_project.name;
                return _title
            }
        },
        watch: {
            'issueModel.assigned_user_id': function(val) {
                this.issueModel.assigned_user_id = val;
            },

            'issueModel.kind': function(val) {
                this.issueModel.kind = val;
            },

            'issueModel.priority': function(val) {
                this.issueModel.priority = val;
            },

            'subTaskModel.assigned_user_id': function(val) {
                this.subTaskModel.assigned_user_id = val;
            }
        }

    });

    taskV.panelTask('hide');
    // taskV.init();

    taskDialog = document.querySelector('#task-dialog');
    // showTaskDialogButton = document.querySelector('#show-task-dialog');

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
                // due_date_at: '',
                // completed_at: '',
                // created_at: '',
                index: -1
            },
            url: libzr.getApi() + 'project',
            flagNew: true,
            current_project:null
        },

        methods: {

            init: function () {
                this._callback(null, this.url, 'GET', 'init');
            },

            _accept: function () {
                var _action = this.flagNew ? 'new' : 'edit';
                var _method = this.flagNew ? 'POST' : 'PUT';
                var _url = this.flagNew ? this.url : this.url + '/' + this.projectModel.id;
                var new_dream = {
                    name: this.projectModel.name
                };
                this._callback(new_dream, _url, _method, _action);
            },

            _clean: function () {
                this.projectModel.name = '';
                // this.projectModel.due_date_at = '';
                this.projectModel.index = -1;
                this.projectModel.id = -1;
                // console.log('scape')
            },

            _done: function (data, index) {
                var _values = {'completed_at': getDateUtc(new Date(), 'datetime')};
                this.projectModel.index = index;
                this._callback(_values, this.url + '/' + data.id, 'PUT', 'done');
            },

            _edit: function (data, index) {
                this.projectModel.name = data.name;
                // this.projectModel.due_date_at = data.due_date_at ? data.due_date_at : '';
                // this.projectModel.completed_at = data.completed_at;
                // this.projectModel.created_at = data.created_at;
                this.projectModel.id = data.id;
                this.projectModel.index = index;
                this.openDialog(false);
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
                                    self.projects.push(response.data.projects[c])
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
                                // _data['created_at'] = new Date().toJSON().slice(0, 10).replace(/-/g, '/');
                                self.projects.push(_data);
                                self.closeDialog();
                                break;
                            case 'edit':
                                _data['id'] = self.projectModel.id;
                                // _data['created_at'] = self.projectModel.created_at;
                                // _data['due_date_at'] = self.projectModel.due_date_at;
                                self.projects.splice(self.projectModel.index, 1, _data);
                                self.closeDialog();
                                break;
                        }
                        if (response.message)
                            notify({message: response.message});
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

            remove: function () {
                this._callback(null, this.url + '/' + this.projectModel.id, 'DELETE', 'remove');
            },

            viewTask : function(data, index){
                this.current_project = data;
                this.panelProject('hide');
                this.projects = [];
                taskV.init(this.current_project.id);
                taskV.panelTask('show');
            },

            panelProject:function(_action){
                if (_action == 'hide'){
                    $("#projects-panel").hide();
                    $("#show-project-dialog").hide();
                }else {
                    $("#projects-panel").show();
                    $("#show-project-dialog").show();
                }
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
            }

        }, // end methods

        computed: {

            validationProjectModel: function () {
                return {
                    accept: this.projectModel.name.trim().length > 3,
                    remove: !this.flagNew
                }
            }

        }

    });

    projectV.init();

    projectV.panelProject('show');

    projectDialog = document.querySelector('#project-dialog');

    showProjectDialogButton = document.querySelector('#show-project-dialog');

    if (!projectDialog.showModal) {
        dialogPolyfill.registerDialog(projectDialog);
    }

    showProjectDialogButton.addEventListener('click', function () {
        projectV.openDialog(true)
    });

});