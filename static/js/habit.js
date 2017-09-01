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
            flagNew: true
        },

        methods: {
            // if clicked tab habits or load page your self
            init: function () {
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

            },

            _setFirstHabit: function () {
                if (this.habits.length>0){
                    for (var c = 0; c < this.habits.length; c++) {
                        if (c === 0) {
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
                            self._setFirstHabit();
                            break;
                        case 'done':
                            self.habits.splice(self.habitCurrent.index, 1);
                            break;
                        case 'remove':
                            self.habits.splice(self.habitCurrent.index, 1);
                            libzr.findModal('habit-dialog', 'close');
                            self._setFirstHabit();
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
                            self.habits.splice(self.habitCurrent.index, 1, self.habitModel);
                            libzr.findModal('habit-dialog', 'close');
                            self._clean({by:'habit-model'});
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
            }
        }, // end methods

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