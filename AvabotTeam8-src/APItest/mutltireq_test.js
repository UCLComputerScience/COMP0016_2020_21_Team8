const path = require('path');
const axios = require('axios');
const fse = require("fs-extra");
var FormData = require("form-data");

var form = new FormData();
const FileName = path.join(__dirname, 'text.pdf');
form.append("file", fse.createReadStream(FileName));

// const a = axios({
//     method: "post",
//     url: "https://textsumapi.azurewebsites.net/api/TextSummary",
//     data: form,
//     headers: form.getHeaders()
// })
//     .then(function (response) {
//         console.log(response.data);
//     })
//     .catch(function (error) {
//         console.log(error);
//     });

// const b = axios({
//     method: "post",
//     url: "http://20.77.57.60:5000",
//     data: form,
//     headers: form.getHeaders()
// })
//     .then(function (response) {
//         console.log(response.data);
//     })
//     .catch(function (error) {
//         console.log(error);
//     });


// axios.all([axios({
//     method: "post",
//     url: "https://textsumapi.azurewebsites.net/api/TextSummary",
//     data: form,
//     headers: form.getHeaders()
// }), axios({
//     method: "post",
//     url: "http://20.77.57.60:5000",
//     data: form,
//     headers: form.getHeaders()
// })]). then(axios.spread((data1, data2) => {
//     // output of req.
//     console.log(data1.value, data2.value)
//   }));

let reqArr = [axios({
    method: "post",
    url: "https://textsumapi.azurewebsites.net/api/TextSummary",
    data: form,
    headers: form.getHeaders()
}), axios({
    method: "post",
    url: "http://20.77.57.60:5000",
    data: form,
    headers: form.getHeaders()
})];

Promise.allSettled(reqArr).then(results => { 
    results.forEach(result => {
        console.log(result.status);
        if (result.status == 'fulfilled'){
            console.log(result.value.data);
        }
    
    })
    
})
