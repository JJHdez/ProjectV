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

//var delimiter_vue = ["<{","}>"]
// (function() {
    window.addEventListener('load', function () {
        var ULV = new Vue(
            {
                el: '#menu-header',
                 data: {
                     // format DD/MM/YYYY or DD-MM-YYYY
                     dateRE : /^(0?[1-9]|[12][0-9]|3[01])[\/\-](0?[1-9]|1[012])[\/\-]\d{4}$/
                 },
                methods: {
                    redirect_index_dream: function (event) {
                        window.location = '/ul/yourself';
                    },
                    redirect_index_dashboard: function (event) {
                        window.location = '/ul/dashboard';
                    },
                    redirect_index_project: function (event) {
                        window.location = '/ul/quick-list';
                    },
                    redirect_index_pomodoro: function (event) {
                        window.location = '/ul/pomodoro';
                    },
                    redirect_index_to_buy: function (event) {
                        window.location = '/ul/to-buy';
                    },
                    redirect_index_habit: function (event) {
                        window.location = '/ul/habit';
                    }
                }
            }
        ) ;// end object mainV

        // End window addEventListener
    });
// })();