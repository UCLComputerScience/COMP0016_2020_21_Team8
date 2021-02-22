How to install:

Build the python3.6 virtual env.

Install gunicorn.

Run with gunicorn: gunicorn -b 0.0.0.0:5000 --timeout=90 --debug_level='debug' wsgi:app
