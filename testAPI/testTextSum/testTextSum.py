import requests
import json

# url to localhsot 
# url ='http://localhost:7071/api/TextSumAPI'
# url to azure functions api
url = 'https://textsumapi.azurewebsites.net/api/textsumapi'
files = {'file': open('/Users/chaozy/Desktop/CS/UCL_Year2/COMP0016/testTextSum/test.pdf', 'rb')}
r = requests.post(url, files=files)

data = r.text
print(r)
print(r.json())