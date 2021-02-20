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

axios({
    method: "post",
    url: "http://51.11.182.5:5000",
    data: form,
    headers: form.getHeaders()
})
    .then(function (response) {
        console.log(response.data);
    })
    .catch(function (error) {
        console.log(error);
    });