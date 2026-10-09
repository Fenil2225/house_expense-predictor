from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
from pathlib import Path

import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error


# ==========================================
# FLASK APP
# ==========================================

app = Flask(__name__)

CORS(app)

BASE_DIR = Path(__file__).resolve().parent


# ==========================================
# LOAD MODEL
# ==========================================

model = joblib.load(BASE_DIR / "model.pkl")


# ==========================================
# LOAD DATASET & PRECOMPUTE TEST METRICS
# ==========================================

dataset = pd.read_csv(
    BASE_DIR / "house_expenses.csv"
)

# Test evaluation metrics calculated on test data (20% split)
X_all = dataset[[
    "Size",
    "Bedrooms",
    "People",
    "Electricity",
    "Water"
]]
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

# 200 Test evaluation points for scatter plot
test_evaluation_points = [
    {
        "actual": round(float(act), 2),
        "predicted": round(float(pred), 2)
    }
    for act, pred in zip(y_test, test_preds)
]


# ==========================================
# HOME
# ==========================================

@app.route("/")
def home():

    return jsonify({
        "success": True,
        "message":
            "House Expense Predictor API is running!"
    })


# ==========================================
# PREDICTION API
# ==========================================

@app.route("/predict", methods=["POST"])
def predict():

    try:

        data = request.get_json()


        size = float(
            data["size"]
        )

        bedrooms = float(
            data["bedrooms"]
        )

        people = float(
            data["people"]
        )

        electricity = float(
            data["electricity"]
        )

        water = float(
            data["water"]
        )


        # ML input

        input_df = pd.DataFrame(
            [[
                size,
                bedrooms,
                people,
                electricity,
                water
            ]],
            columns=["Size", "Bedrooms", "People", "Electricity", "Water"]
        )


        # Prediction

        prediction = model.predict(
            input_df
        )


        predicted_expense = round(
            float(prediction[0]),
            2
        )


        return jsonify({

            "success": True,

            "predicted_expense":
                predicted_expense

        })


    except Exception as e:

        return jsonify({

            "success": False,

            "error": str(e)

        }), 400


# ==========================================
# STATISTICS + MODEL PERFORMANCE (TEST DATA)
# ==========================================

@app.route("/stats", methods=["GET"])
def stats():

    try:

        total_houses = int(
            len(dataset)
        )

        average_expense = float(
            dataset["Expense"].mean()
        )

        minimum_expense = float(
            dataset["Expense"].min()
        )

        maximum_expense = float(
            dataset["Expense"].max()
        )

        median_expense = float(
            dataset["Expense"].median()
        )

        # Bedrooms vs Average Expense from actual CSV
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

        # Expense distribution histogram bins
        bins = [5000, 7500, 10000, 12500, 15000, 17500, 20000, 22500, 25000]
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
        cut_series = pd.cut(dataset["Expense"], bins=bins, labels=bin_labels, right=False)
        hist_counts = cut_series.value_counts().sort_index().to_dict()
        expense_distribution = [
            {"range": lbl, "count": int(hist_counts.get(lbl, 0))}
            for lbl in bin_labels
        ]

        return jsonify({

            "success": True,

            "total_houses":
                total_houses,

            "average_expense":
                round(
                    average_expense,
                    2
                ),

            "minimum_expense":
                round(
                    minimum_expense,
                    2
                ),

            "maximum_expense":
                round(
                    maximum_expense,
                    2
                ),

            "median_expense":
                round(
                    median_expense,
                    2
                ),

            # Genuine metrics calculated on test data
            "r2_score":
                round(
                    test_r2 * 100,
                    2
                ),

            "mae":
                round(
                    test_mae,
                    2
                ),

            "rmse":
                round(
                    test_rmse,
                    2
                ),

            "test_predictions":
                test_evaluation_points,

            "bedrooms_data":
                bedrooms_data,

            "expense_distribution":
                expense_distribution

        })


    except Exception as e:

        return jsonify({

            "success": False,

            "error": str(e)

        }), 400


# ==========================================
# COMPARE TWO HOUSES API
# ==========================================

@app.route("/compare", methods=["POST"])
def compare():

    try:

        data = request.get_json() or {}

        house1_data = data.get("house1") or data.get("houseA") or {}
        house2_data = data.get("house2") or data.get("houseB") or {}

        h1_size = float(house1_data["size"])
        h1_bedrooms = float(house1_data["bedrooms"])
        h1_people = float(house1_data["people"])
        h1_electricity = float(house1_data["electricity"])
        h1_water = float(house1_data["water"])

        h2_size = float(house2_data["size"])
        h2_bedrooms = float(house2_data["bedrooms"])
        h2_people = float(house2_data["people"])
        h2_electricity = float(house2_data["electricity"])
        h2_water = float(house2_data["water"])

        h1_df = pd.DataFrame(
            [[h1_size, h1_bedrooms, h1_people, h1_electricity, h1_water]],
            columns=["Size", "Bedrooms", "People", "Electricity", "Water"]
        )
        h2_df = pd.DataFrame(
            [[h2_size, h2_bedrooms, h2_people, h2_electricity, h2_water]],
            columns=["Size", "Bedrooms", "People", "Electricity", "Water"]
        )

        pred1 = round(
            float(model.predict(h1_df)[0]),
            2
        )

        pred2 = round(
            float(model.predict(h2_df)[0]),
            2
        )

        diff = round(pred2 - pred1, 2)
        pct_diff = round((diff / pred1 * 100), 2) if pred1 != 0 else 0

        return jsonify({
            "success": True,
            "house1": {
                "size": h1_size,
                "bedrooms": h1_bedrooms,
                "people": h1_people,
                "electricity": h1_electricity,
                "water": h1_water,
                "predicted_expense": pred1
            },
            "house2": {
                "size": h2_size,
                "bedrooms": h2_bedrooms,
                "people": h2_people,
                "electricity": h2_electricity,
                "water": h2_water,
                "predicted_expense": pred2
            },
            "difference": diff,
            "percent_difference": pct_diff
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "error": str(e)
        }), 400


# ==========================================
# DATA API
# ==========================================

@app.route("/data", methods=["GET"])
def get_data():

    try:

        data = dataset.to_dict(
            orient="records"
        )


        return jsonify({

            "success": True,

            "data": data

        })


    except Exception as e:

        return jsonify({

            "success": False,

            "error": str(e)

        }), 400


# ==========================================
# RUN SERVER
# ==========================================

if __name__ == "__main__":

    app.run(
        debug=True,
        port=5000
    )