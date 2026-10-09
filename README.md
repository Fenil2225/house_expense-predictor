# 🏡 House Expense Predictor

### Machine Learning Based Expense Estimation System

House Expense Predictor is a Python-based Machine Learning project that estimates monthly household expenses using important factors such as house size, bedrooms, family members, electricity usage, and water usage.

The project combines Machine Learning with an interactive web dashboard to make expense prediction simple and understandable.

## 🚀 Key Highlights

- **Expense Prediction:** Estimate monthly household expenses from user inputs.
- **Machine Learning:** Uses Linear Regression for prediction.
- **Data Analysis:** Explore household expense statistics.
- **Interactive Charts:** Visualize data using Chart.js.
- **House Comparison:** Compare predicted expenses for two houses.
- **Performance Evaluation:** View R² Score, MAE, and RMSE.
- **Theme Switching:** Switch between light and dark modes.
- **Responsive Interface:** Access the dashboard on different screen sizes.

## 🧰 Tech Stack

| Category | Technologies |
|---|---|
| Programming | Python, JavaScript |
| Frontend | HTML, CSS |
| Backend | Flask |
| Data Processing | Pandas, NumPy |
| Machine Learning | Scikit-learn |
| Model Storage | Joblib |
| Visualization | Chart.js |

## 🧠 How It Works

1. The user enters household information.
2. The frontend sends the input to the Flask backend.
3. The trained Linear Regression model processes the input.
4. The model predicts the estimated monthly expense.
5. The dashboard displays the result and related analytics.

## 📥 Input Parameters

The prediction model uses five input features:

| Feature | Description |
|---|---|
| House Size | Size of the house |
| Bedrooms | Number of bedrooms |
| People | Number of household members |
| Electricity | Electricity usage |
| Water | Water usage |

**Prediction Output:** Estimated monthly household expense.

## 📊 Dashboard Modules

- **Prediction Module:** Estimates household expenses.
- **Analytics Module:** Displays dataset statistics.
- **Visualization Module:** Shows expense distributions and bedroom-wise averages.
- **Comparison Module:** Compares predicted expenses between two houses.
- **Model Evaluation Module:** Displays regression performance metrics.

## 📂 Folder Structure

```text
House-Expense-Predictor/
│
├── backend/
│   ├── app.py
│   ├── model.py
│   ├── model.pkl
│   └── house_expenses.csv
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   └── favicon.png
│
├── venv/
├── .gitignore
├── README.md
└── requirement.txt
```

## ⚙️ Getting Started

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd House-Expense-Predictor
```

### 2. Create a Virtual Environment

```bash
python -m venv venv
```

### 3. Activate the Environment

For Windows PowerShell:

```powershell
.\venv\Scripts\Activate.ps1
```

### 4. Install Dependencies

```bash
pip install -r requirement.txt
```

### 5. Start the Application

```bash
python backend/app.py
```

### 6. Open in Browser

Visit `http://127.0.0.1:5000/`.

## 🎓 Learning Outcomes

This project demonstrates practical implementation of:

- Data handling and analysis with Pandas and NumPy.
- Regression-based Machine Learning.
- Model evaluation using Scikit-learn.
- REST API development with Flask.
- Frontend and backend integration.
- Interactive data visualization.

## 🔭 Future Scope

- Add more features that influence household expenses.
- Experiment with additional regression algorithms.
- Store and review previous predictions.
- Generate downloadable expense reports.
- Expand the analytics dashboard.

## 👨‍💻 Project Details

**Project:** House Expense Predictor  
**Category:** Python for Data Science  
**Application:** Household Expense Estimation  
**Model:** Linear Regression

---

*Developed as an educational project to explore Machine Learning, data analysis, and web development.*
