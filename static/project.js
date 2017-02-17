window.addEventListener('load', function ()
{

    var apiv1 = '/api/v1/';
    var delimiters = ['${', '}'];

    var projectV = null;
    var taskV = null;
    var subTaskV = null;
    var issueV = null;
    // Project controller
    var projectDialog = null;
    var showProjectDialogButton = null;

    // Project task controller
    var taskDialog = null;
    var showTaskDialogButton = null;

    // Project sub-task controller
    var subTaskDialog = null;
    var showSubTaskDialogButton = null;


    var issueDialog = null;
    var showIssueDialogButton = null;


    /// PROJECT TASK
    issueV = new Vue({
        delimiters: delimiters,
        el: '#project-task-issues-panel',
        data: {
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
            url: apiv1 + 'project/task/issue',
            flagNew: true,
            assigned_users: [],
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
            // if clicked tab issues or load page your self
            init: function (_task_id) {
                var _url = this.url+"?completed=False&by=project_task_id&project_task_id="+_task_id;
                this._callback(null, _url, 'GET', 'init');
                this.get_users();
            },

            _accept: function () {
                var _action = this.flagNew ? 'new' : 'edit';
                var _method = this.flagNew ? 'POST' : 'PUT';
                var _url = this.flagNew ? this.url : this.url + '/' + this.issueModel.id;

                var new_project_task_issue = {
                    name: this.issueModel.name,
                    project_task_id: taskV.current_task.id,
                    assigned_user_id: this.issues.assigned_user_id,
                    kind: this.issues.kind,
                    priority: this.issues.priority,
                };
                if (this.issueModel.description.trim().length>3)
                    new_project_task_issue['description']=this.issueModel.description.trim();

                this._callback(new_project_task_issue, _url, _method, _action);
            },
            // clean model
            _clean: function () {
                this.issueModel.index = -1;
                this.issueModel.id = -1;
                this.issueModel.name = '';
                this.issueModel.kind = '';
                this.issueModel.priority = '';
                this.issueModel.description= '';
                this.issueModel.project_task_id= -1;
                this.issueModel.user_assigned_id = -1;
            },

            _done: function (data, index) {
                var _values = {'completed_at': getDateUtc(new Date(), 'datetime')};
                this.issueModel.index = index;
                this._callback(_values, this.url + '/' + data.id, 'PUT', 'done');
            },

            _edit: function (data, index) {
                this.flagNew = false;
                this.issueModel.index = index;
                this.issueModel.id = data.id;
                this.issueModel.name = data.name;
                this.issueModel.kind = data.kind;
                this.issueModel.priority = data.priority;
                this.issueModel.description= data.description;
                this.issueModel.assigned_user_id = data.assigned_user_id;
                issue_dialog_open();
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
                            case 'users':
                                for (var o = 0; o < response.data.users.length; o++) {
                                    self.assigned_users.push(response.data.users[o])
                                }
                                break;
                        }
                        if (response.message)
                            notify({message: response.message});
                        self._clean();
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

            _remove: function () {
                this._callback(null, this.url + '/' + this.issueModel.id, 'DELETE', 'remove');
            },
            _panel_show_hide:function(_action){
                // if (_action == 'hide'){
                //     $("#project-task-issues-panel").hide();
                //     $("#show-issue-dialog").hide();
                // }else {
                //     $("#project-task-issues-panel").show();
                //     $("#show-issue-dialog").show();
                // }
            },
            get_users: function () {
                this.issueModel.assigned_user_id = -1;
                this.assigned_users = [];
                var _url = apiv1 +
                    "user?get=team&by=project_task_id&project_task_id="+taskV.current_task.id;
                this._callback(null, _url, 'GET','users');
            },
            get_assigned_user: function (user_id) {
                var _name = '';
                for (var i =0 ; i<this.assigned_users.length;i++){
                    if (user_id == this.assigned_users[i].id){
                        _name = this.assigned_users[i].name;
                        break;
                    }
                }
                return _name;
            },
            get_kind: function (kind) {
                var _kind = '';
                for (var i =0 ; i<this.kinds.length;i++){
                    if (kind == this.kinds[i].value){
                        _kind = this.kinds[i].text;
                        break;
                    }
                }
                return _kind;
            },
            get_priority: function (priority) {
                var _priority= '';
                for (var i =0 ; i<this.priorities.length;i++){
                    if (priority == this.priorities[i].value){
                        _priority = this.priorities[i].text;
                        break;
                    }
                }
                return _priority;
            }

        }, // end methods

        computed: {
            validationIssueModel: function () {
                return {
                    accept: this.issueModel.name.trim().length > 3,
                    remove: !this.flagNew
                }
            },
            task_name: function () {
                var _title = '';
                if (taskV!= null)
                    if(taskV.current_task!= null)
                        _title = taskV.current_task.name;
                return _title
            }
        },

        watch: {
            'issueModel.assigned_user_id': function(val) {
                this.issues.assigned_user_id = val;
            },
            'issueModel.kind': function(val) {
                this.issues.kind = val;
            },
            'issueModel.priority': function(val) {
                this.issues.priority = val;
            }
        }
    });

    issueV._panel_show_hide('hide');

    issueDialog = document.querySelector('#issue-dialog');
    showIssueDialogButton = document.querySelector('#show-issue-dialog');

    if (!issueDialog.showModal) {
        dialogPolyfill.registerDialog(issueDialog);
    }
    showIssueDialogButton.addEventListener('click', function () {
        issueV.flagNew = true;
        issue_dialog_open();
    });
    issueDialog.querySelector('#issue-dialog-cancel').addEventListener('click', function () {
        issueV._clean();
        issue_dialog_close();
    });
    issueDialog.querySelector('#issue-dialog-remove').addEventListener('click', function () {
        issueV._remove();
    });
    issueDialog.querySelector('#issue-dialog-accept').addEventListener('click', function () {
        issueV._accept()
    });
    function issue_dialog_open() {
        if (issueDialog && taskV.current_task)
            issueDialog.showModal();
    }
    function issue_dialog_close() {
        if (issueDialog)
            issueDialog.close();
    }


    $( "#tab-project-sub-tasks-panel" ).click(function() {
        show_fab_issues_subtasks('show-sub-task-dialog')
    });

    $( "#tab-project-task-issues-panel" ).click(function() {
        show_fab_issues_subtasks('show-issue-dialog')
    });

    function show_fab_issues_subtasks(_show) {
        var _fab_buttons = ['show-sub-task-dialog', 'show-issue-dialog'];
        for (var f = 0 ; f<_fab_buttons.length; f++){
            if (_show == _fab_buttons[f]){
                $('#'+_fab_buttons[f]).show();
            }else{
                $('#'+_fab_buttons[f]).hide();
            }
        }
    }

    /// PROJECT TASK
    subTaskV = new Vue({
        delimiters: delimiters,
        el: '#project-sub-tasks-panel',
        data: {
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
            url: apiv1 + 'project/task/participated',
            flagNew: true,
            assigned_users: []
        },

        methods: {
            // if clicked tab subTasks or load page your self
            init: function (_task_id) {
                var _url = this.url+"?completed=False&by=project_task_id&project_task_id="+_task_id;
                this._callback(null, _url, 'GET', 'init');
                this.get_users();
            },

            _accept: function () {
                var _action = this.flagNew ? 'new' : 'edit';
                var _method = this.flagNew ? 'POST' : 'PUT';
                var _url = this.flagNew ? this.url : this.url + '/' + this.subTaskModel.id;

                var new_project_sub_task = {
                    name: this.subTaskModel.name,
                    project_task_id: taskV.current_task.id,
                    assigned_user_id: this.subTasks.assigned_user_id
                };
                if (this.subTaskModel.start_date_at.trim().length>9)
                    new_project_sub_task['start_date_at']=this.subTaskModel.start_date_at.trim();
                if (this.subTaskModel.due_date_at.trim().length>9)
                    new_project_sub_task['due_date_at']=this.subTaskModel.due_date_at.trim();
                if (this.subTaskModel.description.trim().length>3)
                    new_project_sub_task['description']=this.subTaskModel.description.trim();
                // console.log(new_project_sub_task);
                this._callback(new_project_sub_task, _url, _method, _action);
            },
            // clean model
            _clean: function () {
                this.subTaskModel.index = -1;
                this.subTaskModel.id = -1;
                this.subTaskModel.name = '';
                this.subTaskModel.start_date_at = '';
                this.subTaskModel.due_date_at = '';
                this.subTaskModel.description= '';
                this.subTaskModel.task_id= -1;
                this.subTaskModel.user_assigned_id = -1;
            },

            _done: function (data, index) {
                var _values = {'completed_at': getDateUtc(new Date(), 'datetime')};
                this.subTaskModel.index = index;
                this._callback(_values, this.url + '/' + data.id, 'PUT', 'done');
            },

            _edit: function (data, index) {
                this.flagNew = false;
                this.subTaskModel.index = index;
                this.subTaskModel.id = data.id;
                this.subTaskModel.name = data.name;
                this.subTaskModel.start_date_at = data.start_date_at? data.start_date_at: '';
                this.subTaskModel.due_date_at = data.due_date_at? data.due_date_at: '';
                this.subTaskModel.description= data.description? data.description: '';
                this.subTaskModel.assigned_user_id = data.assigned_user_id;
                subTask_dialog_open();
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
                    console.log(response);
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
                                subTask_dialog_close();
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
                                    self.assigned_users.push(response.data.users[c])
                                }
                                break;
                        }
                        if (response.message)
                            notify({message: response.message});
                        self._clean();
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

            _remove: function () {
                this._callback(null, this.url + '/' + this.subTaskModel.id, 'DELETE', 'remove');
            },
            _view_sub_task_or_issues : function(data, index){
                // thi
                // this._panel_show_hide('hide');
            },
            _panel_show_hide:function(_action){
                if (_action == 'hide'){
                    $("#project-sub-tasks-issues-panel").hide();
                    //     $("#project-sub-tasks-panel").hide();
                    $("#show-sub-task-dialog").hide();
                    $("#show-issue-dialog").hide();
                    $("#from-sub-task-back-task").hide();
                }else {
                    $("#project-sub-tasks-issues-panel").show();
                //     $("#project-sub-tasks-panel").show();
                    $("#show-sub-task-dialog").show();
                    // $("#show-issue-dialog").show();
                    $("#from-sub-task-back-task").show();
                }
            },
            _back_task: function () {
                this._panel_show_hide('hide');
                this.subTasks = [];
                // hiden  issues
                issueV.issues = [];
                issueV._panel_show_hide('hide');

                taskV.tasks = [];
                taskV.init(projectV.current_project.id);
                taskV._panel_show_hide('show');

            },

            get_users: function () {
                this.subTaskModel.assigned_user_id = -1;
                this.assigned_users = [];
                var _url = apiv1 +
                    "user?get=team&by=project_task_id&project_task_id="+taskV.current_task.id;
                this._callback(null, _url, 'GET','users');
            },
            get_assigned_user: function (user_id) {
                var _name = '';
                for (var i =0 ; i<this.assigned_users.length;i++){
                    if (user_id == this.assigned_users[i].id){
                        _name = this.assigned_users[i].name;
                        break;
                    }
                }
                return _name;
            }

        }, // end methods

        computed: {
            validationSubTaskModel: function () {
                return {
                    accept: this.subTaskModel.name.trim().length > 3,
                    remove: !this.flagNew
                }
            },
            task_name: function () {
                var _title = '';
                if (taskV!= null)
                    if(taskV.current_task!= null)
                        _title = taskV.current_task.name;
                return _title
            }
        },

        watch: {
            'subTaskModel.assigned_user_id': function(val) {
                this.subTasks.assigned_user_id = val;
            }
        }
    });

    subTaskV._panel_show_hide('hide');
    // subTaskV.init();

    subTaskDialog = document.querySelector('#sub-task-dialog');
    showSubTaskDialogButton = document.querySelector('#show-sub-task-dialog');

    if (!subTaskDialog.showModal) {
        dialogPolyfill.registerDialog(subTaskDialog);
    }
    showSubTaskDialogButton.addEventListener('click', function () {
        subTask_dialog_open();
        subTaskV.flagNew = true;
    });
    subTaskDialog.querySelector('#sub-task-dialog-cancel').addEventListener('click', function () {
        subTaskV._clean();
        subTask_dialog_close();
    });
    subTaskDialog.querySelector('#sub-task-dialog-remove').addEventListener('click', function () {
        subTaskV._remove();
    });
    subTaskDialog.querySelector('#sub-task-dialog-accept').addEventListener('click', function () {
        subTaskV._accept()
    });
    function subTask_dialog_open() {
        if (subTaskDialog && taskV.current_task)
            subTaskDialog.showModal();
    }
    function subTask_dialog_close() {
        if (subTaskDialog)
            subTaskDialog.close();
    }
    $('#from-sub-task-back-task').click(function () {
        subTaskV._back_task();
    });












    /// PROJECT TASK
    taskV = new Vue({
        delimiters: delimiters,
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
            url: apiv1 + 'project/task',
            flagNew: true,
            current_task: null
        },

        methods: {
            // if clicked tab tasks or load page your self
            init: function (_project_id) {
                var _url = this.url+"?by=project_id&project_id="+_project_id+"&completed=False";
                this._callback(null, _url, 'GET', 'init');
            },

            _accept: function () {
                var _action = this.flagNew ? 'new' : 'edit';
                var _method = this.flagNew ? 'POST' : 'PUT';
                var _url = this.flagNew ? this.url : this.url + '/' + this.taskModel.id;

                var new_project_task = {
                    name: this.taskModel.name,
                    project_id: projectV.current_project.id

                };
                if (this.taskModel.start_date_at.trim().length>9)
                    new_project_task['start_date_at']=this.taskModel.start_date_at.trim();
                if (this.taskModel.due_date_at.trim().length>9)
                    new_project_task['due_date_at']=this.taskModel.due_date_at.trim();
                if (this.taskModel.description.trim().length>3)
                    new_project_task['description']=this.taskModel.description.trim();
                this._callback(new_project_task, _url, _method, _action);
            },
            // clean model
            _clean: function () {
                this.taskModel.index = -1;
                this.taskModel.id = -1;
                this.taskModel.name = '';
                this.taskModel.start_date_at = '';
                this.taskModel.due_date_at = '';
                this.taskModel.description= '';
                this.taskModel.project_id= -1;
            },

            _done: function (data, index) {
                var _values = {'completed_at': getDateUtc(new Date(), 'datetime')};
                this.taskModel.index = index;
                this._callback(_values, this.url + '/' + data.id, 'PUT', 'done');
            },

            _edit: function (data, index) {
                this.flagNew = false;
                this.taskModel.index = index;
                this.taskModel.id = data.id;
                this.taskModel.name = data.name;
                this.taskModel.start_date_at = data.start_date_at? data.start_date_at: '';
                this.taskModel.due_date_at = data.due_date_at? data.due_date_at: '';
                this.taskModel.description= data.description? data.description: '';
                task_dialog_open();
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
                                task_dialog_close();
                                break;
                            case 'new':
                                _data['id'] = response.data.project_tasks[0].id;
                                self.tasks.push(_data);
                                task_dialog_close();
                                break;
                            case 'edit':
                                _data['id'] = self.taskModel.id;
                                // _data['created_at'] = self.taskModel.created_at;
                                // _data['due_date_at'] = self.taskModel.due_date_at;
                                self.tasks.splice(self.taskModel.index, 1, _data);
                                task_dialog_close();
                                break
                        }
                        if (response.message)
                            notify({message: response.message});
                        self._clean();
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

            _remove: function () {
                this._callback(null, this.url + '/' + this.taskModel.id, 'DELETE', 'remove');
            },
            _view_sub_task_issues : function(data, index){
                this._panel_show_hide('hide');
                this.current_task= data;
                this._panel_show_hide('hide');
                this.tasks = [];
                subTaskV.init(this.current_task.id);
                subTaskV._panel_show_hide('show');
                issueV.init(this.current_task.id);
                issueV._panel_show_hide('show');
                $('#task-title').text(data.name);
            },
            _panel_show_hide:function(_action){
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
            _back_project: function () {
                this._panel_show_hide('hide');
                this.tasks = [];
                projectV.init();
                projectV._panel_show_hide('show');
            }

        }, // end methods

        computed: {
            validationTaskModel: function () {
                return {
                    accept: this.taskModel.name.trim().length > 3,
                    remove: !this.flagNew
                }
            },
            project_name: function () {
                var _title = '';
                if (projectV!= null)
                    if(projectV.current_project!= null)
                        _title = projectV.current_project.name;
                return _title
            }
        }

    });

    taskV._panel_show_hide('hide');
    // taskV.init();

    taskDialog = document.querySelector('#task-dialog');
    showTaskDialogButton = document.querySelector('#show-task-dialog');

    if (!taskDialog.showModal) {
        dialogPolyfill.registerDialog(taskDialog);
    }
    showTaskDialogButton.addEventListener('click', function () {
        task_dialog_open();
        taskV.flagNew = true;
    });
    taskDialog.querySelector('#task-dialog-cancel').addEventListener('click', function () {
        taskV._clean();
        task_dialog_close();
    });
    taskDialog.querySelector('#task-dialog-remove').addEventListener('click', function () {
        taskV._remove();
    });
    taskDialog.querySelector('#task-dialog-accept').addEventListener('click', function () {
        taskV._accept()
    });
    function task_dialog_open() {
        if (taskDialog && projectV.current_project)
            taskDialog.showModal();
    }
    function task_dialog_close() {
        if (taskDialog)
            taskDialog.close();
    }

    $('#from-task-back-project').click(function () {
       taskV._back_project();
    });


    // PROJECT CONTROLLER //

    projectV = new Vue({
        delimiters: delimiters,
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
            url: apiv1 + 'project',
            flagNew: true,
            current_project:null
        },

        methods: {
            // if clicked tab projects or load page your self
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
            // clean model
            _clean: function () {
                this.projectModel.name = '';
                // this.projectModel.due_date_at = '';
                this.projectModel.index = -1;
                this.projectModel.id = -1;
            },

            _done: function (data, index) {
                var _values = {'completed_at': getDateUtc(new Date(), 'datetime')};
                this.projectModel.index = index;
                this._callback(_values, this.url + '/' + data.id, 'PUT', 'done');
            },

            _edit: function (data, index) {
                this.flagNew = false;
                this.projectModel.name = data.name;
                // this.projectModel.due_date_at = data.due_date_at ? data.due_date_at : '';
                // this.projectModel.completed_at = data.completed_at;
                // this.projectModel.created_at = data.created_at;
                this.projectModel.id = data.id;
                this.projectModel.index = index;
                project_dialog_open();
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
                                project_dialog_close();
                                break;
                            case 'new':
                                _data['id'] = response.data.projects[0].id;
                                // _data['created_at'] = new Date().toJSON().slice(0, 10).replace(/-/g, '/');
                                self.projects.push(_data);
                                project_dialog_close();
                                break;
                            case 'edit':
                                _data['id'] = self.projectModel.id;
                                // _data['created_at'] = self.projectModel.created_at;
                                // _data['due_date_at'] = self.projectModel.due_date_at;
                                self.projects.splice(self.projectModel.index, 1, _data);
                                project_dialog_close();
                                break
                        }
                        if (response.message)
                            notify({message: response.message});
                        self._clean();
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

            _remove: function () {
                this._callback(null, this.url + '/' + this.projectModel.id, 'DELETE', 'remove');
            },
            _view_task : function(data, index){
                this.current_project = data;
                this._panel_show_hide('hide');
                this.projects = [];
                taskV.init(this.current_project.id);
                taskV._panel_show_hide('show');
            },
            _panel_show_hide:function(_action){
                if (_action == 'hide'){
                    $("#projects-panel").hide();
                    $("#show-projects-dialog").hide();
                }else {
                    $("#projects-panel").show();
                    $("#show-projects-dialog").show();
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
    projectV._panel_show_hide('show');

    projectDialog = document.querySelector('#project-dialog');
    showProjectDialogButton = document.querySelector('#show-project-dialog');

    if (!projectDialog.showModal) {
        dialogPolyfill.registerDialog(projectDialog);
    }
    showProjectDialogButton.addEventListener('click', function () {
        project_dialog_open();
        projectV.flagNew = true;
    });
    projectDialog.querySelector('#project-dialog-cancel').addEventListener('click', function () {
        projectV._clean();
        project_dialog_close();
    });
    projectDialog.querySelector('#project-dialog-remove').addEventListener('click', function () {
        projectV._remove();
    });
    projectDialog.querySelector('#project-dialog-accept').addEventListener('click', function () {
        projectV._accept()
    });
    function project_dialog_open() {
        if (projectDialog)
            projectDialog.showModal();
    }
    function project_dialog_close() {
        if (projectDialog)
            projectDialog.close();
    }

});