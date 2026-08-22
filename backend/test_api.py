import requests


url = "http://127.0.0.1:5000/predict"


data = {
    "size": 1000,
    "bedrooms": 2,
    "people": 4,
    "electricity": 220,
    "water": 20
}


response = requests.post(url, json=data)


print("Status Code:")
print(response.status_code)

print("\nResponse:")
print(response.json())