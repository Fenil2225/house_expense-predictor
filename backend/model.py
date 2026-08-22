import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import r2_score, mean_absolute_error


# ==========================================
# LOAD DATASET
# ==========================================

data = pd.read_csv(
    "backend/house_expenses.csv"
)


# ==========================================
# FEATURES
# ==========================================

X = data[
    [
        "Size",
        "Bedrooms",
        "People",
        "Electricity",
        "Water"
    ]
]


# ==========================================
# TARGET
# ==========================================

y = data["Expense"]


# ==========================================
# TRAIN TEST SPLIT
# ==========================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42
)


# ==========================================
# CREATE MODEL
# ==========================================

model = LinearRegression()


# ==========================================
# TRAIN MODEL
# ==========================================

model.fit(
    X_train,
    y_train
)


# ==========================================
# TEST MODEL
# ==========================================

predictions = model.predict(
    X_test
)


# ==========================================
# MODEL PERFORMANCE
# ==========================================

r2 = r2_score(
    y_test,
    predictions
)


mae = mean_absolute_error(
    y_test,
    predictions
)


print("--------------------------------")
print("House Expense Predictor")
print("--------------------------------")

print(
    f"R² Score: {r2 * 100:.2f}%"
)

print(
    f"MAE: ₹{mae:.2f}"
)


# ==========================================
# SAVE MODEL
# ==========================================

joblib.dump(
    model,
    "backend/model.pkl"
)


print("--------------------------------")
print("model.pkl generated successfully!")
print("--------------------------------")