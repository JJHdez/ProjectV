window.addEventListener('load', function ()
{
     /// Pending
    var pendingDialog = null;
    var showPendingDialogButton = null;

    var pending_panelV = new Vue({
        delimiters: libzr.getDelimiterVue(),
        el: '#pending-panel',
        data:{
            pendings: [],
            pendingModel:{
                index:-1,
                id:-1,
                name: '',
                completed_at:'',
                description:''
            },
            url: libzr.getApi()+'pending',
            flagNew:true
        },

        methods:{
            // if clicked tab pending or load page your self
            init: function () {
                this._callback(null, this.url,'GET', 'init');
            },
            add : function () {
                this.flagNew = true;
                this._accept();
            },
            _accept :function() {
                var  _action = this.flagNew?'new':'edit';
                var  _method = this.flagNew?'POST':'PUT';
                var  _url = this.flagNew?this.url:this.url+'/'+this.pendingModel.id;
                var new_dream = {
                    name: this.pendingModel.name
                };
                if (this.pendingModel.description.trim().length>0){
                    new_dream['description']= this.pendingModel.description.trim();
                }
                this._callback(new_dream,_url,_method,_action);
            },
            // clean model
            _clean: function(){
                this.pendingModel.name = '';
                this.pendingModel.description= '';
                this.pendingModel.index = -1;
                this.pendingModel.id = -1;
            },

            _done: function(data, index){
                var _values = {'completed_at': libzr.getUtcDate(new Date()).format('yyyy-M-d h:m:s')};
                this.pendingModel.index = index;
                this._callback(_values, this.url+'/'+data.id, 'PUT','done');
            },

            _edit: function(data, index){
                this.flagNew = false;
                this.pendingModel.name = data.name;
                this.pendingModel.description = data.description?data.description:'';
                this.pendingModel.id = data.id;
                this.pendingModel.index = index;
                pending_dialog_open();
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
                                for (var c = 0 ; c < response.data.pendings.length; c++){
                                    self.pendings.push(response.data.pendings[c])
                                }
                                break;
                            case 'done':
                                self.pendings.splice(self.pendingModel.index,1);
                                break;
                            case 'remove':
                                self.pendings.splice(self.pendingModel.index,1);
                                pending_dialog_close();
                                break;
                            case 'new':
                                _data['id']=response.data.pendings[0].id;
                                // _data['created_at'] = new Date().toJSON().slice(0,10).replace(/-/g,'/');
                                self.pendings.push(_data);
                                // pending_dialog_close();
                                break;
                            case 'edit':
                                _data['id']=self.pendingModel.id;
                                _data['description'] = self.pendingModel.description;
                                self.pendings.splice(self.pendingModel.index,1,_data);
                                pending_dialog_close();
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
                this._callback(null, this.url+'/'+this.pendingModel.id, 'DELETE','remove');
            },
            pendingBackground: function(pending,index){
                return "mdl-list__item mdl-list__item--three-line mdl-shadow--2dp zr-pending-background-1";//+libzr.getRandom(1,4);
            }
        }, // end methods

        computed: {
            validationPendingModel: function () {
                return {
                    accept: this.pendingModel.name.trim().length>3,
                    remove: !this.flagNew
                }
            }
        }

    });

    pending_panelV.init();

    pendingDialog = document.querySelector('#pending-dialog');
    // showPendingDialogButton = document.querySelector('#show-pending-dialog');

    if (! pendingDialog.showModal) {
        dialogPolyfill.registerDialog(pendingDialog);
    }
    // showPendingDialogButton.addEventListener('click', function() {
    //     pending_dialog_open();
    //     pending_panelV.flagNew = true;
    // });
    pendingDialog.querySelector('#pending-dialog-cancel').addEventListener('click', function() {
        pending_panelV._clean();
        pending_dialog_close();
    });
    pendingDialog.querySelector('#pending-dialog-remove').addEventListener('click', function() {
        pending_panelV._remove();
    });
    pendingDialog.querySelector('#pending-dialog-accept').addEventListener('click', function() {
        pending_panelV._accept()
    });
    function pending_dialog_open() {
        if(pendingDialog)
            pendingDialog.showModal();
    }
    function pending_dialog_close() {
        if(pendingDialog)
            pendingDialog.close();
    }
});