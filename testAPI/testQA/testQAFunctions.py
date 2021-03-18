import requests
import json

# url ='http://localhost:7071/api/testFunction?query=\"How is the stock price\"'
# url = 'http://localhost:5000'
url = 'http://51.11.38.199:5000'


files = {'file': open('/Users/chaozy/Desktop/CS/UCL_Year2/COMP0016/COMP0016_2020_21_Team8/test/testQA/testQASystemPDF4.pdf', 'rb')}
print(files)

r = requests.post(url, files=files)
print(r)
print(r.text)