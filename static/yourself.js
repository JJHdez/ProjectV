window.addEventListener('load', function () {
    var apiv1 = '/api/v1/';
    var delimiters = ['${', '}'];
    var dreamDialog = null;
    var showDreamDialogButton = null;
    /// DREAM ////
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
                this.dreamModel.due_date_at = data.due_date_at?data.due_date_at:'';
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
            }
        }, // end methods

        computed: {
            validationDreamModel: function () {
            return {
                    accept: this.dreamModel.name.trim().length>3
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
});