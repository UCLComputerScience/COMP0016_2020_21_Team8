const axios = require('axios');

axios.get('http://51.11.38.199:5000?query="What is randoop?')

    .then(function (response) {
        console.log(response.data);
    })
    .catch(function (error) {
        console.log(error);
    });