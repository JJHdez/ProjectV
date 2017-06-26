window.addEventListener('load', function ()
{
        /// HABIT ///
    var habitDialog = null;
    var habits_panelV = new Vue({
        delimiters: libzr.getDelimiterVue(),
        el: '#habits-panel',
        data:{
            habits: [],
            habitModel:{
                index:-1,
                id:-1,
                name: '',
                fail: -1,
                success: -1,
                status: ''
            },
            url: libzr.getApi()+'habit',
            flagNew:true
        },

        methods:{
            // if clicked tab habits or load page your self
            init: function () {
                var _date = new Date().format('yyyy-MM-dd');
                var _url = this.url + '?view=current_task&date='+_date;
                this._callback(null, _url,'GET', 'init');
            },
            add : function () {
                this.flagNew = true;
                this._accept();
            },
            _accept :function() {
                var  _action = this.flagNew?'new':'edit';
                var  _method = this.flagNew?'POST':'PUT';
                var  _url = this.flagNew?this.url:this.url+'/'+this.habitModel.id;
                var new_dream = {
                    name: this.habitModel.name
                };
                this._callback(new_dream,_url,_method,_action);
            },
            // clean model
            _clean: function(){
                this.habitModel.name = '';
                this.habitModel.index = -1;
                this.habitModel.id = -1;
                this.habitModel.fail = 0;
                this.habitModel.success = 0;
                this.habitModel.status = '';
            },

            _done: function(data, index){
                // this.habitModel.name = data.name;
                this.habitModel.id = data.id;
                // this.habitModel.fail = data.fail;
                // this.habitModel.success = data.success;
                // this.habitModel.status = data.status;
                this.habitModel.index = index;
                var _values = {'habit_id': this.habitModel.id, 'state':'success'};
                this.habitModel.index = index;
                this._callback(_values, this.url+'/history', 'POST','done');
            },

            _edit: function(data, index){
                this.flagNew = false;
                this.habitModel.name = data.name;
                this.habitModel.id = data.id;
                this.habitModel.fail = data.fail;
                this.habitModel.success = data.success;
                this.habitModel.status = data.status;
                this.habitModel.index = index;
                habit_dialog_open();
            },

            _callback: function(_data, _url, _method, _action){
                var self = this;
                var _json = null;
                if (_data)
                    _json = JSON.stringify(_data);
                $.ajax({
                    url: _url,
                    type:_method,
                    data:_json,
                    contentType:'application/json'
                }).done(function( data ) {
                    var message = null;
                    switch (_action){
                        case 'init':
                            for (var c = 0 ; c < data.length; c++){
                                self.habits.push(data[c])
                            }
                            break;
                        case 'done':
                            self.habits.splice(self.habitModel.index,1);
                            message = 'Fue completado correctamente!';
                            break;
                        case 'remove':
                            self.habits.splice(self.habitModel.index,1);
                            message = 'Fue elimando correctamente!';
                            habit_dialog_close();
                            break;
                        case 'new':
                            _data['id']=data[0].id;
                            _data['success']=0;
                            _data['fail']=0;
                            _data['status']='';
                            self.habits.push(_data);
                            message = 'Fue agregado correctamente!';
                            // habit_dialog_close();
                            break;
                        case 'edit':
                            _data['id']=self.habitModel.id;
                            _data['success']=self.habitModel.success;
                            _data['fail']=self.habitModel.fail;
                            _data['status']=self.habitModel.status;
                            self.habits.splice(self.habitModel.index,1,_data);
                            message = 'Fue actualizado correctamente!';
                            habit_dialog_close();
                            break
                    }
                    if (message)
                        notify({message: message});
                    self._clean();
                    return true;
                }).fail(function() {
                    notify({message:'Error al generar la peticion, favor interntar mas tarde! :('});
                    return false;
                });
            },

            _remove : function () {
                this._callback(null, this.url+'/'+this.habitModel.id, 'DELETE','remove');
            },
            _icon_done: function (_success, _fail) {
                var _total_days = _success + _fail;
                var _total_percent = _total_days>0? (_success*100)/_total_days:0;
                var _status = 'sentiment_very_satisfied';
                if(_total_percent>41 && _total_percent<59 && _total_days!=0){
                    _status = 'sentiment_neutral';
                }else if(_total_percent<40 && _total_days!=0){
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
                    accept: this.habitModel.name.trim().length>3,
                    remove: !this.flagNew
                }
            }
        }

    });

    habits_panelV.init();

    habitDialog = document.querySelector('#habit-dialog');
    // showHabitDialogButton = document.querySelector('#show-habit-dialog');

    if (! habitDialog.showModal) {
        dialogPolyfill.registerDialog(habitDialog);
    }
    // showHabitDialogButton.addEventListener('click', function() {
    //     habit_dialog_open();
    //     habits_panelV.flagNew = true;
    // });
    habitDialog.querySelector('#habit-dialog-cancel').addEventListener('click', function() {
        habits_panelV._clean();
        habit_dialog_close();
    });
    habitDialog.querySelector('#habit-dialog-remove').addEventListener('click', function() {
        habits_panelV._remove();
    });
    habitDialog.querySelector('#habit-dialog-accept').addEventListener('click', function() {
        habits_panelV._accept()
    });
    function habit_dialog_open() {
        if(habitDialog)
            habitDialog.showModal();
    }
    function habit_dialog_close() {
        if(habitDialog)
            habitDialog.close();
    }
});