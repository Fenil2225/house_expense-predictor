// ==========================================
// API URL
// ==========================================

const API_URL =
    "http://127.0.0.1:5000";


// ==========================================
// PREDICTION
// ==========================================

async function predictExpense() {

    const button =
        document.getElementById(
            "predictButton"
        );


    const errorMessage =
        document.getElementById(
            "errorMessage"
        );


    // Clear previous error

    errorMessage.innerText = "";


    // ======================================
    // GET INPUTS
    // ======================================

    const size =
        Number(
            document.getElementById(
                "size"
            ).value
        );


    const bedrooms =
        Number(
            document.getElementById(
                "bedrooms"
            ).value
        );


    const people =
        Number(
            document.getElementById(
                "people"
            ).value
        );


    const electricity =
        Number(
            document.getElementById(
                "electricity"
            ).value
        );


    const water =
        Number(
            document.getElementById(
                "water"
            ).value
        );


    // ======================================
    // VALIDATION
    // ======================================

    if (
        !size ||
        !bedrooms ||
        !people ||
        electricity === "" ||
        water === ""
    ) {

        errorMessage.innerText =
            "⚠️ Please fill all fields.";

        return;
    }


    if (size < 100) {

        errorMessage.innerText =
            "⚠️ House size must be at least 100 sq.ft.";

        return;
    }


    if (bedrooms < 1) {

        errorMessage.innerText =
            "⚠️ Bedrooms must be at least 1.";

        return;
    }


    if (people < 1) {

        errorMessage.innerText =
            "⚠️ Number of people must be at least 1.";

        return;
    }


    if (electricity < 0) {

        errorMessage.innerText =
            "⚠️ Electricity cannot be negative.";

        return;
    }


    if (water < 0) {

        errorMessage.innerText =
            "⚠️ Water usage cannot be negative.";

        return;
    }


    // ======================================
    // LOADING
    // ======================================

    button.disabled = true;

    button.innerText =
        "⏳ Analyzing...";


    try {

        // ==================================
        // API CALL
        // ==================================

        const response =
            await fetch(
                `${API_URL}/predict`,
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        size: size,

                        bedrooms:
                            bedrooms,

                        people:
                            people,

                        electricity:
                            electricity,

                        water:
                            water

                    })

                }
            );


        const result =
            await response.json();


        // ==================================
        // SUCCESS
        // ==================================

        if (result.success) {

            const expense =
                Number(
                    result.predicted_expense
                );


            const category =
                getExpenseCategory(
                    expense
                );


            // Prediction amount

            document.getElementById(
                "prediction"
            ).innerText =
                "₹" +
                expense.toLocaleString(
                    "en-IN"
                );


            // Category

            document.getElementById(
                "expenseCategory"
            ).innerText =
                category.name;


            // Message

            document.getElementById(
                "result-message"
            ).innerText =
                category.message;


            // Input information

            document.getElementById(
                "resultSize"
            ).innerText =
                size + " sq.ft";


            document.getElementById(
                "resultBedrooms"
            ).innerText =
                bedrooms;


            document.getElementById(
                "resultPeople"
            ).innerText =
                people;


            // Save history

            savePrediction(

                size,

                bedrooms,

                people,

                expense

            );


            // Scroll result

            document
                .querySelector(
                    ".result-card"
                )
                .scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });

        }


        else {

            errorMessage.innerText =
                "❌ " +
                (
                    result.error ||
                    "Prediction failed."
                );

        }

    }


    catch (error) {

        console.error(error);

        errorMessage.innerText =
            "❌ Cannot connect to backend. Make sure Flask server is running.";

    }


    finally {

        button.disabled = false;

        button.innerText =
            "🔮 Predict Expense";

    }

}


// ==========================================
// EXPENSE CATEGORY
// ==========================================

function getExpenseCategory(
    expense
) {

    if (expense < 10000) {

        return {

            name:
                "● LOW EXPENSE",

            message:
                "Your estimated expense is relatively low."

        };

    }


    else if (expense < 20000) {

        return {

            name:
                "● MEDIUM EXPENSE",

            message:
                "Your estimated expense is within the normal range."

        };

    }


    else {

        return {

            name:
                "● HIGH EXPENSE",

            message:
                "Your estimated expense is relatively high."

        };

    }

}


// ==========================================
// LOAD STATISTICS
// ==========================================

async function loadStatistics() {

    try {

        const response =
            await fetch(
                `${API_URL}/stats`
            );


        const result =
            await response.json();


        if (result.success) {

            document.getElementById(
                "totalHouses"
            ).innerText =
                result.total_houses;


            document.getElementById(
                "averageExpense"
            ).innerText =
                "₹" +
                Number(
                    result.average_expense
                ).toLocaleString(
                    "en-IN"
                );


            document.getElementById(
                "minimumExpense"
            ).innerText =
                "₹" +
                Number(
                    result.minimum_expense
                ).toLocaleString(
                    "en-IN"
                );


            document.getElementById(
                "maximumExpense"
            ).innerText =
                "₹" +
                Number(
                    result.maximum_expense
                ).toLocaleString(
                    "en-IN"
                );


            document.getElementById(
                "modelScore"
            ).innerText =
                result.r2_score +
                "%";

        }


        else {

            console.error(
                result.error
            );

        }

    }


    catch (error) {

        console.error(
            "Statistics Error:",
            error
        );

    }

}


// ==========================================
// LOAD DATASET
// ==========================================

async function loadDataset() {

    try {

        const response =
            await fetch(
                `${API_URL}/data`
            );


        const result =
            await response.json();


        if (result.success) {

            createCharts(
                result.data
            );

        }

    }


    catch (error) {

        console.error(
            "Dataset Error:",
            error
        );

    }

}


// ==========================================
// CHART VARIABLES
// ==========================================

let sizeChart = null;

let electricityChart = null;


// ==========================================
// CREATE CHARTS
// ==========================================

function createCharts(data) {

    window.houseDataset = data;
    
    const sizeLabels =
        data.map(
            item =>
                item.Size
        );


    const expenseValues =
        data.map(
            item =>
                item.Expense
        );


    const electricityLabels =
        data.map(
            item =>
                item.Electricity
        );


    // Destroy previous charts

    if (sizeChart) {

        sizeChart.destroy();

    }


    if (electricityChart) {

        electricityChart.destroy();

    }


    // ======================================
    // SIZE CHART
    // ======================================

    sizeChart =
        new Chart(

            document.getElementById(
                "sizeExpenseChart"
            ),

            {

                type: "line",

                data: {

                    labels:
                        sizeLabels,

                    datasets: [

                        {

                            label:
                                "Monthly Expense",

                            data:
                                expenseValues,

                            borderColor:
                                "#6366f1",

                            backgroundColor:
                                "rgba(99,102,241,0.12)",

                            fill: true,

                            tension: 0.4,

                            pointRadius: 3

                        }

                    ]

                },

                options: getChartOptions()

            }

        );


    // ======================================
    // ELECTRICITY CHART
    // ======================================

    electricityChart =
        new Chart(

            document.getElementById(
                "electricityExpenseChart"
            ),

            {

                type: "line",

                data: {

                    labels:
                        electricityLabels,

                    datasets: [

                        {

                            label:
                                "Monthly Expense",

                            data:
                                expenseValues,

                            borderColor:
                                "#8b5cf6",

                            backgroundColor:
                                "rgba(139,92,246,0.12)",

                            fill: true,

                            tension: 0.4,

                            pointRadius: 3

                        }

                    ]

                },

                options: getChartOptions()

            }

        );

}


// ==========================================
// CHART OPTIONS
// ==========================================

function getChartOptions() {

    const dark =
        document.body.classList.contains(
            "dark-theme"
        );


    return {

        responsive: true,

        maintainAspectRatio: false,

        plugins: {

            legend: {

                display: false

            }

        },

        scales: {

            x: {

                ticks: {

                    color:
                        dark
                            ? "#94a3b8"
                            : "#6b7280"

                },

                grid: {

                    color:
                        dark
                            ? "#1e293b"
                            : "#f1f5f9"

                }

            },

            y: {

                ticks: {

                    color:
                        dark
                            ? "#94a3b8"
                            : "#6b7280"

                },

                grid: {

                    color:
                        dark
                            ? "#1e293b"
                            : "#f1f5f9"

                }

            }

        }

    };

}


// ==========================================
// SAVE PREDICTION HISTORY
// ==========================================

function savePrediction(
    size,
    bedrooms,
    people,
    expense
) {

    let history =
        JSON.parse(
            localStorage.getItem(
                "predictionHistory"
            )
        ) || [];


    const prediction = {

        size:
            size,

        bedrooms:
            bedrooms,

        people:
            people,

        expense:
            expense,

        date:
            new Date()
                .toLocaleTimeString(
                    "en-IN",
                    {
                        hour:
                            "2-digit",

                        minute:
                            "2-digit"
                    }
                )

    };


    history.unshift(
        prediction
    );


    // Keep only last 5

    history =
        history.slice(
            0,
            5
        );


    localStorage.setItem(
        "predictionHistory",
        JSON.stringify(
            history
        )
    );


    displayHistory();

}


// ==========================================
// DISPLAY HISTORY
// ==========================================

function displayHistory() {

    const container =
        document.getElementById(
            "recentPredictions"
        );


    let history =
        JSON.parse(
            localStorage.getItem(
                "predictionHistory"
            )
        ) || [];


    if (
        history.length === 0
    ) {

        container.innerHTML = `

            <p class="empty-history">
                No predictions yet.
            </p>

        `;

        return;

    }


    container.innerHTML =

        history.map(

            item => `

                <div class="history-card">

                    <div>

                        <strong>
                            🏠
                            ${item.size}
                            sq.ft
                        </strong>

                        <p>

                            ${item.bedrooms}
                            bedrooms

                            ·

                            ${item.people}
                            people

                        </p>

                    </div>


                    <div class="history-expense">

                        <strong>

                            ₹${Number(
                                item.expense
                            ).toLocaleString(
                                "en-IN"
                            )}

                        </strong>

                        <small>
                            ${item.date}
                        </small>

                    </div>

                </div>

            `

        ).join("");

}


// ==========================================
// THEME TOGGLE
// ==========================================

function toggleTheme() {

    document.body.classList.toggle(
        "dark-theme"
    );


    const button =
        document.getElementById(
            "themeToggle"
        );


    const dark =
        document.body.classList.contains(
            "dark-theme"
        );


    if (dark) {

        button.innerText =
            "☀️";

        localStorage.setItem(
            "theme",
            "dark"
        );

    }


    else {

        button.innerText =
            "🌙";

        localStorage.setItem(
            "theme",
            "light"
        );

    }


    // Recreate charts
    // according to theme

    if (
        window.houseDataset
    ) {

        createCharts(
            window.houseDataset
        );

    }

}


// ==========================================
// LOAD SAVED THEME
// ==========================================

function loadTheme() {

    const savedTheme =
        localStorage.getItem(
            "theme"
        );


    if (
        savedTheme === "dark"
    ) {

        document.body.classList.add(
            "dark-theme"
        );


        document.getElementById(
            "themeToggle"
        ).innerText =
            "☀️";

    }

}


// ==========================================
// DOM READY
// ==========================================

window.addEventListener(
    "DOMContentLoaded",
    async function () {

        loadTheme();

        displayHistory();

        await loadStatistics();

        await loadDataset();

    }
);