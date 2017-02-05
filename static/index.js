window.addEventListener('load', function ()
{
    var emailRE = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    var index = new Vue({
        el: '#form-login',
        data: {
            login: {
                user_email:'',
                user_password: '',
                // user_email_recovery:''
            }
        },
        computed: {
            validation: function () {
            return {
                // user_email_recovery: emailRE.test(this.login.user_email_recovery),
                sign_in: true //emailRE.test(this.login.user_email) && this.login.user_password
                }
            }
        },
        methods: {
            cancel: function(){
                this.login.user_email = null
                this.login.user_password = null
                // this.login.user_email_recovery = null
            },
            auth:function(){
                console.log('Ok!');

                var url = '/api/v1/login';

                var data = {
                    'mode':'web',
                    'uid':this.login.user_password,
                    'email':this.login.user_email.trim(),
                    'auth': 'email',
                    'token': 'sdfsdfsdfsdf'
                };
                $.ajax({
                    url:url,
                    data: JSON.stringify(data),
                    type:'POST',
                    contentType:'application/json'
                }).done(function( response ) {
                    if (response.status_code == 200){
                        window.location = '/ul/dashboard';
                    }else{
                        var snackbarContainer = document.querySelector('#notification-index');
                        var data_snackbar = {
                            message: response.message,
                            timeout: 2000
                        };
                        snackbarContainer.MaterialSnackbar.showSnackbar(data_snackbar);
                    }

                });

            }
        },
    }
)

var recovery = new Vue(
    {
        el: '#layout-header',
        data: {
            recovery: {
                user_email:''
            }
        },
        computed: {
            validation: function () {
            return {
                user_email: emailRE.test(this.recovery.user_email),

                }
            }
        },
    }
)
// end window addEventListener load
})
