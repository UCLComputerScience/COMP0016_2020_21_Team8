import requests

# url = 'http://localhost:5000?query="How is our gamming industry?"'
url ='http://51.11.38.199:5000?query="How is our gamming industry?'


r = requests.get(url)
print(r)
print(r.text)