const path = require('path');
const axios = require('axios');
const fse = require("fs-extra");
var FormData = require("form-data");

var form = new FormData();
const FileName = path.join(__dirname, 'text.pdf');
form.append("file", fse.createReadStream(FileName));

// axios({
//     method: "post",
//     url: "https://textsumapi.azurewebsites.net/api/textsumapi",
//     data: form,
//     headers: form.getHeaders()
// })
//     .then(function (response) {
//         console.log(response.data);
//     })
//     .catch(function (error) {
//         console.log(error);
//     });
const url = 'http://avabotformrecog.azurewebsites.net/api/FormRecogFunction?type=BusinessCard'
const url2 = 'https://avabotformrecog.azurewebsites.net/api/FormRecogFunction?type=Layout'

axios({
    method: "post",
    url: 'http://avabotformrecog.azurewebsites.net/api/FormRecogFunction?type=BusinessCard',
    data: form,
    headers: form.getHeaders()
})
    .then(function (response) {
        var a = response.data;
        var b = '';
        a.forEach(line => {
            b+=line;
        });
        console.log(b);
    })
    .catch(function (error) {
        console.log(error);
    });