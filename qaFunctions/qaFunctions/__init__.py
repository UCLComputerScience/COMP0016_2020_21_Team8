import logging
import json

import azure.functions as func

from . import bootLoader


def main(req: func.HttpRequest) -> func.HttpResponse:

    logging.info('Python HTTP trigger function processed a request.')

    query = req.params.get('query')
    file = req.files.get("file")

    logging.info(query)
    logging.info(file.filename)
    logging.info(type(file))

    filePath  = 'data/tmp'
    if (file.filename.endswith('.pdf')):
        filePath += '.pdf'
    elif file.filename.endswith('.txt'):
        filePath += '.txt'
    elif file.filename.endswtih('.doc'):
        filePath += '.doc'

    f = open(filePath, 'wb')
    f.write(file.read())
    f.close()

    # raise Exception("Should stop here")

    if not file or not query:
        raise Exception("Missing doc or query")

    # if name:
    #     return func.HttpResponse(f"Hello, {name}. This HTTP triggered function executed successfully.")
    # else:
    #     return func.HttpResponse(
    #          "This HTTP triggered function executed successfully. Pass a name in the query string or in the request body for a personalized response.",
    #          status_code=200
    #     )

    searchResult = bootLoader.run(filePath, query)
    # func.HttpResponse.mimetype = 'application/json'
    # func.HttpResponse.charset = 'utf-8'
    a = json.dumps(searchResult['answers'])

    return func.HttpResponse(a)