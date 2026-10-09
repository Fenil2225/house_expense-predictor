
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import joblib
import pandas as pd
from pathlib import Path
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error

app = Flask(__name__)
CORS(app)

BASE_DIR = Path(__file__).resolve().parent
FRONTEND_DIR = BASE_DIR.parent / "frontend"

model = joblib.load(BASE_DIR / "model.pkl")
dataset = pd.read_csv(BASE_DIR / "house_expenses.csv")

X_all = dataset[
    ["Size", "Bedrooms", "People", "Electricity", "Water"]
]
y_all = dataset["Expense"]

X_train, X_test, y_train, y_test = train_test_split(
    X_all,
    y_all,
    test_size=0.2,
    random_state=42
)

test_preds = model.predict(X_test)
test_r2 = float(r2_score(y_test, test_preds))
test_mae = float(mean_absolute_error(y_test, test_preds))
test_rmse = float(np.sqrt(mean_squared_error(y_test, test_preds)))

test_evaluation_points = [
    {
        "actual": round(float(actual), 2),
        "predicted": round(float(predicted), 2)
    }
    for actual, predicted in zip(y_test, test_preds)
]


@app.route("/")
def home():
    return send_from_directory(FRONTEND_DIR, "index.html")


@app.route("/style.css")
def serve_css():
    return send_from_directory(FRONTEND_DIR, "style.css")


@app.route("/script.js")
def serve_js():
    return send_from_directory(FRONTEND_DIR, "script.js")


@app.route("/favicon.png")
def serve_favicon():
    return send_from_directory(FRONTEND_DIR, "favicon.png")


@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()

        input_df = pd.DataFrame(
            [[
                float(data["size"]),
                float(data["bedrooms"]),
                float(data["people"]),
                float(data["electricity"]),
                float(data["water"])
            ]],
            columns=["Size", "Bedrooms", "People", "Electricity", "Water"]
        )

        predicted_expense = round(float(model.predict(input_df)[0]), 2)

        return jsonify({
            "success": True,
            "predicted_expense": predicted_expense
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 400


@app.route("/stats", methods=["GET"])
def stats():
    try:
        total_houses = int(len(dataset))
        average_expense = float(dataset["Expense"].mean())
        minimum_expense = float(dataset["Expense"].min())
        maximum_expense = float(dataset["Expense"].max())
        median_expense = float(dataset["Expense"].median())

        bedroom_avg = (
            dataset.groupby("Bedrooms")["Expense"]
            .mean()
            .round(2)
            .to_dict()
        )

        bedrooms_data = [
            {"bedrooms": int(k), "average_expense": float(v)}
            for k, v in sorted(bedroom_avg.items())
        ]

        bins = [
            5000, 7500, 10000, 12500, 15000,
            17500, 20000, 22500, 25000
        ]

        bin_labels = [
            "₹5k - ₹7.5k",
            "₹7.5k - ₹10k",
            "₹10k - ₹12.5k",
            "₹12.5k - ₹15k",
            "₹15k - ₹17.5k",
            "₹17.5k - ₹20k",
            "₹20k - ₹22.5k",
            "₹22.5k - ₹25k"
        ]

        cut_series = pd.cut(
            dataset["Expense"],
            bins=bins,
            labels=bin_labels,
            right=False
        )

        hist_counts = cut_series.value_counts().sort_index().to_dict()

        expense_distribution = [
            {"range": label, "count": int(hist_counts.get(label, 0))}
            for label in bin_labels
        ]

        return jsonify({
            "success": True,
            "total_houses": total_houses,
            "average_expense": round(average_expense, 2),
            "minimum_expense": round(minimum_expense, 2),
            "maximum_expense": round(maximum_expense, 2),
            "median_expense": round(median_expense, 2),
            "r2_score": round(test_r2 * 100, 2),
            "mae": round(test_mae, 2),
            "rmse": round(test_rmse, 2),
            "test_predictions": test_evaluation_points,
            "bedrooms_data": bedrooms_data,
            "expense_distribution": expense_distribution
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 400


@app.route("/compare", methods=["POST"])
def compare():
    try:
        data = request.get_json() or {}

        house1_data = data.get("house1") or data.get("houseA") or {}
        house2_data = data.get("house2") or data.get("houseB") or {}

        def predict_house(house):
            input_df = pd.DataFrame(
                [[
                    float(house["size"]),
                    float(house["bedrooms"]),
                    float(house["people"]),
                    float(house["electricity"]),
                    float(house["water"])
                ]],
                columns=["Size", "Bedrooms", "People", "Electricity", "Water"]
            )

            return round(float(model.predict(input_df)[0]), 2)

        pred1 = predict_house(house1_data)
        pred2 = predict_house(house2_data)

        h1 = {
            "size": float(house1_data["size"]),
            "bedrooms": float(house1_data["bedrooms"]),
            "people": float(house1_data["people"]),
            "electricity": float(house1_data["electricity"]),
            "water": float(house1_data["water"]),
            "predicted_expense": pred1
        }

        h2 = {
            "size": float(house2_data["size"]),
            "bedrooms": float(house2_data["bedrooms"]),
            "people": float(house2_data["people"]),
            "electricity": float(house2_data["electricity"]),
            "water": float(house2_data["water"]),
            "predicted_expense": pred2
        }

        diff = round(pred2 - pred1, 2)
        pct_diff = round(diff / pred1 * 100, 2) if pred1 != 0 else 0

        return jsonify({
            "success": True,
            "house1": h1,
            "house2": h2,
            "difference": diff,
            "percent_difference": pct_diff
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 400


@app.route("/data", methods=["GET"])
def get_data():
    try:
        return jsonify({
            "success": True,
            "data": dataset.to_dict(orient="records")
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 400


if __name__ == "__main__":
    app.run(debug=True, port=5000)
