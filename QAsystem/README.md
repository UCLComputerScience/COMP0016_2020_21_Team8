# API for QA system

## Endpoint
 http://20.77.57.60:5000

## Usage
 http://20.77.57.60:5000
 <br>http://20.77.57.60:5000?query=YOUR_QUESTION
 
 <br>See files under [../testAPI_example/testQA](../testAPI_example/testQA) for more testing examples
## Deploy locally

Build the python3.6 virtual env.

Install gunicorn.

Run with gunicorn: gunicorn -b 0.0.0.0:5000 --timeout=90 --debug_level='debug' wsgi:app
