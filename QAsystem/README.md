## Introduction

The QA system builds model for one or multiple documents and answers NL queries about the docs. 



## EndPoint

Send the document in POST request to `http://20.77.57.60:5000`.

Send the query in GET request to `url =http://20.77.57.60:5000?query={QUERY}`

## Deployment

The QA system is deployed on Azure linux virtual machine with `Gunicorn`. We also add `Nginx` as the reverse proxy. 