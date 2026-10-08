import requests

url = "http://127.0.0.1:5000/api/register"

data = {
    "name": "Test User",
    "email": "testuser@gmail.com",
    "password": "Test123"
}

response = requests.post(url, json=data)

print(response.status_code)
print(response.json())