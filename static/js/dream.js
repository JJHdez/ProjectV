/**
 * Copyright 2017 ProjectV Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * */

window.addEventListener('load', function ()
{
    /// DREAM ////
    var dreamDialog = null;
    var dreams_panelV = new Vue({
        delimiters: libzr.getDelimiterVue(),
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
            url: libzr.getApi()+'dream',
            flagNew:true
        },

        methods:{
            // if clicked tab dreams or load page your self
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
                var _values = {'completed_at': libzr.getUtcDate(new Date()).format('yyyy-M-d h:m:s')};
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
                                // dream_dialog_close();
                                break;
                            case 'edit':
                                _data['id']=self.dreamModel.id;
                                _data['created_at'] = self.dreamModel.created_at;
                                _data['due_date_at'] = self.dreamModel.due_date_at;
                                self.dreams.splice(self.dreamModel.index,1,_data);
                                dream_dialog_close();
                                break
                        }
                        // if (response.message)
                        //     notify({message: response.message});
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
            },
            dreamBackground: function (dream, index) {
                return "mdl-card mdl-shadow--2dp zr-dream-background-1";//+ libzr.getRandom(1,4);
            },
            getDate: function (_date) {
                if (!_date)
                    _date = '';
                else{
                    _date = new Date(_date);
                    _date = _date.format('yyyy-M-d')
                }
                return _date;
            },

            setProgressBar : function (dream) {
                var percentage_days = 0;
                var percentage_minutes = 0;

                if (dream.due_date_at){
                    var start_dream = new Date(dream.created_at);
                    var due_dream = new Date(dream.due_date_at);
                    var today = new Date();
                    var today_start_date = new Date();
                    today_start_date.setHours(0);
                    today_start_date.setMinutes(59);
                    today_start_date.setSeconds(59);

                    var today_due_date = new Date();
                    today_due_date.setHours(23);
                    today_due_date.setMinutes(59);
                    today_due_date.setSeconds(59);

                    var diffDays = Math.abs(libzr.getDiffDay(start_dream, due_dream));
                    var diffDaysToday = Math.abs(libzr.getDiffDay(today, due_dream));

                    percentage_days = (diffDaysToday *100) / diffDays;

                    var diffMinutes = Math.abs(libzr.getDiffHour(today_start_date, today_due_date));
                    var diffMinutesToday = Math.abs(libzr.getDiffHour(today, today_due_date));
                    percentage_minutes = (diffMinutesToday *100) / diffMinutes;
                }
                // var _uid = "show--"+dream.id+"-dream-progress";
                return percentage_days;

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
    // showDreamDialogButton = document.querySelector('#show-dream-dialog');

    if (! dreamDialog.showModal) {
        dialogPolyfill.registerDialog(dreamDialog);
    }
    // showDreamDialogButton.addEventListener('click', function() {
    //     dream_dialog_open();
    //     dreams_panelV.flagNew = true;
    // });
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
        if(dreamDialog){
            dreamDialog.showModal();
        }
    }
    function dream_dialog_close() {
        if(dreamDialog)
            dreamDialog.close();
    }
});