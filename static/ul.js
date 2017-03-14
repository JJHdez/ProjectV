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
                        window.location = '/ul/project';
                    },
                    redirect_index_pomodoro: function (event) {
                        window.location = '/ul/pomodoro';
                    }
                }
            }
        ) ;// end object mainV

        // End window addEventListener
    });
// })();