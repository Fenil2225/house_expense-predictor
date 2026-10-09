import requests

BASE_URL = "http://127.0.0.1:5000"

print("--- Testing /predict ---")
pred_data = {
    "size": 1000,
    "bedrooms": 2,
    "people": 4,
    "electricity": 220,
    "water": 20
}
res_pred = requests.post(f"{BASE_URL}/predict", json=pred_data)
print("Status:", res_pred.status_code)
print("Response:", res_pred.json())

print("\n--- Testing /stats ---")
res_stats = requests.get(f"{BASE_URL}/stats")
print("Status:", res_stats.status_code)
stats_json = res_stats.json()
print("R2:", stats_json.get("r2_score"), "MAE:", stats_json.get("mae"), "RMSE:", stats_json.get("rmse"))
print("Test predictions count:", len(stats_json.get("test_predictions", [])))

print("\n--- Testing /compare ---")
comp_data = {
    "house1": {"size": 1000, "bedrooms": 2, "people": 3, "electricity": 200, "water": 15},
    "house2": {"size": 1500, "bedrooms": 3, "people": 4, "electricity": 300, "water": 20}
}
res_comp = requests.post(f"{BASE_URL}/compare", json=comp_data)
print("Status:", res_comp.status_code)
print("Response:", res_comp.json())