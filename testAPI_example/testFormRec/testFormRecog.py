import requests

import requests
import json

url1 = 'https://avabotformrecog.azurewebsites.net/api/FormRecogFunction?type=BusinessCard'
url2 = 'https://avabotformrecog.azurewebsites.net/api/FormRecogFunction?type=Layout'

files1 = {'file': open('testAPI_example/testfiles/card.jpg', 'rb')}
files2 = {'file': open('testAPI_example/testfiles/form.pdf', 'rb')}

r = requests.post(url1, files=files1)
print(r)
print(r.json())
