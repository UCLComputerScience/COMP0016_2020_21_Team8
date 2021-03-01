const axios = require('axios');

axios.get('http://20.77.57.60:5000?query=what is randoop?')
    .then(function (v) {
        console.log('answer: ' + v.data.answer + '\n' + 'context: ' + v.data.context);
    })
    .catch(function (error) {
        console.log(error);
    });