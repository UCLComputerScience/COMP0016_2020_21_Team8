const path = require('path');
const axios = require('axios');
const fse = require("fs-extra");
var FormData = require("form-data");

var form = new FormData();
const FileName = path.join(__dirname, 'text.pdf');
form.append("file", fse.createReadStream(FileName));
url = "http://51.11.38.199:5000";
url2 = "http://127.0.0.1";
url3 = "http://51.11.182.5:5000";
axios({
    method: "post",
    url: url3,
    data: form,
    headers: form.getHeaders()
})
    .then(function (response) {
        console.log(response.data);
    })
    .catch(function (error) {
        console.log(error);
    });