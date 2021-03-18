import requests

import requests
import json

url = 'http://localhost:7071/api/FormRecogFunction?type=BusinessCard'
url2 = 'https://avabotformrecog.azurewebsites.net/api/FormRecogFunction?type=Layout'


files = {'file': open('test/testFormRec/test.pdf', 'rb')}
print(files)

r = requests.post(url2, files=files)
print(r)
print(r.json())