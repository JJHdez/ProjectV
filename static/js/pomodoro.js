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
    var timerRE = /([0-5][0-9])/;

    var Pomodoro = new Vue({

        delimiters: libzr.getDelimiterVue(),

        el: '#pomodoro-content',

        data: {
            url: libzr.getApi() + 'pomodoro',
            activities: [],
            timer: {
                hour:0,
                minute:0,
                second:0,
                activity:null,
                index: -1
            },
            activity: {
                name: '',
                timer: '',
                due_datetime_at:'',
                start_datetime_at:''
            },
            interval : null,
            is_pause: false
        },

        methods: {
            init : function () {
                gCharts.charts.load("current", {packages:['corechart', 'line']});
                this.getStatisticOfTheWeek()
                this.getStatisticOfTheMonth()
                this.getStatisticOfTheYear()
                this._callback(null,this.url+'?activities=registered','GET','init')
            },
            add:function () {
                var _timer_tmp = this.activity.timer.split(':');
                var _timer  = '00:25:00';
                var _data = {};
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
                            this.activity.start_datetime_at = '';
                            this.activity.due_datetime_at = '';
                            break;
                        case 'timer':
                            this.timer.hour = 0;
                            this.timer.minute = 0;
                            this.timer.second = 0;
                            this.timer.activity = null;
                            this.timer.index = -1;
                            break;

                    }
                }

            },

            remove: function (activity, index) {
                var _data = [];
                _data ['index'] = index;
                this._callback(_data, this.url + '/' + activity.id, 'DELETE', 'remove');
            },

            play: function (activity, index) {
                var self = this;
                if (self.interval == null &&
                    self.timer.hour == 0  && self.timer.minute == 0 &&
                    self.timer.second == 0 ){
                    var _timer_tmp = activity.timer.split(':');
                    if(_timer_tmp.length==3){
                        var now = libzr.getUtcDate(new Date()).format('yyyy-M-d h:m:s');
                        $.ajax({
                            url: self.url+"/"+activity.id,
                            type: 'PUT',
                            data: JSON.stringify({'start_datetime_at':now}),
                            contentType: 'application/json'
                        }).done(function (response) {
                            if (response.status_code == 201){

                                self.timer.hour = self.getZero(parseInt(_timer_tmp[0]));
                                self.timer.minute = self.getZero(parseInt(_timer_tmp[1]));
                                self.timer.second = 60;
                                self.timer.activity = activity;
                                self.timer.index = index;

                                libzr.notifyBrowser(activity.name, {'body':activity.timer});
                                activity['start_datetime_at']=now;
                                self.activities.splice(index, 1, activity);
                                self.interval = setInterval(function () {
                                    if (!self.is_pause){
                                        self.timer.second = self.getZero(self.timer.second);
                                        if (self.timer.second == 0){
                                            self.timer.second = self.timer.minute -1 < 0 ? 0 : 60;
                                            self.timer.minute = self.getZero(self.timer.minute);
                                        }
                                        if (self.timer.minute == 0){
                                            self.timer.minute = self.timer.hour -1 < 0 ? 0 : 60;
                                            self.timer.hour = self.getZero(self.timer.hour);
                                        }
                                        if (self.timer.hour == 0 &&  self.timer.minute == 0 && self.timer.second == 0){
                                            // Notify desktop
                                            libzr.notifyBrowser(activity.name, {'body': '00:00:00'});
                                            self.stop(activity, index);
                                        }
                                        document.title= self.timer.hour +':'+self.timer.minute +':'+ self.timer.second;
                                    }
                                },1000);
                            }else{
                                if (response.message)
                                    notify({message: 'Error al generar la peticion, favor interntar mas tarde! :('});
                            }
                        }).fail(function () {
                            notify({message: 'Error al generar la peticion, favor interntar mas tarde! :('});
                            // return false;
                        });
                    }
                }
            },

            getZero: function (value) {
                return ( value - 1 < 0 ? 0: value -1);
            },

            stop:function (activity, index) {
                var self = this;
                clearInterval(self.interval);
                self.interval = null;
                self._clean(['timer']);
                // wait(1000);
                var now = libzr.getUtcDate(new Date()).format('yyyy-M-d h:m:s');
                $.ajax({
                    url: self.url+"/"+activity.id,
                    type: 'PUT',
                    data: JSON.stringify({due_datetime_at: now}),
                    contentType: 'application/json'
                }).done(function (response) {
                        if (response.status_code != 201){
                            if (response.message)
                                notify({message: response.message});
                        }else {
                            activity['due_datetime_at']=now;
                            self.activities.splice(index, 1, activity);
                        }
                        self.getStatisticOfTheWeek();
                        self.getStatisticOfTheMonth();
                        self.getStatisticOfTheYear();
                });


            },

            pause: function (acivity, index) {
              this.is_pause = !this.is_pause;
            },

            progress: function (_progress, _buffer) {
                document.querySelector('#progress-pomodoro-timer').
                addEventListener('mdl-componentupgraded', function() {
                    this.MaterialProgress.setProgress(80);
                    this.MaterialProgress.setBuffer(90);
                });
            },

            playShow: function (activity, index) {
                var isShow = false;
                if (this.timer.index == -1 && this.timer.activity == null &&
                    !activity.due_datetime_at){
                    isShow=true;
                }
                return isShow;
            },

            pauseOrStopShow: function(activity, index){
                var isShow = false;
                if (this.timer.activity && this.timer.index == index
                    && this.timer.activity.id == activity.id){
                    isShow=true;
                }
                return isShow;
            },

            removeShow: function (activity, index) {
                var isShow = true;
                if (this.timer.activity && activity.start_datetime_at && this.timer.activity.id == activity.id){
                    isShow =false;
                }else if(activity.due_datetime_at && activity.start_datetime_at){
                    isShow =false;
                }
                return isShow;
            },

            getIcon: function (activity, index, ttype) {
                var icon = 'alarm_off';
                var classIcon = 'material-icons mdl-list__item-avatar';
                if (this.timer.activity && activity.id == this.timer.activity.id){
                    icon='alarm';
                    classIcon += ' mdl-color--blue';
                }else if(activity.start_datetime_at && activity.due_datetime_at){
                    icon = 'alarm_on';
                    classIcon += ' mdl-color--green';
                }else {
                    classIcon += ' mdl-color--red';
                }
                if(ttype=='icon')
                    return icon;
                else
                    return classIcon;
            },

            getStatisticOfTheWeek: function () {
                this._callback(null, this.url+'?statistic=week',
                 'GET', 'statistic_of_the_week');

            },

            _drawChartStatisticWeek: function  ( _data ) {

                var data = gCharts.visualization.arrayToDataTable(_data);
                var view = new gCharts.visualization.DataView(data);
                view.setColumns([0, 1,
                              { calc: "stringify",
                                sourceColumn: 1,
                                type: "string",
                                role: "annotation" },
                              2]);
                var options = {
                    title: "Weekly statistic",
                   bar: {groupWidth: "95%"},
                   legend: { position: "none" },
             };
             var chart = new gCharts.visualization.ColumnChart(document.getElementById("statistic_week"));
             chart.draw(view, options);
            },

            getStatisticOfTheMonth: function () {
                this._callback(null, this.url+'?statistic=month',
                 'GET', 'statistic_of_the_month');

            },

            _drawChartStatisticMonth: function  ( _data ) {
                var data = new gCharts.visualization.DataTable();
                    data.addColumn('number', 'X');
                    data.addColumn('number', 'Minutes');
                    data.addRows(_data);
                    var options = {
                        hAxis: {
                            title: 'Days'
                        },
                        vAxis: {
                            title: 'Minutes'
                        },
                        legend: {
                            position: "none"
                        },
                        title: 'Monthly statistic',
                    };
                var chart = new gCharts.visualization.LineChart(document.getElementById("statistic_month"));
                chart.draw(data, options);
            },

            getStatisticOfTheYear: function () {
                this._callback(null, this.url+'?statistic=year',
                 'GET', 'statistic_of_the_year');
            },

            _drawChartStatisticYear: function  ( _data ) {
                var data = gCharts.visualization.arrayToDataTable(_data);

                var options = {
                    title: 'Yearly statistic',
                    is3D: true,
                };

               var chart = new gCharts.visualization.PieChart(document.getElementById('statistic_year'));
               chart.draw(data, options);

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
                                console.log(response.data);
                                for (var c = 0; c < response.data.pomodoro_activities.length; c++) {
                                    self.activities.push(response.data.pomodoro_activities[c])
                                }
                                break;
                            case 'done':
                                self.issues.splice(self.issueModel.index, 1);
                                break;
                            case 'remove':
                                self.activities.splice(_data['index'], 1);
                                break;
                            case 'new':
                                _data['id'] = response.data.pomodoro_activities[0].id;
                                self.activities.unshift(_data);
                                self._clean(['activity']);
                                break;
                            case 'statistic_of_the_week':
                                gCharts.charts.setOnLoadCallback(function(){self._drawChartStatisticWeek(response.data) });
                                break;
                            case 'statistic_of_the_month':
                                gCharts.charts.setOnLoadCallback(function(){self._drawChartStatisticMonth(response.data) });
                                break;
                            case 'statistic_of_the_year':
                                gCharts.charts.setOnLoadCallback(function(){self._drawChartStatisticYear(response.data) });
                                break;
                        }
                        if (response.message)
                            notify({message: response.message});
                        // self._clean();
                        return true;
                    } else {
                        if (response.message)
                            notify({message: response.message});
                        return false;
                    }
                }).fail(function () {
                    notify({message: 'Error al generar la peticion, favor interntar mas tarde! :('});
                    return false;
                });
            }
        }, // end methods

        computed: {
            validationActivityModel: function () {
                return {
                    add: this.activity.name.trim().length > 3 && timerRE.test(this.activity.timer)
                }
            }
        }
    });
    Pomodoro.init()
});
