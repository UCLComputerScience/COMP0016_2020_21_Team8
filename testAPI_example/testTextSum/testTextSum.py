import requests
import json

url = 'https://textsumapi.azurewebsites.net/api/TextSummary'
files = {'file': open('testAPI_example/testfiles/test.pdf', 'rb')}
r = requests.post(url, files=files)

data = r.text
print(r)
print(r.json())
