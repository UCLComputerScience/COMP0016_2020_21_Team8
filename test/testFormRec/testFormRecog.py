import requests

import requests
import json

url = 'http://localhost:7071/api/FormRecogFunction?type=BusinessCard'
url2 = 'https://avabotformrecog.azurewebsites.net/api/FormRecogFunction?type=Layout'


files = {'file': open('/Users/chaozy/Desktop/CS/UCL_Year2/COMP0016/COMP0016_2020_21_Team8/test/testFormRec/Form_1.jpg', 'rb')}
print(files)

r = requests.post(url2, files=files)
print(r)
print(r.json())