//var delimiter_vue = ["<{","}>"]
window.addEventListener('load', function () {
    var mainV = new Vue(
        {
            el: '#menu-header',
             data: {
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
            }
        }
    ) // end object mainV

    // End window addEventListener
})
