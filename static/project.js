window.addEventListener('load', function () {
    var apiv1 = '/api/v1/';
    var delimiters = ['${', '}'];

    var projectV = taskV= null;
    // Project controller
    var projectDialog = null;
    var showProjectDialogButton = null;

    // Project task controller
    var taskDialog = null;
    var showTaskDialogButton = null;

    /// PROJECT TASK
    var taskV = new Vue({
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
            flagNew: true
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
                if (this.taskModel.description.trim().length>9)
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
                    console.log('Task');
                    console.log(response);
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
            _view_task : function(data, index){
                this._panel_show_hide('hide');
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
                console.log('PIXMAN');
                if (projectV!= null)
                    if(projectV.current_project!= null)
                        _title = projectV.current_project.name;
                console.log(_title);
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
    // v-on:click="_back_project()"
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