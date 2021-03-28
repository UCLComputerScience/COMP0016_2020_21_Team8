import logging
import json

import azure.functions as func
from . import recogLayout
from . import recogBusinessCard

LAYOUT = 'Layout'
BUSINESSCARD = 'BusinessCard'


def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Form Recognizer processed a request.')

    file = req.files.get("file")
    recog_type = req.params.get('type')

    if not file:
        return func.HttpResponse(f"Missing image")

    file_path = '/tmp/tmpFile'

    f = open(file_path, 'wb')
    f.write(file.read())
    f.close()

    result = []
    if (recog_type == LAYOUT):
        result = recogLayout.process(file_path)

    elif recog_type == BUSINESSCARD:
        result = recogBusinessCard.process(file_path)
    print(result)
    result_json = json.dumps(result)

    return func.HttpResponse(result_json)
