window.addEventListener('load', function () {
    var apiv1 = '/api/v1/';
    var delimiters = ['${', '}']
    /// DREAM ////


    var dreams_panelV = new Vue({
        delimiters: delimiters,
        el: '#dreams-panel',
        data:{
            dreams: [],

            dreamM:{
                name: '',
                due_date_at:'',
            },
            url: apiv1+'dream',
        },

        methods:{

            init: function () {
                var self =  this;
                $.ajax({
                    url: self.url,
                    type:'GET',
                    contentType:'application/json'
                }).done(function( response ) {
                    if (response.status_code==200){
                        for (c = 0 ; c < response.data.dreams.length; c++){
                            self.dreams.push(response.data.dreams[c])
                        }
//                        console.log(self.dreams)
                    }
                })
            },

            _new :function() {
                var self = this;
                var new_dream = {
                    name:this.dreamM.name,
                }
                if (this.dreamM.due_date_at.length>0){
                    if (!dateRE.test(this.dreamM.due_date_at)){
                        this.dreamM.due_date_at = ''
                        notify({message:'El formato de fecha es incorrecto!'})
                        return;
                    }
                    new_dream.due_date_at = this.dreamM.due_date_at;
                }
                $.ajax({
                    url: self.url,
                    data: JSON.stringify(new_dream),
                    type:'POST',
                    contentType: 'application/json',
                }).done(function( response ) {
                    if (response.status_code==201){
                        for (c = 0 ; c < response.data.dreams.length; c++){
                            new_dream.id = response.data.dreams[c].id
                            new_dream.created_at = new Date().toJSON().slice(0,10).replace(/-/g,'/');
                            if (this.dreamM.due_date_at.length>0)
                                new_dream.due_date_at  = this.dreamM.due_date_at
                        }
                        self._clean()
                        self.dreams.push(new_dream)
                        notify({message:response.message})
                    }else{
                        notify({message:response.message})
                    }
                }).fail(function() {
                    notify({message:'Mo se ha podido registrar favor interntar mas tarde! :('})
                    return;
                })
                return true;
            },
            _clean: function(){
                this.dreamM.name = '';
                this.dreamM.due_date_at= '';
            },
            _done: function(data, index){
                console.log(data)
                console.log(index)
                this.dreams.splice(index,1)
                var now = new Date();


            },
            _edit: function(data, index){

//                var now = new Date;
//                var utc_timestamp = Date.UTC(
//                    now.getUTCFullYear(),
//                    now.getUTCMonth(),
//                    now.getUTCDate(),
//                    now.getUTCHours(),
//                    now.getUTCMinutes(),
//                    now.getUTCSeconds(),
//                    now.getUTCMilliseconds());
//                var todayUTC = new Date(utc_timestamp);
//                var g = todayUTC.toISOString()//.slice(0, 10) //.replace(/-/g, '-');
//                console.log(g)


            },
        }, // end methods

        computed: {
            validationDreamM: function () {
            return {
                    accept: this.dreamM.name.trim().length>3,
                }
            }
        },

    }) ///
    dreams_panelV.init()
    var dreamDialog = document.querySelector('#dream-dialog');
    var showDreamDialogButton = document.querySelector('#show-dream-dialog');
    if (! dreamDialog.showModal) {
         dialogPolyfill.registerDialog(dreamDialog);
    }
    showDreamDialogButton.addEventListener('click', function() {
        dreamDialog.showModal();
    });
    dreamDialog.querySelector('#dream-dialog-cancel').addEventListener('click', function() {
        dreams_panelV._clean()
        dreamDialog.close();
    });
    dreamDialog.querySelector('#dream-dialog-accept').addEventListener('click', function() {
        if (dreams_panelV._new())
            dreamDialog.close();
    });
})

// var habitDialog = document.querySelector('#habit-dialog');
// var showHabitDialogButton = document.querySelector('#add-habit-dialog');
// if (! habitDialog.showModal) {
//     dialogPolyfill.registerDialog(habitDialog);
// }
// showHabitDialogButton.addEventListener('click', function() {
//     habitDialog.showModal();
// });
// habitDialog.querySelector('.close').addEventListener('click', function() {
//     habitDialog.close();
// });
// var pendingDialog = document.querySelector('#pending-dialog');
// var showPendingDialogButton = document.querySelector('#add-pending-dialog');
// if (! pendingDialog.showModal) {
//     dialogPolyfill.registerDialog(pendingDialog);
// }
// showPendingDialogButton.addEventListener('click', function() {
//     pendingDialog.showModal();
// });
// pendingDialog.querySelector('.close').addEventListener('click', function() {
//     pendingDialog.close();
// });