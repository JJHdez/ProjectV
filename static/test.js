window.addEventListener('load', function () {
    var test  = new Vue({
        delimiters: ['${', '}'],
        el: '#content',
        data:{
            prueba_01: 'que tal',
            todos: [
      { text: 'Learn JavaScript' },
      { text: 'Learn Vue' },
      { text: 'Build something awesome' }
    ],
        },
    })
})