from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
from pathlib import Path

from sklearn.metrics import r2_score, mean_absolute_error


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
# LOAD DATASET
# ==========================================

dataset = pd.read_csv(
    BASE_DIR / "house_expenses.csv"
)


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

        input_data = [[

            size,
            bedrooms,
            people,
            electricity,
            water

        ]]


        # Prediction

        prediction = model.predict(
            input_data
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
# STATISTICS + MODEL PERFORMANCE
# ==========================================

@app.route("/stats", methods=["GET"])
def stats():

    try:

        # Features

        X = dataset[[
            "Size",
            "Bedrooms",
            "People",
            "Electricity",
            "Water"
        ]]


        # Target

        y = dataset["Expense"]


        # Model predictions

        predictions = model.predict(X)


        # R2 Score

        r2 = r2_score(
            y,
            predictions
        )


        # Mean Absolute Error

        mae = mean_absolute_error(
            y,
            predictions
        )


        # Dataset statistics

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

            "r2_score":
                round(
                    float(r2 * 100),
                    2
                ),

            "mae":
                round(
                    float(mae),
                    2
                )

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