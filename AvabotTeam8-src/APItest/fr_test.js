const path = require("path");
const axios = require("axios");
const fse = require("fs-extra");
var FormData = require("form-data");

var form = new FormData();
const FileName = path.join(__dirname, "test.pdf");
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
const url =
  "http://avabotformrecog.azurewebsites.net/api/FormRecogFunction?type=BusinessCard";
const url2 =
  "https://avabotformrecog.azurewebsites.net/api/FormRecogFunction?type=Layout";

axios({
    method: "post",
    url: 'http://avabotformrecog.azurewebsites.net/api/FormRecogFunction?type=Layout',
    data: form,
    headers: form.getHeaders()
})
    .then(function (response) {
        var b = '';
        var a = response.data;
        // a.forEach(line => {
        //     b += line + '\n';
        // });

        console.log(formatTable(a));
    })
    .catch(function (error) {
        console.log(error);
    });


function formatTable(tables) {
  var formatted = "";
  var nth = 1;
  while (tables[nth - 1] != undefined) {
    formatted += "Table " + nth + ": \r\n";
    formatted += columDivider(tables[nth - 1]);
    nth++;
  }
  return formatted;
}

function columDivider(string) {
  var oneTable = "";
  var columns = [];
  columns = getRidSides(string).split("}");
  var item = 1;
  while (columns[item - 1] != undefined) {
    var element = columns[item - 1].split("{")[1];
    if (element != undefined) {
      oneTable += "Column " + item + ": " + divide(element) + " \r\n";
    }

    item++;
  }
  return oneTable;
}

function divide(string) {
  var column = [];
  var arr = [];
  arr = string.split(",");
  var item = 0;
  while (arr[item] != undefined) {
    var element = arr[item].split(":")[1];
    column.push(element);
    item++;
  }
  return column;
}

function getRidSides(str) {
  return str.slice(1, str.length - 1);
}
