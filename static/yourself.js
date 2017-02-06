window.addEventListener('load', function () {

    var apiv1 = '/api/v1/';
    var delimiters = ['${', '}'];

    function getDateUtc(_date, _format){
        var now_utc =  new Date(
            _date.getUTCFullYear(),
            _date.getUTCMonth(),
            _date.getUTCDate(),
            _date.getUTCHours(),
            _date.getUTCMinutes(),
            _date.getUTCSeconds()
        );
        var datetime_utc =  now_utc.getFullYear()+'-'+
            now_utc.getMonth()+'-'+
            now_utc.getDate();
        if (_format == 'datetime'){
            datetime_utc= datetime_utc+' '+
                now_utc.getHours()+':'+
                now_utc.getMinutes()+':'+
                now_utc.getSeconds();
        }
        return datetime_utc;
    }

    /// DREAM ////
    var dreamDialog = null;
    var showDreamDialogButton = null;
    var dreams_panelV = new Vue({
        delimiters: delimiters,
        el: '#dreams-panel',
        data:{
            dreams: [],
            dreamModel:{
                id:-1,
                name: '',
                due_date_at:'',
                completed_at:'',
                created_at:'',
                index:-1
            },
            url: apiv1+'dream',
            flagNew:true
        },

        methods:{
            // if clicked tab dreams or load page your self
            init: function () {
                this._callback(null, this.url,'GET', 'init');
            },

            _accept :function() {
                var  _action = this.flagNew?'new':'edit';
                var  _method = this.flagNew?'POST':'PUT';
                var  _url = this.flagNew?this.url:this.url+'/'+this.dreamModel.id;
                var new_dream = {
                    name: this.dreamModel.name
                };
                if (this.dreamModel.due_date_at.length>0){
                    // if (!ULV.dateRE.test(this.dreamModel.due_date_at))
                    new_dream['due_date_at']= this.dreamModel.due_date_at;
                }
                this._callback(new_dream,_url,_method,_action);
            },
            // clean model
            _clean: function(){
                this.dreamModel.name = '';
                this.dreamModel.due_date_at= '';
                this.dreamModel.index = -1;
                this.dreamModel.id = -1;
            },

            _done: function(data, index){
                var _values = {'completed_at': getDateUtc(new Date(),'datetime')};
                this.dreamModel.index = index;
                this._callback(_values, this.url+'/'+data.id, 'PUT','done');
            },

            _edit: function(data, index){
                this.flagNew = false;
                this.dreamModel.name = data.name;
                this.dreamModel.due_date_at = data.due_date_at? data.due_date_at:'';
                this.dreamModel.completed_at = data.completed_at;
                this.dreamModel.created_at = data.created_at;
                this.dreamModel.id = data.id;
                this.dreamModel.index = index;
                dream_dialog_open();
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
                }).done(function( response ) {
                    if (response.status_code==200 || response.status_code == 201){
                        switch (_action){
                            case 'init':
                                for (var c = 0 ; c < response.data.dreams.length; c++){
                                    self.dreams.push(response.data.dreams[c])
                                }
                                break;
                            case 'done':
                                self.dreams.splice(self.dreamModel.index,1);
                                break;
                            case 'remove':
                                self.dreams.splice(self.dreamModel.index,1);
                                dream_dialog_close();
                                break;
                            case 'new':
                                _data['id']=response.data.dreams[0].id;
                                _data['created_at'] = new Date().toJSON().slice(0,10).replace(/-/g,'/');
                                self.dreams.push(_data);
                                dream_dialog_close();
                                break;
                            case 'edit':
                                _data['id']=self.dreamModel.id;
                                _data['created_at'] = self.dreamModel.created_at;
                                _data['due_date_at'] = self.dreamModel.due_date_at;
                                self.dreams.splice(self.dreamModel.index,1,_data);
                                dream_dialog_close();
                                break
                        }
                        if (response.message)
                            notify({message: response.message});
                        self._clean();
                        return true;
                    }else{
                        notify({message:response.message});
                        return false;
                    }
                }).fail(function() {
                    notify({message:'Error al generar la peticion, favor interntar mas tarde! :('});
                    return false;
                });
            },
            _remove : function () {
                this._callback(null, this.url+'/'+this.dreamModel.id, 'DELETE','remove');
            }
        }, // end methods

        computed: {
            validationDreamModel: function () {
            return {
                    accept: this.dreamModel.name.trim().length>3,
                    remove: !this.flagNew
                }
            }
        }

    });

    dreams_panelV.init();

    dreamDialog = document.querySelector('#dream-dialog');
    showDreamDialogButton = document.querySelector('#show-dream-dialog');

    if (! dreamDialog.showModal) {
        dialogPolyfill.registerDialog(dreamDialog);
    }
    showDreamDialogButton.addEventListener('click', function() {
        dream_dialog_open();
        dreams_panelV.flagNew = true;
    });
    dreamDialog.querySelector('#dream-dialog-cancel').addEventListener('click', function() {
        dreams_panelV._clean();
        dream_dialog_close();
    });
    dreamDialog.querySelector('#dream-dialog-remove').addEventListener('click', function() {
        dreams_panelV._remove();
    });
    dreamDialog.querySelector('#dream-dialog-accept').addEventListener('click', function() {
        dreams_panelV._accept()
    });
    function dream_dialog_open() {
        if(dreamDialog)
            dreamDialog.showModal();
    }
    function dream_dialog_close() {
        if(dreamDialog)
            dreamDialog.close();
    }


    /// HABIT ///
    var habitDialog = null;
    var showHabitDialogButton = null;
    var habits_panelV = new Vue({
        delimiters: delimiters,
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
            url: apiv1+'habit',
            flagNew:true
        },

        methods:{
            // if clicked tab habits or load page your self
            init: function () {
                var _date = new Date().format('yyyy-MM-dd');
                var _url = this.url + '?view=current_task&date='+_date;
                this._callback(null, _url,'GET', 'init');
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
                            habit_dialog_close();
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
    showHabitDialogButton = document.querySelector('#show-habit-dialog');

    if (! habitDialog.showModal) {
        dialogPolyfill.registerDialog(habitDialog);
    }
    showHabitDialogButton.addEventListener('click', function() {
        habit_dialog_open();
        habits_panelV.flagNew = true;
    });
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