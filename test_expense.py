import requests

url = "http://127.0.0.1:5000/api/expense"

data = {
    "user_id": 3,
    "category_id": 4,
    "amount": 350,
    "expense_date": "2026-10-08",
    "description": "Food"
}

response = requests.post(url, json=data)

print(response.status_code)
print(response.json())