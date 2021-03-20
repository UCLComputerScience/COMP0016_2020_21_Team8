import requests

question = 'what is randoop?'

url ='http://20.77.57.60:5000?query='+question


r = requests.get(url)
print(r)
print(r.text)