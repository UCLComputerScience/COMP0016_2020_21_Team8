const path = require('path');
const axios = require('axios');
const fse = require("fs-extra");
var FormData = require("form-data");

var form = new FormData();
const FileName = path.join(__dirname, 'text.pdf');
form.append("file", fse.createReadStream(FileName));

axios.get('http://51.11.182.5:5000?query="How is our gamming industry?')

    .then(function (response) {
        console.log(response.data);
    })
    .catch(function (error) {
        console.log(error);
    });