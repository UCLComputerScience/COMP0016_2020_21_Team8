import logging

import azure.functions as func
import json

from TextSumAPI import bootLoader


def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Text Summary function processed a request.')

    file = req.files.get("file")
    if not file:
        return func.HttpResponse(f"Missing doc")


    filePath  = '/tmp/tmpFile'
    # add extension 
    if (file.filename.endswith('.pdf')):
        filePath += '.pdf'
    elif file.filename.endswith('.txt'):
        filePath += '.txt'
    elif file.filename.endswtih('.doc'):
        filePath += '.doc'

    f = open(filePath, 'wb')
    f.write(file.read())
    f.close()

    result = bootLoader.summary(filePath)
    
    # if name:
    #     return func.HttpResponse(f"Hello, {name}. This HTTP triggered function executed successfully.")
    # else:
    #     return func.HttpResponse(
    #          "This HTTP triggered function executed successfully. Pass a name in the query string or in the request body for a personalized response.",
    #          status_code=200
    #     )
    logging.info(result)
    a = json.dumps(result)

    return func.HttpResponse(a)
