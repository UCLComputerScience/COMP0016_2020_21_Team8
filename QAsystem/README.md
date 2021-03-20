# API for QA system
## Intro
 This API would take a document and pre-process it, and answer questions about the document.

## Endpoint
 http://20.77.57.60:5000

## Usage
 POST: http://20.77.57.60:5000
 <br>GET: http://20.77.57.60:5000?query=YOUR_QUESTION
 
 <br>See files under [../testAPI_example/testQA](../testAPI_example/testQA) for more testing examples
## Deploy locally

Build the python3.6 virtual env.

Install gunicorn.

Run with gunicorn: gunicorn -b 0.0.0.0:5000 --timeout=90 --debug_level='debug' wsgi:app
