import logging

import azure.functions as func
import json

from . import bootLoader


def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Text Summary function processed a request.')

    file = req.files.get("file")
    if not file:
        return func.HttpResponse(f"Missing doc")

    filePath = '/tmp/tmpFile'

    if file.filename.endswith('.pdf'):
        filePath += '.pdf'
    elif file.filename.endswith('.txt'):
        filePath += '.txt'
    elif file.filename.endswith('.doc'):
        filePath += '.doc'
    f = open(filePath, 'wb')
    f.write(file.read())
    f.close()

    result = bootLoader.summary(filePath)
    logging.info(result)
    a = json.dumps(result)

    return func.HttpResponse(a)
