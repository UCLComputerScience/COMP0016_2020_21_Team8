# API for Form Recognizer (Img Recognition)
## Intro 
 This API takes a document and returns the table data if there is any (using type=Layout)
 or takes an image and returns business card pattern result if there is any (using type=BusinessCard).

## Endpoint
 https://avabotformrecog.azurewebsites.net/api/FormRecogFunction

## Usage
 POST: https://avabotformrecog.azurewebsites.net/api/FormRecogFunction?type=Layout
 <BR>POST: https://avabotformrecog.azurewebsites.net/api/FormRecogFunction?type=BusinessCard

<br>See files under [../testAPI_example/testFormRec](../testAPI_example/testFormRec) for more testing examples