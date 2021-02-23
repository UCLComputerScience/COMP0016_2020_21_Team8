from flask import Flask
from flask import request
from flask import jsonify

from . import query_handler
from . import file_upload
from . import pre_process

app = Flask(__name__)

@app.route('/', methods=['POST'])
def upload():
    app.logger.info("Receiving a POST request")
    file = request.files['file']

    app.logger.info("Handling file: " + file.name)
    if not file:
        raise Exception("Document is missing")
    print("Enter file upload")
    document_store = file_upload.file_upload(file)
    print("enter pre_process.process")
    pre_process.process(document_store)
    return "successfully uploaded"

@app.route('/', methods=['GET'])
def query():
    app.logger.info("Receiving a GET request")
    query = request.args.get("query")
    if not query:
        raise Exception("Query is missing")
    app.logger.info("Handling query: " + query)

    if query == "END":
        query_handler.pipe = None
        return "successfully terminated"
    else:
        res = query_handler.processQuery(query)
        app.logger.info(res)
        res = res['answers']
        return jsonify(res)