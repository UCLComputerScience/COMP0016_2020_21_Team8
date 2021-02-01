import requests
import json

# url ='http://localhost:7071/api/testFunction?query=\"How is the stock price\"'
url = 'https://avabotqaapi.azurewebsites.net/api/testfunction?query="How is the stock price"'
files = {'file': open('/Users/chaozy/Desktop/CS/UCL_Year2/COMP0016/testQA/AnnualReport.pdf', 'rb')}
r = requests.post(url, files=files)

data = r.text
print(r)
print(r.json())