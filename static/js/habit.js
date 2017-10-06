window.addEventListener('load', function () {
    /// HABIT ///
    var habitDialog = null;
    var habits_panelV = new Vue({
        delimiters: libzr.getDelimiterVue(),
        el: '#habits-panel',
        data: {
            habits: [],
            habitName:'',
            habitModel: {
                index: -1,
                id: -1,
                name: '',
                fail: -1,
                success: -1,
                status: ''
            },
            habitCurrent: {
                index: -1,
                id: -1,
                name: '',
                fail: -1,
                success: -1,
                status: ''
            },
            url: libzr.getApi() + 'habit',
            flagNew: true,
        //    Habit update
            reminder:{
                id: -1,
                by:'daily',
                every: 0,
                everyMsg:'',
                push_notify:false,
                email_notify:true,
                due_date : '',
                time_notify:'',
                date_notify:'',
                weekDays:[]
            },
            url_reminder: libzr.getApi() + 'reminder'

        },

        methods: {
            // if clicked tab habits or load page your self
            init: function () {
                document.querySelector("#menu-habits").style.borderBottom = "4px solid #000";
                var _date = new Date().format('yyyy-MM-dd');
                var _url = this.url + '?view=current_task&date=' + _date;
                this._callback(null, _url, 'GET', 'init');
            },

            quickAdd: function () {
                if (this.validation.quickAdd) {
                    this._callback({name: this.habitName},this.url,'POST','new');
                } else {
                    notify({message: "El habito debe tener mínimo 4 letras."});
                }
            },

            show: function (data, index) {
                this.habitCurrent = data;
                this.habitCurrent.index = index;
            },

            save: function () {
                if (this.validation.save) {
                    this._callback({name:this.habitModel.name}, this.url + '/' + this.habitCurrent.id, 'PUT', 'edit');
                }else {
                    notify({message: "El habito debe tener mínimo 4 letras."});
                }
            },

            done: function () {
                this._callback({'habit_id': this.habitCurrent.id,'state': 'success'},this.url + '/history','POST','done');
            },

            openAndEditDialog: function () {
                this.habitModel = JSON.parse(JSON.stringify(this.habitCurrent));
                libzr.findModal('habit-dialog', 'show');
            },
            cancelAndCloseDialog: function () {
                libzr.findModal('habit-dialog', 'close');
            },

            //  Private methods
            _clean: function (data = {by:'all'}) {

                if (data.by==='habit-name' || data.by==='all'){
                    this.habitName='';
                }
                if (data.by==='habit-model' || data.by==='all'){
                    this.habitModel.name = '';
                    this.habitModel.index = -1;
                    this.habitModel.id = -1;
                    this.habitModel.fail = 0;
                    this.habitModel.success = 0;
                    this.habitModel.status = '';
                }
                if(data.by==='reminder-model' || data.by==='all'){
                    this.reminder.id = -1;
                    this.reminder.by = 'daily';
                    this.reminder.every = 0;
                    this.reminder.due_date= '';
                    this.reminder.time_notify = '';
                    this.push_notify=false;
                    this.email_notify=false;
                }

            },

            _setCurrentHabit: function (index = -1) {
                if (this.habits.length>0){
                    for (var c = 0; c < this.habits.length; c++) {
                        if (c === 0 && index === -1) {
                            this.show(this.habits[c], c);
                            break;
                        }else if ( c === index) {
                            this.show(this.habits[c], c);
                            break;
                        }
                    }
                }else{
                    this.habitCurrent.index = -1;
                }

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
                }).done(function (data) {
                    switch (_action) {
                        case 'init':
                            for (var c = 0; c < data.length; c++) {
                                self.habits.push(data[c]);
                            }
                            self._setCurrentHabit();
                            break;
                        case 'done':
                            self.habits.splice(self.habitCurrent.index, 1);
                            self._setCurrentHabit();
                            break;
                        case 'remove':
                            self.habits.splice(self.habitCurrent.index, 1);
                            libzr.findModal('habit-dialog', 'close');
                            self._setCurrentHabit();
                            break;
                        case 'new':
                            _data['id'] = data[0].id;
                            _data['success'] = 0;
                            _data['fail'] = 0;
                            _data['status'] = '';
                            self.habits.push(_data);
                            self._clean({by:'habit-name'});
                            break;
                        case 'edit':
                            self.habits.splice(self.habitCurrent.index, 1,  JSON.parse(JSON.stringify(self.habitModel)));
                            libzr.findModal('habit-dialog', 'close');
                            self._clean({by:'habit-model'});
                            self._setCurrentHabit(self.habitCurrent.index);
                            break
                    }
                    return true;
                }).fail(function () {
                    notify({message: 'Error al generar la peticion, favor interntar mas tarde! :('});
                    return false;
                });
            },

            remove: function () {
                this._callback(null, this.url + '/' + this.habitCurrent.id, 'DELETE', 'remove');
            },
            _icon_done: function (_success, _fail) {
                var _total_days = _success + _fail;
                var _total_percent = _total_days > 0 ? (_success * 100) / _total_days : 0;
                var _status = 'sentiment_very_satisfied';
                if (_total_percent > 41 && _total_percent < 59 && _total_days != 0) {
                    _status = 'sentiment_neutral';
                } else if (_total_percent < 40 && _total_days != 0) {
                    _status = 'sentiment_very_dissatisfied';
                }
                return _status;
            },
            habitBackground: function (habit, index) {
                return "mdl-card mdl-shadow--2dp zr-habit-background-1";//+ libzr.getRandom(1,4);
            },
        //    Habit update
            openAndEditDialogRemember: function () {
                this.habitModel = JSON.parse(JSON.stringify(this.habitCurrent));
                libzr.findModal('habit-remember', 'show');
                var _url = this.url_reminder + '?resource=habit&resource_id=' + this.habitModel.id;
                this._call_api_reminder(null, _url,'GET','init');
            },

            cancelAndCloseDialogRemember: function () {
                libzr.findModal('habit-remember', 'close');
            },
            saveDialogRemember: function () {
                try{
                     var data = {
                        by: this.reminder.by,
                        every: this.reminder.every,
                        due_date: this.reminder.due_date,
                        time_notify: this.reminder.time_notify,
                        email_notify: this.reminder.email_notify
                    };
                    if (this.reminder.by === 'weekly') {
                        if (this.reminder.weekDays.length>0)
                            data['params'] = {week_days: this.reminder.weekDays};
                        else
                            throw "Is necessary select one day.";
                    }
                    console.log(data)
                    this._call_api_reminder(data, this.url_reminder+'/'+this.reminder.id, 'PUT', 'edit')
                }catch (err){

                }

            },
            onChangeReminder: function () {
                if (this.reminder.by == 'daily'){
                    this.reminder.everyMsg =  'day'+ ( this.reminder.every == 1 ?'':'s')
                }else if (this.reminder.by == 'weekly'){
                    this.reminder.everyMsg =  'week'+ ( this.reminder.every == 1 ?'':'s')
                }
            },

            _call_api_reminder: function (_data, _url, _method, _action) {
                var self = this;
                var _json = null;
                if (_data)
                    _json = JSON.stringify(_data);
                $.ajax({
                    url: _url,
                    type: _method,
                    data: _json,
                    contentType: 'application/json'
                }).done(function (data) {
                    if ( data.status_code === 200 || data.status_code === 201){
                        console.log(data);
                        switch (_action) {
                            case 'init':
                                var rpsReminder =data.data.reminder;
                                for (var c = 0; c < rpsReminder.length; c++) {
                                    var _reminder = rpsReminder[c];
                                    var _data = new Date(_reminder.due_date);
                                    self.reminder.id = _reminder.id;
                                    self.reminder.by = _reminder.by;
                                    self.reminder.every = _reminder.every;
                                    self.reminder.due_date= _data.toISOString().substr(0,10);
                                    self.reminder.time_notify = _reminder.time_notify;
                                    if (self.reminder.by === 'weekly' ){
                                        self.reminder.weekDays = _reminder.params.week_days
                                    }
                                   // self.reminder.date_notify = _reminder.date_notify;
                                }
                                console.log(self.reminder.weekDays, self.reminder.by);
                                self.onChangeReminder();
                                break;
                            case 'edit':
                                self._clean({by:'reminder-model'});
                                self.cancelAndCloseDialogRemember();
                                break
                        }
                    }else{
                        notify({message:data.message});
                    }
                    return true;
                }).fail(function () {
                    notify({message: 'Error al generar la peticion, favor interntar mas tarde! :('});
                    return false;
                });
            }

        }, // end methods
        //http://localhost:8080/api/v1/habit?view=current_task&date=2017-10-02
        //http://localhost:8080/api/v1/reminder?id=1
        computed: {
            validationHabitModel: function () {
                return {
                    accept: this.habitModel.name.trim().length > 3,
                    remove: !this.flagNew
                }
            },
            validation: function () {
                return{
                    quickAdd: this.habitName.trim().length>3,
                    save: this.habitCurrent.name.trim().length>3
                }
            }
        }

    });

    habits_panelV.init();
});