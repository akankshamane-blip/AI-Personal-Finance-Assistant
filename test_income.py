import requests

url = "http://127.0.0.1:5000/api/income"

data = {
    "user_id": 3,
    "category_id": 1,
    "amount": 50000,
    "income_date": "2026-10-08",
    "description": "Monthly Salary"
}

response = requests.post(url, json=data)

print(response.status_code)
print(response.json())