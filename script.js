// ======================================
// FINMATE AI - TRANSACTION SYSTEM
// ======================================

// Get saved transactions from browser storage
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];


// ======================================
// ADD TRANSACTION
// ======================================

const transactionForm = document.getElementById("transactionForm");
const transactionTable = document.getElementById("transactionTable");

if (transactionForm) {

    transactionForm.addEventListener("submit", function(event) {

        event.preventDefault();

        const type = document.getElementById("type").value;
        const category = document.getElementById("category").value;
        const amount = Number(document.getElementById("amount").value);
        const date = document.getElementById("date").value;
        const description = document.getElementById("description").value;

        // Create transaction object
        const transaction = {
            type: type,
            category: category,
            amount: amount,
            date: date,
            description: description
        };

        // Add transaction to array
        transactions.push(transaction);

        // Save transactions
        localStorage.setItem(
            "transactions",
            JSON.stringify(transactions)
        );

        // Show transaction on page
        addTransactionToTable(transaction);

        // Clear form
        transactionForm.reset();

        alert("Transaction added successfully!");

    });
}


// ======================================
// ADD TRANSACTION TO TABLE
// ======================================

function addTransactionToTable(transaction) {

    if (!transactionTable) return;

    const formattedDate = new Date(
        transaction.date
    ).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });

    const newRow = document.createElement("tr");

    if (transaction.type === "Income") {

        newRow.innerHTML = `
            <td>${formattedDate}</td>

            <td>
                <span class="income-badge">
                    Income
                </span>
            </td>

            <td>${transaction.category}</td>

            <td class="income-amount">
                + ₹${transaction.amount.toLocaleString("en-IN")}
            </td>

            <td>${transaction.description || "—"}</td>
        `;

    } else {

        newRow.innerHTML = `
            <td>${formattedDate}</td>

            <td>
                <span class="expense-badge">
                    Expense
                </span>
            </td>

            <td>${transaction.category}</td>

            <td class="expense-amount">
                - ₹${transaction.amount.toLocaleString("en-IN")}
            </td>

            <td>${transaction.description || "—"}</td>
        `;
    }

    transactionTable.prepend(newRow);
}


// ======================================
// LOAD SAVED TRANSACTIONS
// ======================================

if (transactionTable) {

    transactions.forEach(function(transaction) {
        addTransactionToTable(transaction);
    });

}


// ======================================
// UPDATE DASHBOARD
// ======================================

function updateDashboard() {

    const incomeElement = document.getElementById("totalIncome");
    const expenseElement = document.getElementById("totalExpenses");
    const savingsElement = document.getElementById("totalSavings");

    // If we are not on dashboard, stop
    if (!incomeElement || !expenseElement || !savingsElement) {
        return;
    }

    let totalIncome = 0;
    let totalExpenses = 0;

    // Calculate totals
    transactions.forEach(function(transaction) {

        if (transaction.type === "Income") {
            totalIncome += transaction.amount;
        }

        if (transaction.type === "Expense") {
            totalExpenses += transaction.amount;
        }

    });

    // Calculate savings
    const totalSavings = totalIncome - totalExpenses;

    // Display values
    incomeElement.textContent =
        "₹" + totalIncome.toLocaleString("en-IN");

    expenseElement.textContent =
        "₹" + totalExpenses.toLocaleString("en-IN");

    savingsElement.textContent =
        "₹" + totalSavings.toLocaleString("en-IN");
}


// Run dashboard calculation
updateDashboard();
// ======================================
// BUDGET SYSTEM
// ======================================

const budgetForm = document.getElementById("budgetForm");

let monthlyBudget =
    Number(localStorage.getItem("monthlyBudget")) || 0;


// Save Budget
if (budgetForm) {

    budgetForm.addEventListener("submit", function(event) {

        event.preventDefault();

        const budgetAmount =
            Number(document.getElementById("budgetAmount").value);

        monthlyBudget = budgetAmount;

        localStorage.setItem(
            "monthlyBudget",
            monthlyBudget
        );

        updateBudgetPage();

        alert("Monthly budget saved successfully!");

        budgetForm.reset();

    });

}


// Calculate total expenses
function calculateTotalExpenses() {

    let totalExpenses = 0;

    transactions.forEach(function(transaction) {

        if (transaction.type === "Expense") {
            totalExpenses += transaction.amount;
        }

    });

    return totalExpenses;
}


// Update Budget Page
function updateBudgetPage() {

    const budgetTotal =
        document.getElementById("budgetTotal");

    const budgetSpent =
        document.getElementById("budgetSpent");

    const budgetRemaining =
        document.getElementById("budgetRemaining");

    const budgetPercentage =
        document.getElementById("budgetPercentage");

    const budgetProgress =
        document.getElementById("budgetProgress");

    const budgetMessage =
        document.getElementById("budgetMessage");


    // If budget page is not open
    if (!budgetTotal) {
        return;
    }


    const totalSpent = calculateTotalExpenses();

    const remaining =
        monthlyBudget - totalSpent;


    let percentage = 0;

    if (monthlyBudget > 0) {

        percentage =
            (totalSpent / monthlyBudget) * 100;

    }


    // Don't show more than 100%
    const progressPercentage =
        Math.min(percentage, 100);


    // Display values
    budgetTotal.textContent =
        "₹" + monthlyBudget.toLocaleString("en-IN");

    budgetSpent.textContent =
        "₹" + totalSpent.toLocaleString("en-IN");

    budgetRemaining.textContent =
        "₹" + Math.max(remaining, 0).toLocaleString("en-IN");

    budgetPercentage.textContent =
        percentage.toFixed(1) + "%";

    budgetProgress.style.width =
        progressPercentage + "%";


    // Budget message
    if (monthlyBudget === 0) {

        budgetMessage.textContent =
            "Set a budget to start tracking your spending.";

    } else if (percentage < 50) {

        budgetMessage.textContent =
            "Great! Your spending is currently under control.";

    } else if (percentage < 80) {

        budgetMessage.textContent =
            "You are getting closer to your monthly budget.";

    } else if (percentage < 100) {

        budgetMessage.textContent =
            "⚠️ Be careful! You are close to your budget limit.";

    } else {

        budgetMessage.textContent =
            "⚠️ You have reached or exceeded your monthly budget.";

    }

}


// Load budget when page opens
updateBudgetPage();
// ======================================
// AI INSIGHTS SYSTEM
// ======================================

function generateAIInsights() {

    const healthElement =
        document.getElementById("financialHealth");

    const summaryElement =
        document.getElementById("aiSummary");

    const incomeElement =
        document.getElementById("aiIncome");

    const expenseElement =
        document.getElementById("aiExpenses");

    const savingRateElement =
        document.getElementById("aiSavingRate");

    const recommendationsElement =
        document.getElementById("recommendations");

    const categoryElement =
        document.getElementById("categoryBreakdown");


    // Stop if AI page is not open
    if (!healthElement) {
        return;
    }


    // Calculate income and expenses
    let totalIncome = 0;
    let totalExpenses = 0;

    let categories = {};


    transactions.forEach(function(transaction) {

        if (transaction.type === "Income") {

            totalIncome += transaction.amount;

        } else if (transaction.type === "Expense") {

            totalExpenses += transaction.amount;

            // Category-wise expense
            if (!categories[transaction.category]) {
                categories[transaction.category] = 0;
            }

            categories[transaction.category] += transaction.amount;
        }

    });


    // Calculate savings
    const savings = totalIncome - totalExpenses;

    // Calculate saving rate
    let savingRate = 0;

    if (totalIncome > 0) {
        savingRate = (savings / totalIncome) * 100;
    }


    // Display basic statistics
    incomeElement.textContent =
        "₹" + totalIncome.toLocaleString("en-IN");

    expenseElement.textContent =
        "₹" + totalExpenses.toLocaleString("en-IN");

    savingRateElement.textContent =
        savingRate.toFixed(1) + "%";


    // ==================================
    // FINANCIAL HEALTH
    // ==================================

    if (totalIncome === 0) {

        healthElement.textContent =
            "Add transactions to get your AI analysis.";

        summaryElement.textContent =
            "FinMate AI needs some income and expense data before it can analyze your financial habits.";

    }

    else if (savingRate >= 30) {

        healthElement.textContent =
            "Your saving pattern looks strong.";

        summaryElement.textContent =
            "You are currently saving a healthy portion of your recorded income. Keep monitoring your expenses.";

    }

    else if (savingRate >= 10) {

        healthElement.textContent =
            "Your finances are fairly balanced.";

        summaryElement.textContent =
            "You are saving some of your income, but there may be opportunities to improve your monthly savings.";

    }

    else if (savingRate >= 0) {

        healthElement.textContent =
            "Your expenses are taking most of your income.";

        summaryElement.textContent =
            "Consider reviewing your largest spending categories and setting limits for discretionary expenses.";

    }

    else {

        healthElement.textContent =
            "Your expenses are currently higher than your income.";

        summaryElement.textContent =
            "Review your recent spending and consider reducing non-essential expenses.";

    }


    // ==================================
    // AI RECOMMENDATIONS
    // ==================================

    recommendationsElement.innerHTML = "";


    if (totalIncome === 0) {

        addRecommendation(
            "💡",
            "Add your income",
            "Enter your income transactions so FinMate AI can analyze your financial situation."
        );

    } else {

        if (savingRate < 20) {

            addRecommendation(
                "💰",
                "Focus on increasing savings",
                "Your current saving rate is below 20%. Review your expenses and identify areas where you can reduce spending."
            );

        } else {

            addRecommendation(
                "✨",
                "Good saving progress",
                "Your current saving rate is above 20%. Continue tracking your expenses to maintain this habit."
            );

        }


        // Find highest spending category
        let highestCategory = "";
        let highestAmount = 0;

        for (let category in categories) {

            if (categories[category] > highestAmount) {

                highestAmount = categories[category];
                highestCategory = category;

            }
        }


        if (highestCategory !== "") {

            addRecommendation(
                "📊",
                highestCategory + " is your highest expense",
                "You have spent ₹" +
                highestAmount.toLocaleString("en-IN") +
                " on " +
                highestCategory +
                ". Consider setting a separate limit for this category."
            );

        }


        addRecommendation(
            "🤖",
            "Keep tracking your transactions",
            "Regular transaction tracking helps FinMate AI identify spending patterns and provide better recommendations."
        );

    }


    // ==================================
    // CATEGORY BREAKDOWN
    // ==================================

    categoryElement.innerHTML = "";

    const categoryNames =
        Object.keys(categories);


    if (categoryNames.length === 0) {

        categoryElement.innerHTML = `
            <p class="empty-message">
                Add expenses to see your category-wise spending.
            </p>
        `;

    } else {

        let highestAmount = Math.max(
            ...Object.values(categories)
        );


        categoryNames
            .sort(function(a, b) {
                return categories[b] - categories[a];
            })
            .forEach(function(category) {

                const amount = categories[category];

                const percentage =
                    (amount / highestAmount) * 100;


                const item =
                    document.createElement("div");

                item.className = "category-item";

                item.innerHTML = `
                    <div class="category-top">
                        <span class="category-name">
                            ${category}
                        </span>

                        <span class="category-amount">
                            ₹${amount.toLocaleString("en-IN")}
                        </span>
                    </div>

                    <div class="category-bar">
                        <div
                            class="category-fill"
                            style="width: ${percentage}%;">
                        </div>
                    </div>
                `;

                categoryElement.appendChild(item);

            });

    }

}


// Add AI recommendation
function addRecommendation(icon, title, message) {

    const recommendationsElement =
        document.getElementById("recommendations");

    const recommendation =
        document.createElement("div");

    recommendation.className =
        "recommendation";

    recommendation.innerHTML = `
        <span class="recommendation-icon">
            ${icon}
        </span>

        <div>
            <strong>${title}</strong>

            <p>${message}</p>
        </div>
    `;

    recommendationsElement.appendChild(
        recommendation
    );

}


// Run AI analysis
generateAIInsights();
// ======================================
// LOAD DATA FROM BACKEND
// ======================================

async function loadBackendData() {
    const user = JSON.parse(localStorage.getItem("loggedInUser"));

    if (!user) {
        console.log("No logged-in user found.");
        return;
    }

    try {
        const incomeResponse = await fetch(
            `http://127.0.0.1:5000/api/income/${user.user_id}`
        );

        const expenseResponse = await fetch(
            `http://127.0.0.1:5000/api/expenses/${user.user_id}`
        );

        const incomeData = await incomeResponse.json();
        const expenseData = await expenseResponse.json();

        let totalIncome = 0;
        let totalExpenses = 0;

        incomeData.income.forEach(function(item) {
            totalIncome += Number(item.amount);
        });

        expenseData.expenses.forEach(function(item) {
            totalExpenses += Number(item.amount);
        });

        const totalSavings = totalIncome - totalExpenses;

        document.getElementById("totalIncome").textContent =
            "₹" + totalIncome.toLocaleString("en-IN");

        document.getElementById("totalExpenses").textContent =
            "₹" + totalExpenses.toLocaleString("en-IN");

        document.getElementById("totalSavings").textContent =
            "₹" + totalSavings.toLocaleString("en-IN");

        console.log("Backend Income:", incomeData);
        console.log("Backend Expenses:", expenseData);

    } catch (error) {
        console.error("Backend connection error:", error);
    }
}

loadBackendData();