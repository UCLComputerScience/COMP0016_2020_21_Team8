import requests
import json

url = 'https://textsumapi.azurewebsites.net/api/TextSummary'
url_local = 'http://localhost:7071/api/TextSummary'
files = {'file': open('/Users/chaozy/Desktop/CS/UCL_Year2/COMP0016_2020_21_Team8/testAPI_example/testfiles/demoTestFile.pdf ', 'rb')}
r = requests.post(url_local, files=files)

data = r.text
print(r)
print(r.json())
