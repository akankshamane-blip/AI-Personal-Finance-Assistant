// ======================================
// FINMATE AI - CENTRAL CLIENT SCRIPT
// ======================================

const API_BASE_URL = "http://127.0.0.1:5000/api";

const CATEGORY_NAMES = {
    1: "Salary",
    2: "Business",
    3: "Other Income",
    4: "Food",
    5: "Shopping",
    6: "Transport",
    7: "Bills",
    8: "Entertainment",
    9: "Health",
    10: "Education",
    11: "Other Expense"
};

// ======================================
// USER SESSION & AUTH CHECKS
// ======================================
function getLoggedInUser() {
    try {
        return JSON.parse(localStorage.getItem("loggedInUser"));
    } catch (e) {
        return null;
    }
}

function initUserProfile() {
    const user = getLoggedInUser();

    // Populate user profile widgets if elements exist
    const greetingEl = document.getElementById("welcomeGreeting");
    const nameEl = document.getElementById("profileName");
    const emailEl = document.getElementById("profileEmail");
    const avatarEl = document.getElementById("profileAvatar");

    if (user) {
        if (greetingEl) greetingEl.textContent = `Welcome back, ${user.name}`;
        if (nameEl) nameEl.textContent = user.name;
        if (emailEl) emailEl.textContent = user.email;
        if (avatarEl) avatarEl.textContent = user.name.charAt(0).toUpperCase();
    } else {
        if (greetingEl) greetingEl.textContent = "Welcome, Guest";
        if (nameEl) nameEl.textContent = "Guest User";
        if (emailEl) emailEl.textContent = "Please login";
        if (avatarEl) avatarEl.textContent = "G";
    }

    // Bind logout button
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", function (e) {
            e.preventDefault();
            localStorage.removeItem("loggedInUser");
            window.location.href = "login.html";
        });
    }
}

// ======================================
// TRANSACTIONS PAGE LOGIC
// ======================================
const transactionForm = document.getElementById("transactionForm");
const transactionTable = document.getElementById("transactionTable");
const typeSelect = document.getElementById("type");
const categorySelect = document.getElementById("category");

// Filter categories based on Transaction Type
if (typeSelect && categorySelect) {
    typeSelect.addEventListener("change", function () {
        const type = typeSelect.value;
        const incomeGroup = document.getElementById("incomeOptGroup");
        const expenseGroup = document.getElementById("expenseOptGroup");

        categorySelect.value = "";

        if (type === "Income") {
            if (incomeGroup) incomeGroup.style.display = "";
            if (expenseGroup) expenseGroup.style.display = "none";
        } else if (type === "Expense") {
            if (incomeGroup) incomeGroup.style.display = "none";
            if (expenseGroup) expenseGroup.style.display = "";
        } else {
            if (incomeGroup) incomeGroup.style.display = "";
            if (expenseGroup) expenseGroup.style.display = "";
        }
    });
}

// Add Transaction (Connected to MySQL Flask API)
if (transactionForm) {
    // Set default date to today
    const dateInput = document.getElementById("date");
    if (dateInput && !dateInput.value) {
        dateInput.value = new Date().toISOString().split("T")[0];
    }

    transactionForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const user = getLoggedInUser();
        if (!user) {
            alert("Please login first to record transactions.");
            window.location.href = "login.html";
            return;
        }

        const type = document.getElementById("type").value;
        const categoryId = parseInt(document.getElementById("category").value, 10);
        const amount = parseFloat(document.getElementById("amount").value);
        const date = document.getElementById("date").value;
        const description = document.getElementById("description").value.trim();

        if (!type || !categoryId || isNaN(amount) || amount <= 0 || !date) {
            alert("Please fill in all required fields with valid data.");
            return;
        }

        const endpoint = type === "Income" ? `${API_BASE_URL}/income` : `${API_BASE_URL}/expense`;
        const payload = {
            user_id: user.user_id,
            category_id: categoryId,
            amount: amount,
            [type === "Income" ? "income_date" : "expense_date"]: date,
            description: description
        };

        const submitBtn = document.getElementById("submitBtn");
        if (submitBtn) submitBtn.disabled = true;

        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (response.ok) {
                alert(`${type} added successfully!`);
                transactionForm.reset();
                if (dateInput) dateInput.value = new Date().toISOString().split("T")[0];
                await loadTransactionsTable();
            } else {
                alert("Error: " + (result.message || "Failed to add transaction."));
            }
        } catch (err) {
            console.error("Add transaction error:", err);
            alert("Unable to connect to Flask backend. Make sure your server is running.");
        } finally {
            if (submitBtn) submitBtn.disabled = false;
        }
    });
}

// Load Transactions Table from Backend
async function loadTransactionsTable() {
    if (!transactionTable) return;

    const user = getLoggedInUser();
    if (!user) {
        transactionTable.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; color: #888; padding: 25px;">
                    Please <a href="login.html" style="color: #6558ee; font-weight: bold;">Login</a> to view your transactions.
                </td>
            </tr>
        `;
        return;
    }

    try {
        const [incomeRes, expenseRes] = await Promise.all([
            fetch(`${API_BASE_URL}/income/${user.user_id}`),
            fetch(`${API_BASE_URL}/expenses/${user.user_id}`)
        ]);

        const incomeData = await incomeRes.json();
        const expenseData = await expenseRes.json();

        let allTransactions = [];

        if (incomeData.income && Array.isArray(incomeData.income)) {
            incomeData.income.forEach(item => {
                allTransactions.push({
                    type: "Income",
                    categoryId: item.category_id,
                    amount: Number(item.amount),
                    date: item.income_date,
                    description: item.description
                });
            });
        }

        if (expenseData.expenses && Array.isArray(expenseData.expenses)) {
            expenseData.expenses.forEach(item => {
                allTransactions.push({
                    type: "Expense",
                    categoryId: item.category_id,
                    amount: Number(item.amount),
                    date: item.expense_date,
                    description: item.description
                });
            });
        }

        // Sort descending by date
        allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

        transactionTable.innerHTML = "";

        if (allTransactions.length === 0) {
            transactionTable.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; color: #888; padding: 25px;">
                        No transactions recorded yet. Add one above!
                    </td>
                </tr>
            `;
            return;
        }

        allTransactions.forEach(t => {
            const formattedDate = new Date(t.date).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric"
            });
            const categoryName = CATEGORY_NAMES[t.categoryId] || (t.type === "Income" ? "Other Income" : "Other Expense");
            const row = document.createElement("tr");

            if (t.type === "Income") {
                row.innerHTML = `
                    <td>${formattedDate}</td>
                    <td><span class="income-badge">Income</span></td>
                    <td>${categoryName}</td>
                    <td class="income-amount">+ ₹${t.amount.toLocaleString("en-IN")}</td>
                    <td>${t.description || "—"}</td>
                `;
            } else {
                row.innerHTML = `
                    <td>${formattedDate}</td>
                    <td><span class="expense-badge">Expense</span></td>
                    <td>${categoryName}</td>
                    <td class="expense-amount">- ₹${t.amount.toLocaleString("en-IN")}</td>
                    <td>${t.description || "—"}</td>
                `;
            }
            transactionTable.appendChild(row);
        });

    } catch (err) {
        console.error("Load transactions error:", err);
        transactionTable.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; color: #e04444; padding: 25px;">
                    Failed to connect to backend server. Make sure Flask is running.
                </td>
            </tr>
        `;
    }
}

// ======================================
// DASHBOARD LOGIC (index.html)
// ======================================
async function loadDashboardData() {
    const totalIncomeEl = document.getElementById("totalIncome");
    const totalExpensesEl = document.getElementById("totalExpenses");
    const totalSavingsEl = document.getElementById("totalSavings");

    // Only run if we are on dashboard
    if (!totalIncomeEl && !totalExpensesEl) return;

    const user = getLoggedInUser();
    if (!user) {
        const recentListEl = document.getElementById("dashboardRecentTransactions");
        if (recentListEl) {
            recentListEl.innerHTML = `
                <p style="color: #8b94a8; padding: 15px 0;">
                    Please <a href="login.html" style="color: #6558ee; font-weight: bold;">Login</a> to load your personal financial data.
                </p>
            `;
        }
        return;
    }

    try {
        const [incomeRes, expenseRes, budgetRes] = await Promise.all([
            fetch(`${API_BASE_URL}/income/${user.user_id}`),
            fetch(`${API_BASE_URL}/expenses/${user.user_id}`),
            fetch(`${API_BASE_URL}/budget/${user.user_id}`)
        ]);

        const incomeData = await incomeRes.json();
        const expenseData = await expenseRes.json();
        const budgetData = await budgetRes.json();

        let totalIncome = 0;
        let totalExpenses = 0;
        let allTransactions = [];

        if (incomeData.income && Array.isArray(incomeData.income)) {
            incomeData.income.forEach(item => {
                const amt = Number(item.amount) || 0;
                totalIncome += amt;
                allTransactions.push({
                    type: "Income",
                    categoryId: item.category_id,
                    amount: amt,
                    date: item.income_date,
                    description: item.description
                });
            });
        }

        if (expenseData.expenses && Array.isArray(expenseData.expenses)) {
            expenseData.expenses.forEach(item => {
                const amt = Number(item.amount) || 0;
                totalExpenses += amt;
                allTransactions.push({
                    type: "Expense",
                    categoryId: item.category_id,
                    amount: amt,
                    date: item.expense_date,
                    description: item.description
                });
            });
        }

        const totalSavings = totalIncome - totalExpenses;
        let savingRate = totalIncome > 0 ? (totalSavings / totalIncome) * 100 : 0;

        // Update Summary Cards
        if (totalIncomeEl) totalIncomeEl.textContent = "₹" + totalIncome.toLocaleString("en-IN");
        if (totalExpensesEl) totalExpensesEl.textContent = "₹" + totalExpenses.toLocaleString("en-IN");
        if (totalSavingsEl) totalSavingsEl.textContent = "₹" + totalSavings.toLocaleString("en-IN");

        const savingRateTag = document.getElementById("savingRateTag");
        if (savingRateTag) {
            savingRateTag.textContent = `${savingRate.toFixed(1)}% saved`;
        }

        // Update AI Insights Summary Card on Dashboard
        const aiHeadline = document.getElementById("aiHeadline");
        const aiSummaryText = document.getElementById("aiSummaryText");
        if (aiHeadline && aiSummaryText) {
            if (totalIncome === 0 && totalExpenses === 0) {
                aiHeadline.textContent = "No data recorded yet";
                aiSummaryText.textContent = "Add your income and expenses to unlock AI-powered financial health insights.";
            } else if (savingRate >= 30) {
                aiHeadline.textContent = "Strong Financial Health";
                aiSummaryText.textContent = `Excellent job! You are saving ${savingRate.toFixed(1)}% of your income. Keep building your wealth!`;
            } else if (savingRate >= 15) {
                aiHeadline.textContent = "Moderate Savings Pattern";
                aiSummaryText.textContent = `You are saving ${savingRate.toFixed(1)}% of your income. Aim to lower discretionary expenses to reach 25%+.`;
            } else if (savingRate >= 0) {
                aiHeadline.textContent = "Tight Budget Alert";
                aiSummaryText.textContent = "Your spending is absorbing nearly all your income. Consider reviewing top spending categories.";
            } else {
                aiHeadline.textContent = "Spending Exceeds Income";
                aiSummaryText.textContent = `Warning: You have spent ₹${Math.abs(totalSavings).toLocaleString("en-IN")} more than your recorded earnings this period.`;
            }
        }

        // Update Dashboard Budget Widget
        const monthlyBudget = (budgetData.budget && Number(budgetData.budget.amount)) || Number(localStorage.getItem("monthlyBudget")) || 0;
        const budgetPercentEl = document.getElementById("dashboardBudgetPercent");
        const budgetProgressEl = document.getElementById("dashboardBudgetProgress");
        const spentTextEl = document.getElementById("dashboardSpentText");
        const limitTextEl = document.getElementById("dashboardLimitText");
        const budgetMessageEl = document.getElementById("dashboardBudgetMessage");

        if (spentTextEl) spentTextEl.textContent = `₹${totalExpenses.toLocaleString("en-IN")} spent`;
        if (limitTextEl) limitTextEl.textContent = `₹${monthlyBudget.toLocaleString("en-IN")} limit`;

        if (monthlyBudget > 0) {
            const pct = (totalExpenses / monthlyBudget) * 100;
            if (budgetPercentEl) budgetPercentEl.textContent = `${pct.toFixed(0)}%`;
            if (budgetProgressEl) budgetProgressEl.style.width = `${Math.min(pct, 100)}%`;

            const remaining = monthlyBudget - totalExpenses;
            if (budgetMessageEl) {
                if (remaining >= 0) {
                    budgetMessageEl.textContent = `You have ₹${remaining.toLocaleString("en-IN")} remaining for this month.`;
                } else {
                    budgetMessageEl.textContent = `⚠️ You have exceeded your budget by ₹${Math.abs(remaining).toLocaleString("en-IN")}.`;
                    if (budgetProgressEl) budgetProgressEl.style.background = "#e04444";
                }
            }
        } else {
            if (budgetPercentEl) budgetPercentEl.textContent = "0%";
            if (budgetProgressEl) budgetProgressEl.style.width = "0%";
            if (budgetMessageEl) budgetMessageEl.textContent = "Set a budget to start tracking your spending.";
        }

        // Update Recent Transactions on Dashboard
        const recentListEl = document.getElementById("dashboardRecentTransactions");
        if (recentListEl) {
            allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
            const recent = allTransactions.slice(0, 5);

            if (recent.length === 0) {
                recentListEl.innerHTML = `
                    <p style="color: #8b94a8; padding: 15px 0;">
                        No transactions recorded yet. <a href="transactions.html" style="color: #6558ee; font-weight: bold;">Add Transaction</a>
                    </p>
                `;
            } else {
                recentListEl.innerHTML = "";
                recent.forEach(t => {
                    const icon = t.type === "Income" ? "💰" : (t.categoryId === 4 ? "🍔" : (t.categoryId === 5 ? "🛍️" : "💳"));
                    const categoryName = CATEGORY_NAMES[t.categoryId] || (t.type === "Income" ? "Income" : "Expense");
                    const formattedDate = new Date(t.date).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short"
                    });

                    const itemEl = document.createElement("div");
                    itemEl.className = "transaction";
                    itemEl.innerHTML = `
                        <div class="transaction-icon ${t.type === "Income" ? "income" : "food"}">
                            ${icon}
                        </div>
                        <div class="transaction-name">
                            <strong>${categoryName}</strong>
                            <span>${formattedDate}${t.description ? " • " + t.description : ""}</span>
                        </div>
                        <strong class="amount ${t.type === "Income" ? "income-text" : "expense"}">
                            ${t.type === "Income" ? "+" : "-"} ₹${t.amount.toLocaleString("en-IN")}
                        </strong>
                    `;
                    recentListEl.appendChild(itemEl);
                });
            }
        }

    } catch (err) {
        console.error("Dashboard backend load error:", err);
    }
}

// ======================================
// RUN INITIALIZATIONS
// ======================================
document.addEventListener("DOMContentLoaded", function () {
    initUserProfile();
    if (transactionTable) {
        loadTransactionsTable();
    }
    loadDashboardData();
});