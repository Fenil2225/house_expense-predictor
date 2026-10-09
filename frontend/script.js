// ==========================================
// API URL
// ==========================================

const isLocalFrontend =
    window.location.protocol === "file:" ||
    (["localhost", "127.0.0.1", "::1"].includes(window.location.hostname) &&
        window.location.port !== "5000");
const API_URL = isLocalFrontend
    ? "http://127.0.0.1:5000"
    : "";


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


            // Record latest prediction
            window.latestPrediction = {
                size: size,
                bedrooms: bedrooms,
                people: people,
                electricity: electricity,
                water: water,
                expense: expense,
                category: category.name,
                date: new Date().toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit"
                }),
                fullTimestamp: new Date().toLocaleString("en-IN")
            };


            // Save history

            savePrediction(
                size,
                bedrooms,
                people,
                electricity,
                water,
                expense,
                category.name
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


            const maeEl = document.getElementById("modelMae");
            if (maeEl && result.mae !== undefined) {
                maeEl.innerText =
                    "₹" +
                    Number(result.mae).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    });
            }


            const rmseEl = document.getElementById("modelRmse");
            if (rmseEl && result.rmse !== undefined) {
                rmseEl.innerText =
                    "₹" +
                    Number(result.rmse).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    });
            }


            window.testPredictions = result.test_predictions || [];
            window.statsData = result;


            // If dataset is already available, refresh charts to ensure scatter plot has test data
            if (window.houseDataset && !scatterChart) {
                createCharts(window.houseDataset);
            }

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

let distributionChart = null;

let bedroomsChart = null;

let scatterChart = null;


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
        sizeChart = null;
    }

    if (electricityChart) {
        electricityChart.destroy();
        electricityChart = null;
    }

    if (distributionChart) {
        distributionChart.destroy();
        distributionChart = null;
    }

    if (bedroomsChart) {
        bedroomsChart.destroy();
        bedroomsChart = null;
    }

    if (scatterChart) {
        scatterChart.destroy();
        scatterChart = null;
    }


    // ======================================
    // 1. SIZE CHART (Existing)
    // ======================================

    const sizeEl = document.getElementById("sizeExpenseChart");
    if (sizeEl) {
        sizeChart =
            new Chart(
                sizeEl,
                {
                    type: "line",
                    data: {
                        labels: sizeLabels,
                        datasets: [
                            {
                                label: "Monthly Expense",
                                data: expenseValues,
                                borderColor: "#6366f1",
                                backgroundColor: "rgba(99,102,241,0.12)",
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


    // ======================================
    // 2. ELECTRICITY CHART (Existing)
    // ======================================

    const elecEl = document.getElementById("electricityExpenseChart");
    if (elecEl) {
        electricityChart =
            new Chart(
                elecEl,
                {
                    type: "line",
                    data: {
                        labels: electricityLabels,
                        datasets: [
                            {
                                label: "Monthly Expense",
                                data: expenseValues,
                                borderColor: "#8b5cf6",
                                backgroundColor: "rgba(139,92,246,0.12)",
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


    // ======================================
    // 3. EXPENSE DISTRIBUTION HISTOGRAM (New)
    // ======================================

    const distEl = document.getElementById("expenseDistributionChart");
    if (distEl) {
        const bins = [
            { label: "₹5k - ₹7.5k", min: 5000, max: 7500, count: 0 },
            { label: "₹7.5k - ₹10k", min: 7500, max: 10000, count: 0 },
            { label: "₹10k - ₹12.5k", min: 10000, max: 12500, count: 0 },
            { label: "₹12.5k - ₹15k", min: 12500, max: 15000, count: 0 },
            { label: "₹15k - ₹17.5k", min: 15000, max: 17500, count: 0 },
            { label: "₹17.5k - ₹20k", min: 17500, max: 20000, count: 0 },
            { label: "₹20k - ₹22.5k", min: 20000, max: 22500, count: 0 },
            { label: "₹22.5k - ₹25k", min: 22500, max: 25000, count: 0 }
        ];

        data.forEach(item => {
            const exp = Number(item.Expense);
            for (let b of bins) {
                if (exp >= b.min && (b.max === 25000 ? exp <= b.max : exp < b.max)) {
                    b.count++;
                    break;
                }
            }
        });

        distributionChart =
            new Chart(
                distEl,
                {
                    type: "bar",
                    data: {
                        labels: bins.map(b => b.label),
                        datasets: [
                            {
                                label: "Number of Houses",
                                data: bins.map(b => b.count),
                                backgroundColor: "rgba(124, 58, 237, 0.75)",
                                hoverBackgroundColor: "#7c3aed",
                                borderColor: "#6366f1",
                                borderWidth: 1.5,
                                borderRadius: 8
                            }
                        ]
                    },
                    options: getChartOptions({
                        xTitle: "Expense Bracket",
                        yTitle: "Number of Houses",
                        tooltipSuffix: " houses"
                    })
                }
            );
    }


    // ======================================
    // 4. BEDROOMS VS AVERAGE EXPENSE (New)
    // ======================================

    const bedEl = document.getElementById("bedroomsExpenseChart");
    if (bedEl) {
        const bedMap = {};
        data.forEach(item => {
            const b = Number(item.Bedrooms);
            if (!bedMap[b]) bedMap[b] = { sum: 0, count: 0 };
            bedMap[b].sum += Number(item.Expense);
            bedMap[b].count++;
        });

        const sortedBeds = Object.keys(bedMap).map(Number).sort((a, b) => a - b);
        const bedLabels = sortedBeds.map(b => `${b} Bedroom${b > 1 ? "s" : ""}`);
        const bedAverages = sortedBeds.map(b => Math.round(bedMap[b].sum / bedMap[b].count));

        bedroomsChart =
            new Chart(
                bedEl,
                {
                    type: "bar",
                    data: {
                        labels: bedLabels,
                        datasets: [
                            {
                                label: "Average Monthly Expense",
                                data: bedAverages,
                                backgroundColor: "rgba(99, 102, 241, 0.75)",
                                hoverBackgroundColor: "#4f46e5",
                                borderColor: "#4338ca",
                                borderWidth: 1.5,
                                borderRadius: 8
                            }
                        ]
                    },
                    options: getChartOptions({
                        xTitle: "Bedrooms Count",
                        yTitle: "Average Monthly Expense",
                        yCurrency: true,
                        tooltipCurrency: true
                    })
                }
            );
    }


    // ======================================
    // 5. ACTUAL VS PREDICTED SCATTER PLOT (New)
    // ======================================

    const scatterEl = document.getElementById("actualVsPredictedChart");
    if (scatterEl) {
        let testPts = [];

        if (window.testPredictions && window.testPredictions.length > 0) {
            testPts = window.testPredictions.map(p => ({
                x: Number(p.actual),
                y: Number(p.predicted)
            }));
        } else {
            // Fallback: estimate from dataset if stats hasn't returned yet
            testPts = data.slice(0, 200).map(item => ({
                x: Number(item.Expense),
                y: Number(item.Expense)
            }));
        }

        // Determine min and max for ideal fit line (y = x)
        const allVals = testPts.flatMap(pt => [pt.x, pt.y]);
        const minVal = Math.floor(Math.min(...allVals, 5000) / 1000) * 1000;
        const maxVal = Math.ceil(Math.max(...allVals, 23000) / 1000) * 1000;

        scatterChart =
            new Chart(
                scatterEl,
                {
                    type: "scatter",
                    data: {
                        datasets: [
                            {
                                type: "scatter",
                                label: "Test Houses (Actual vs Predicted)",
                                data: testPts,
                                backgroundColor: "rgba(99, 102, 241, 0.65)",
                                borderColor: "#4f46e5",
                                borderWidth: 1,
                                pointRadius: 4,
                                pointHoverRadius: 6
                            },
                            {
                                type: "line",
                                label: "Ideal Model Fit (y = x)",
                                data: [
                                    { x: minVal, y: minVal },
                                    { x: maxVal, y: maxVal }
                                ],
                                borderColor: "rgba(168, 85, 247, 0.85)",
                                borderDash: [6, 6],
                                borderWidth: 2,
                                pointRadius: 0,
                                fill: false,
                                tension: 0
                            }
                        ]
                    },
                    options: getChartOptions({
                        showLegend: true,
                        xTitle: "Actual Expense (₹)",
                        yTitle: "Predicted Expense (₹)",
                        xCurrency: true,
                        yCurrency: true,
                        isScatter: true
                    })
                }
            );
    }

}


// ==========================================
// CHART OPTIONS (Theme Aware)
// ==========================================

function getChartOptions(config = {}) {

    const dark =
        document.body.classList.contains(
            "dark-theme"
        );

    const tickColor =
        dark
            ? "#94a3b8"
            : "#6b7280";

    const gridColor =
        dark
            ? "#1e293b"
            : "#f1f5f9";


    return {

        responsive: true,

        maintainAspectRatio: false,

        plugins: {

            legend: {

                display: !!config.showLegend,

                labels: {
                    color: tickColor,
                    font: {
                        family: "inherit",
                        size: 12
                    }
                }

            },

            tooltip: {

                backgroundColor:
                    dark
                        ? "rgba(17, 24, 39, 0.95)"
                        : "rgba(255, 255, 255, 0.95)",

                titleColor:
                    dark
                        ? "#f9fafb"
                        : "#111827",

                bodyColor:
                    dark
                        ? "#e2e8f0"
                        : "#374151",

                borderColor:
                    dark
                        ? "#334155"
                        : "#e5e7eb",

                borderWidth: 1,

                padding: 10,

                callbacks: {

                    label: function (context) {

                        if (config.isScatter) {
                            if (context.dataset.type === "line") {
                                return "Perfect Prediction Line (y = x)";
                            }
                            const x = Number(context.parsed.x);
                            const y = Number(context.parsed.y);
                            const err = Math.abs(Math.round(x - y));
                            return `Actual: ₹${x.toLocaleString("en-IN")} | Pred: ₹${y.toLocaleString("en-IN")} | Diff: ₹${err.toLocaleString("en-IN")}`;
                        }

                        const val =
                            context.parsed.y !== undefined
                                ? context.parsed.y
                                : context.raw;

                        if (config.tooltipCurrency || config.yCurrency) {
                            return (
                                (context.dataset.label || "Expense") +
                                ": ₹" +
                                Number(val).toLocaleString("en-IN")
                            );
                        }

                        if (config.tooltipSuffix) {
                            return (
                                (context.dataset.label || "Count") +
                                ": " +
                                Number(val).toLocaleString("en-IN") +
                                config.tooltipSuffix
                            );
                        }

                        return (
                            (context.dataset.label
                                ? context.dataset.label + ": "
                                : "") +
                            Number(val).toLocaleString("en-IN")
                        );

                    }

                }

            }

        },

        scales: {

            x: {

                title: {
                    display: !!config.xTitle,
                    text: config.xTitle || "",
                    color: tickColor,
                    font: {
                        size: 11,
                        weight: "bold"
                    }
                },

                ticks: {

                    color: tickColor,

                    callback: function (value, index) {
                        if (config.xCurrency && typeof value === "number") {
                            return "₹" + (value >= 1000 ? (value / 1000) + "k" : value);
                        }
                        if (this.getLabelForValue) {
                            return this.getLabelForValue(value);
                        }
                        return value;
                    }

                },

                grid: {

                    color: gridColor

                }

            },

            y: {

                title: {
                    display: !!config.yTitle,
                    text: config.yTitle || "",
                    color: tickColor,
                    font: {
                        size: 11,
                        weight: "bold"
                    }
                },

                ticks: {

                    color: tickColor,

                    callback: function (value) {
                        if (config.yCurrency && typeof value === "number") {
                            return "₹" + (value >= 1000 ? (value / 1000) + "k" : value);
                        }
                        return value;
                    }

                },

                grid: {

                    color: gridColor

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
    electricity,
    water,
    expense,
    category
) {

    let history =
        JSON.parse(
            localStorage.getItem(
                "predictionHistory"
            )
        ) || [];


    const prediction = {

        size: size,

        bedrooms: bedrooms,

        people: people,

        electricity: electricity !== undefined ? electricity : 0,

        water: water !== undefined ? water : 0,

        expense: expense,

        category: category || "● NORMAL",

        date:
            new Date()
                .toLocaleTimeString(
                    "en-IN",
                    {
                        hour: "2-digit",
                        minute: "2-digit"
                    }
                ),

        fullTimestamp:
            new Date().toLocaleString("en-IN")

    };


    history.unshift(
        prediction
    );


    // Keep last 10 predictions

    history =
        history.slice(
            0,
            10
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
// DOWNLOAD PREDICTION REPORT AS CSV
// ==========================================

function downloadPredictionReport() {

    let history =
        JSON.parse(
            localStorage.getItem(
                "predictionHistory"
            )
        ) || [];


    // Fallback to latest prediction if history is empty
    if (history.length === 0 && window.latestPrediction) {
        history = [window.latestPrediction];
    }


    if (history.length === 0) {
        alert("⚠️ No predictions available yet. Please predict an expense first to generate your report!");
        return;
    }


    const avgDatasetExpense = 13957.41;

    const headers = [
        "Prediction Date & Time",
        "House Size (sq.ft)",
        "Bedrooms",
        "Occupants (People)",
        "Electricity Usage (units)",
        "Water Usage (KL)",
        "Predicted Monthly Expense (INR)",
        "Expense Category",
        "Variance from Dataset Avg (INR)"
    ];


    const rows = history.map(item => {
        const size = item.size ?? "-";
        const bedrooms = item.bedrooms ?? "-";
        const people = item.people ?? "-";
        const electricity = item.electricity ?? "-";
        const water = item.water ?? "-";
        const expense = Number(item.expense ?? 0);
        const category = (item.category || "Standard").replace(/[●·]/g, "").trim();
        const diffFromAvg = Math.round(expense - avgDatasetExpense);
        const timestamp = item.fullTimestamp || item.date || new Date().toLocaleString("en-IN");

        return [
            `"${timestamp}"`,
            size,
            bedrooms,
            people,
            electricity,
            water,
            expense,
            `"${category}"`,
            diffFromAvg
        ].join(",");
    });


    // UTF-8 BOM (\uFEFF) ensures proper rendering in Microsoft Excel & CSV viewers
    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\r\n");

    const blob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const today = new Date().toISOString().slice(0, 10);

    link.href = url;
    link.setAttribute("download", `house_expense_prediction_report_${today}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

}


// ==========================================
// COMPARE TWO HOUSES
// ==========================================

async function compareHouses() {

    const errorEl =
        document.getElementById("compareErrorMessage");

    const resultCard =
        document.getElementById("compareResult");

    const button =
        document.getElementById("compareButton");


    errorEl.innerText = "";


    const size1 =
        Number(document.getElementById("comp_size_1").value);

    const bedrooms1 =
        Number(document.getElementById("comp_bedrooms_1").value);

    const people1 =
        Number(document.getElementById("comp_people_1").value);

    const electricity1 =
        Number(document.getElementById("comp_electricity_1").value);

    const water1 =
        Number(document.getElementById("comp_water_1").value);


    const size2 =
        Number(document.getElementById("comp_size_2").value);

    const bedrooms2 =
        Number(document.getElementById("comp_bedrooms_2").value);

    const people2 =
        Number(document.getElementById("comp_people_2").value);

    const electricity2 =
        Number(document.getElementById("comp_electricity_2").value);

    const water2 =
        Number(document.getElementById("comp_water_2").value);


    // Validation
    if (
        !size1 || !bedrooms1 || !people1 ||
        document.getElementById("comp_electricity_1").value === "" ||
        document.getElementById("comp_water_1").value === "" ||
        !size2 || !bedrooms2 || !people2 ||
        document.getElementById("comp_electricity_2").value === "" ||
        document.getElementById("comp_water_2").value === ""
    ) {
        errorEl.innerText = "⚠️ Please fill all fields for both houses.";
        return;
    }


    if (size1 < 100 || size2 < 100) {
        errorEl.innerText = "⚠️ House size must be at least 100 sq.ft for both houses.";
        return;
    }


    if (bedrooms1 < 1 || bedrooms2 < 1) {
        errorEl.innerText = "⚠️ Number of bedrooms must be at least 1 for both houses.";
        return;
    }


    if (people1 < 1 || people2 < 1) {
        errorEl.innerText = "⚠️ Number of people must be at least 1 for both houses.";
        return;
    }


    if (electricity1 < 0 || electricity2 < 0) {
        errorEl.innerText = "⚠️ Electricity usage cannot be negative.";
        return;
    }


    if (water1 < 0 || water2 < 0) {
        errorEl.innerText = "⚠️ Water usage cannot be negative.";
        return;
    }


    button.disabled = true;
    button.innerText = "⏳ Comparing Houses...";


    try {

        const response = await fetch(`${API_URL}/compare`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                house1: {
                    size: size1,
                    bedrooms: bedrooms1,
                    people: people1,
                    electricity: electricity1,
                    water: water1
                },
                house2: {
                    size: size2,
                    bedrooms: bedrooms2,
                    people: people2,
                    electricity: electricity2,
                    water: water2
                }
            })
        });


        const res = await response.json();


        if (res.success) {

            const exp1 = Number(res.house1.predicted_expense);
            const exp2 = Number(res.house2.predicted_expense);
            const diff = Number(res.difference);
            const pct = Number(res.percent_difference);

            document.getElementById("compA_Expense").innerText =
                "₹" + exp1.toLocaleString("en-IN");

            document.getElementById("compB_Expense").innerText =
                "₹" + exp2.toLocaleString("en-IN");

            const costPerSqft1 = (exp1 / size1).toFixed(2);
            const costPerPerson1 = Math.round(exp1 / people1).toLocaleString("en-IN");
            document.getElementById("compA_Sub").innerText =
                `₹${costPerSqft1}/sq.ft · ₹${costPerPerson1}/person`;

            const costPerSqft2 = (exp2 / size2).toFixed(2);
            const costPerPerson2 = Math.round(exp2 / people2).toLocaleString("en-IN");
            document.getElementById("compB_Sub").innerText =
                `₹${costPerSqft2}/sq.ft · ₹${costPerPerson2}/person`;

            const badge = document.getElementById("compareDifferenceBadge");
            const summaryText = document.getElementById("compareSummaryText");

            if (diff > 0) {
                badge.innerText = `+₹${diff.toLocaleString("en-IN")} (+${pct}%)`;
                badge.style.background = "rgba(239, 68, 68, 0.15)";
                badge.style.color = "#ef4444";
                summaryText.innerText = `House Option B is estimated to cost ₹${diff.toLocaleString("en-IN")} (${pct}%) more per month than House Option A.`;
            } else if (diff < 0) {
                const absDiff = Math.abs(diff);
                const absPct = Math.abs(pct);
                badge.innerText = `-₹${absDiff.toLocaleString("en-IN")} (-${absPct}%)`;
                badge.style.background = "rgba(16, 185, 129, 0.15)";
                badge.style.color = "#10b981";
                summaryText.innerText = `House Option B is estimated to save ₹${absDiff.toLocaleString("en-IN")} (${absPct}%) per month compared to House Option A.`;
            } else {
                badge.innerText = `₹0 (0%)`;
                badge.style.background = "rgba(99, 102, 241, 0.15)";
                badge.style.color = "#6366f1";
                summaryText.innerText = "Both house options have identical estimated monthly expenses.";
            }

            const sizeDiff = size2 - size1;
            const bedDiff = bedrooms2 - bedrooms1;
            const peopleDiff = people2 - people1;
            const elecDiff = electricity2 - electricity1;

            const formatDiff = (val, unit) => {
                if (val > 0) return `<span class="compare-diff-pos">+${val} ${unit}</span>`;
                if (val < 0) return `<span class="compare-diff-neg">${val} ${unit}</span>`;
                return `<span class="compare-diff-zero">Same</span>`;
            };

            const breakdown = document.getElementById("compareBreakdown");
            breakdown.innerHTML = `
                <div class="compare-breakdown-item">
                    <small>Size Difference</small>
                    <strong>${size1} vs ${size2} sq.ft</strong>
                    ${formatDiff(sizeDiff, "sq.ft")}
                </div>
                <div class="compare-breakdown-item">
                    <small>Bedrooms</small>
                    <strong>${bedrooms1} vs ${bedrooms2} BHK</strong>
                    ${formatDiff(bedDiff, "beds")}
                </div>
                <div class="compare-breakdown-item">
                    <small>Occupants</small>
                    <strong>${people1} vs ${people2} People</strong>
                    ${formatDiff(peopleDiff, "people")}
                </div>
                <div class="compare-breakdown-item">
                    <small>Electricity</small>
                    <strong>${electricity1} vs ${electricity2} units</strong>
                    ${formatDiff(elecDiff, "units")}
                </div>
            `;

            resultCard.style.display = "block";
            resultCard.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

        } else {
            errorEl.innerText = "❌ " + (res.error || "Comparison calculation failed.");
        }

    } catch (err) {
        console.error(err);
        errorEl.innerText = "❌ Cannot connect to backend server. Make sure Flask server is running.";
    } finally {
        button.disabled = false;
        button.innerText = "⚖️ Compare Houses";
    }

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