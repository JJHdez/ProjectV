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
    // var dreamDialog = null;
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
                index:-1,
                reach_goal:'',
                reward:''
            },
            url: libzr.getApi()+'dream',
            flagNew:true,
            dreamDialog: null,
            dreamLayout:1,
            urlComment:libzr.getApi() + 'project/comment',
            comments: [],
            commentModel: {
                'comment': '',
                'id': -1
            },
        },

        methods:{
            // if clicked tab dreams or load page your self
            init: function () {
                this._callback(null, this.url,'GET', 'init');
            },
            add : function () {
                if (this.validationDreamModel.accept){
                    this.flagNew = true;
                    this._accept();
                }
            },
            _accept :function() {
                var  _action = this.flagNew?'new':'edit';
                var  _method = this.flagNew?'POST':'PUT';
                var  _url = this.flagNew?this.url:this.url+'/'+this.dreamModel.id;
                var new_dream = {
                    name: this.dreamModel.name,
                    reach_goal: this.dreamModel.reach_goal,
                    reward: this.dreamModel.reward
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
                this.dreamModel.reach_goal = '';
                this.dreamModel.reward = '';
            },

            _done: function(data, index){
                var _values = {'completed_at': libzr.getUtcDate(new Date()).format('yyyy-M-d h:m:s')};
                this.dreamModel.index = index;
                this._callback(_values, this.url+'/'+data.id, 'PUT','done');
            },
            /*_findDreamDialog: function (action) {
               this.dreamDialog = this.$el.querySelector('#dream-dialog');
               if (! this.dreamDialog.showModal) {
                    dialogPolyfill.registerDialog(dreamDialog);
                }
                switch (action){
                    case 'show':
                            this.dreamDialog.showModal();
                        break;
                    case 'close':
                            this.dreamDialog.close();
                        break;
                }
            },*/
            _edit: function(data, index){
                this.flagNew = false;
                this.dreamModel.name = data.name;
                this.dreamModel.due_date_at = data.due_date_at? data.due_date_at:'';
                this.dreamModel.completed_at = data.completed_at;
                this.dreamModel.created_at = data.created_at;
                this.dreamModel.reach_goal = data.reach_goal;
                this.dreamModel.reward = data.reward;
                this.dreamModel.id = data.id;
                this.dreamModel.index = index;
                //this._findDreamDialog('show');
                libzr.findModal('dream-dialog', 'show');
                this.initComment(data, index)
            },

            _cancel: function () {
                this._clean();
                //this._findDreamDialog('close');
                libzr.findModal('dream-dialog', 'close');
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
                                //self._findDreamDialog('close');
                                libzr.findModal('dream-dialog', 'close');
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
                                // self._findDreamDialog('close');
                                libzr.findModal('dream-dialog', 'close');
                                break;
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

            },
            getDreamLayout: function (dream, index) {
                // if (this.dreamLayout ===8)
                //     this.dreamLayout = 1;
                // this.dreamLayout = this.dreamLayout +1;
                // return true;
                var classCss = '';
                switch (index){
                    case 1:
                        classCss='mdl-cell mdl-cell--6-col mdl-cell--4-col-tablet mdl-card mdl-shadow--4dp'
                        break;
                    case 2:
                        classCss='mdl-cell mdl-cell--3-col mdl-cell--4-col-tablet mdl-card mdl-card mdl-shadow--4dp zr-dream-card-full-bg'
                        break;
                    case 3:
                        classCss='mdl-cell mdl-cell--3-col mdl-cell--4-col-tablet mdl-card mdl-shadow--4dp'
                        break;
                    case 4:
                        classCss='mdl-cell mdl-cell--3-col mdl-cell--4-col-tablet zr-dream-card-event mdl-card mdl-card mdl-shadow--4dp zr-dream-card-event-bg mdl-color-text--white'
                        break;
                    case 5:
                        classCss='mdl-cell mdl-cell--5-col mdl-cell--4-col-tablet zr-dream-card-event mdl-card  mdl-card mdl-shadow--4dp';
                        break;
                    case 6:
                        classCss='mdl-cell mdl-cell--4-col mdl-cell--4-col-tablet zr-dream-card-event mdl-card  mdl-card mdl-shadow--4dp';
                        break;
                    default: // same class 0
                            classCss = 'mdl-grid mdl-cell mdl-cell--12-col mdl-cell--4-col-tablet mdl-card mdl-shadow--4dp';
                        break
                }
                return classCss;

            },
            initComment: function (dream, index) {
                this.comments = [];
                var _url = this.urlComment+"?by=resource&resource=dream&resource_id="+dream.id;
                this._requestComment(null, _url, 'GET', 'init');
            },
            acceptComment: function (isNew) {
                 if (this.validation.commentQuickAdd){
                        var _action = isNew ? 'new' : 'edit';
                        var _method = isNew ? 'POST' : 'PUT';
                        var _url = isNew ? this.urlComment : this.urlComment + '/' + this.commentModel.id;

                        var _new_comment = {
                            'comment': this.commentModel.comment,
                            'resource': 'dream',
                            'resource_id': this.dreamModel.id,
                            // 'user_name': '',
                            // 'user_cover': ''
                        };
                        this._requestComment(_new_comment, _url, _method, _action);
                    }else{

                    }
            },
            _requestComment: function (_data, _url, _method, _action) {
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
                                for (var c = 0; c < response.data.project_comments.length; c++) {
                                    self.comments.push(response.data.project_comments[c])
                                }
                                break;
                            // case 'done':
                            //     self.issues.splice(self.issueModel.index, 1);
                            //     break;
                            // case 'remove':
                            //     self.issues.splice(self.issueModel.index, 1);
                            //     break;
                            case 'new':
                                _data['id'] = response.data.project_comments[0].id;
                                self.comments.unshift(_data);
                                self.cleanBy({'model':'comment'});
                                break;
                            // case 'edit':
                            //     _data['id'] = self.issueModel.id;
                            //     // _data['created_at'] = self.issueModel.created_at;
                            //     // _data['due_date_at'] = self.issueModel.due_date_at;
                            //     self.issues.splice(self.issueModel.index, 1, _data);
                            //     issue_dialog_close();
                            //     break;
                        }
                        return true;
                    } else {
                        if (response.status_code != 404 ){
                            if (response.message)
                                notify({message: response.message});
                        }
                        return false;
                    }
                }).fail(function () {
                    notify({message: 'Error al generar la peticion, favor interntar mas tarde! :('});
                    return false;
                });
            },
             cleanBy: function (object) {
                if (object.model == 'comment'){
                    this.commentModel.comment = '';
                    this.commentModel.id = -1;
                }
            },

            beautyDateComment: function (date) {
                var toReturn = '';
                if (date){
                    var dateComment = new Date(date);
                    var diff_days = Math.abs(libzr.getDiffDay(dateComment, new Date()));
                    switch (true){
                        case diff_days == 1:
                            toReturn = 'Hace 1 día';
                            break;
                        case diff_days > 1  && diff_days < 30:
                            toReturn = 'Hace '+ diff_days+' dias';
                            break;
                        default:
                            toReturn = dateComment.toLocaleDateString()
                    }
                }
                return toReturn
            }

        }, // end methods

        computed: {
            validationDreamModel: function () {
            return {
                    accept: this.dreamModel.name.trim().length>3,
                    remove: !this.flagNew
                }
            },
            validation: function () {
                return{
                    commentQuickAdd: this.commentModel.comment.trim().length > 3
                }
            }

        },


    });

    dreams_panelV.init();

});