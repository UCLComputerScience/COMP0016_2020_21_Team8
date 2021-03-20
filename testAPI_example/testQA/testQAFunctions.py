import requests
import json


url = 'http://20.77.57.60:5000'


files = {'file': open('testAPI_example/testfiles/test.pdf', 'rb')}
print(files)

r = requests.post(url, files=files)
print(r)
print(r.text)
