window.addEventListener('load', function ()
{

    var apiv1 = '/api/v1/';
    var delimiters = ['${', '}'];
    var timerRE = /-?([01]?[0-9]|2[0-3]):([0-5][0-9])|([0-5][0-9])?/;
    document.querySelector('#progress-pomodoro-timer').addEventListener('mdl-componentupgraded', function() {
        this.MaterialProgress.setProgress(80);
        this.MaterialProgress.setBuffer(90);
    });

    var Pomodoro = new Vue({
        delimiters: delimiters,
        el: '#pomodoro-content',
        data: {
            url: apiv1 + 'pomodoro',
            activities: [],
            timer: {
                hour:0,
                minute:0,
                second:0
            },
            activity: {
                name: '',
                timer: ''
            },
            current_activity: {
                index: -1,
                id: -1,
                name: null,
                // icon:'turned_in_not',
                timer: {
                    hour:0,
                    minute:0,
                    second:0
                }
            },
            interval : null,
            is_pause: false
        },

        methods: {

            init: function () {

            },

            add:function () {
                var _timer_tmp = this.activity.timer.split(':');
                var _timer  = '00:25:00';
                var _data = [];
                _data['name'] = this.activity.name;
                if (_timer_tmp.length ==1) {
                    _timer = '00:'+_timer_tmp[0]+":00";
                }else if (_timer_tmp.length ==2){
                    _timer = this.activity.timer+":00";
                }
                _data['timer'] = _timer;
                var _action = 'new';
                var _method = 'POST';
                this._callback(_data, this.url, _method, _action);
            },
            // clean model
            _clean: function (clean) {
                for (var t =0; t<clean.length; t ++){
                    switch(clean[t] ) {
                        case 'activity':
                            this.activity.name = '';
                            this.activity.timer = '';
                            break;
                        case 'timer':
                            this.timer.hour = 0;
                            this.timer.minute = 0;
                            this.timer.second = 0;
                            break;
                        case 'current_activity':
                            this.current_activity.index = -1;
                            this.current_activity.id = -1;
                            this.current_activity.name = null;
                            this.current_activity.hour = 0;
                            this.current_activity.minute = 0;
                            this.current_activity.second = 0;
                            break;

                    }
                }

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

            },

            remove: function (acivity, index) {
                var _data = [];
                _data ['index'] = index;
                this._callback(_data, this.url + '/' + acivity.id, 'DELETE', 'remove');
            },

            _callback: function (_data, _url, _method, _action) {
                var self = this;
                var _json = null;
                if (_data)
                    _json = JSON.stringify(_data);
                // $.ajax({
                //     url: _url,
                //     type: _method,
                //     data: _json,
                //     contentType: 'application/json'
                // }).done(function (response) {
                //     console.log(response);
                //     if (response.status_code == 200 || response.status_code == 201) {
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
                                self.activities.splice(_data['index'], 1);
                                break;
                            case 'new':
                                _data['id'] =12;//response.data.project_task_issues[0].id;
                                self.activities.push(_data);
                                this._clean(['activity']);
                                break;

                        }
                //         if (response.message)
                //             notify({message: response.message});
                //         self._clean();
                //         return true;
                //     } else {
                //         notify({message: response.message});
                //         return false;
                //     }
                // }).fail(function () {
                //     notify({message: 'Error al generar la peticion, favor interntar mas tarde! :('});
                //     return false;
                // });
            },

        //    Timer
            start: function (activity, index) {
                var self = this;
                if (self.timer.hour == 0  && self.timer.minute == 0 && self.timer.second == 0 ){
                    var _timer_tmp = activity.timer.split(':');
                    if(_timer_tmp.length==3){

                        self.timer.hour = self.getZero(parseInt(_timer_tmp[0]));
                        self.timer.minute = self.getZero(parseInt(_timer_tmp[1]));
                        self.timer.second = 59;
                        // Notify desktop

                        self.notify(activity.name, {'body':activity.timer});

                        this.interval = setInterval(function () {
                            if (!self.is_pause){
                                self.timer.second = self.getZero(self.timer.second);
                                if (self.timer.second == 0){
                                    self.timer.second = self.timer.minute -1 < 0 ? 0 : 59;
                                    self.timer.minute = self.getZero(self.timer.minute);
                                }
                                if (self.timer.minute == 0){
                                    self.timer.minute = self.timer.hour -1 < 0 ? 0 : 59;
                                    self.timer.hour = self.getZero(self.timer.hour);
                                }

                                if (self.timer.hour == 0 &&  self.timer.minute == 0 && self.timer.second == 0){
                                    // Notify desktop
                                    self.notify(activity.name, {'body': '00:00:00'});
                                    self.stop(activity, index);
                                }else{
                                    var _total =  (self.timer.hour * 59) +
                                        self.current_activity.timer.minute;
                                    var _current =  (self.timer.hour * 59) +
                                        self.timer.minute;
                                    var progress = _current * 100 / _total;
                                    var buffer = self.timer.second * 100 / 59;
                                    // self.progress(progress, buffer);
                                }
                            }
                        },1000)
                    }
                }
            },
            getZero: function (value) {
                return ( value - 1 < 0 ? 0: value -1);
            },
            stop:function (activity, index) {
                clearInterval(this.interval);
                this._clean(['timer'])
            },

            pause: function (acivity, index) {
              this.is_pause = !this.is_pause;
            },
            progress: function (_progress, _buffer) {
                // 30 = 100%
                console.log(_progress, _buffer);
                document.querySelector('#progress-pomodoro-timer').
                addEventListener('mdl-componentupgraded', function() {
                    this.MaterialProgress.setProgress(80);
                    this.MaterialProgress.setBuffer(90);
                });
            },

            notify: function (name, params) {
                if (("Notification" in window)) {
                    // Let's check if the user is okay to get some notification
                    if (Notification.permission !== 'denied') {
                        Notification.requestPermission(function (permission) {
                            // Whatever the user answers, we make sure we store the information
                            if(!('permission' in Notification)) {
                                Notification.permission = permission;
                            }
                            // If the user is okay, let's create a notification
                            if (permission === "granted") {
                                params['icon'] = '/images/logo.png';
                                var notification = new Notification(name, params);
                            }
                        });
                    }
                }else{
                    console.log("This browser does not support desktop notification");
                }
            }
        }, // end methods

        computed: {
            validationActivityModel: function () {
                return {
                    add: true//this.activity.name.trim().length > 3 && timerRE.test(this.activity.timer)
                    // remove: !this.flagNew
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
            // 'issueModel.assigned_user_id': function(val) {
            //     this.issues.assigned_user_id = val;
            // },
        }
    });
});