document.addEventListener("DOMContentLoaded", () => {
    const expenseForm = document.getElementById("expense-form");
    const balanceElement = document.getElementById("balance");
    const totalExpensesElement = document.getElementById("total-expenses");
    const recentExpenseList = document.getElementById("recent-expense-list");
    const allExpenseList = document.getElementById("expense-list");
    const seeAllButton = document.getElementById("see-all");
    const hideAllButton = document.getElementById("hide-all");
    
    let expenses = [];

    
    const monthlyChartCtx = document.getElementById("monthly-expenses-chart").getContext("2d");
    const categoryChartCtx = document.getElementById("category-expenses-chart").getContext("2d");
    
    let monthlyChart, categoryChart;

    
    function updateUI() {
        
        expenses.sort((a, b) => new Date(b.date) - new Date(a.date));

        
        const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
        const balance = 20000 - totalExpenses;

        balanceElement.textContent = balance;
        totalExpensesElement.textContent = totalExpenses;

        
        recentExpenseList.innerHTML = "";
        expenses.slice(0, 3).forEach(exp => {
            const li = createExpenseElement(exp);
            recentExpenseList.appendChild(li);
        });

        
        updateCharts();
    }

    
    function updateCharts() {
        if (monthlyChart) monthlyChart.destroy();
        if (categoryChart) categoryChart.destroy();

        
        const dateWiseExpenses = {};
        const categoryWiseExpenses = {};

        expenses.forEach(exp => {
            const date = exp.date;
            const category = exp.description || "Misc";

            if (!dateWiseExpenses[date]) dateWiseExpenses[date] = 0;
            dateWiseExpenses[date] += exp.amount;

            if (!categoryWiseExpenses[category]) categoryWiseExpenses[category] = 0;
            categoryWiseExpenses[category] += exp.amount;
        });

        const sortedDates = Object.keys(dateWiseExpenses).sort((a, b) => new Date(a) - new Date(b));

        
        monthlyChart = new Chart(monthlyChartCtx, {
            type: "line",
            data: {
                labels: sortedDates,
                datasets: [{
                    label: "Expenses Over Time",
                    data: sortedDates.map(date => dateWiseExpenses[date]),
                    borderColor: "#028575",
                    backgroundColor: "rgba(2, 133, 117, 0.2)",
                    fill: true
                }]
            }
        });

        
        categoryChart = new Chart(categoryChartCtx, {
            type: "pie",
            data: {
                labels: Object.keys(categoryWiseExpenses),
                datasets: [{
                    data: Object.values(categoryWiseExpenses),
                    backgroundColor: ["#f67280", "#ff9f43", "#6a89cc", "#78e08f", "#e58e26"]
                }]
            }
        });
    }

    
    function createExpenseElement(exp) {
        const li = document.createElement("li");
        li.innerHTML = `
            <span id="dte">${exp.date}</span> 
            <span id="desc">${exp.description}</span> 
            <span id="amt">₹${exp.amount}</span> 
            <button class="delete" data-id="${exp.id}">X</button>
        `;
        return li;
    }

    
    expenseForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const description = document.getElementById("description").value;
        const amount = parseFloat(document.getElementById("amount").value);
        const date = document.getElementById("date").value;

        if (!description || isNaN(amount) || !date) return;

        expenses.push({ id: Date.now(), description, amount, date });

        expenseForm.reset();
        updateUI();
    });

    
    document.addEventListener("click", (event) => {
        if (event.target.classList.contains("delete")) {
            const expenseId = event.target.dataset.id;
            expenses = expenses.filter(exp => exp.id !== parseInt(expenseId));
            updateUI();
        }
    });

    
    seeAllButton.addEventListener("click", () => {
        allExpenseList.innerHTML = "";
        expenses.slice(3).forEach(exp => {
            const li = createExpenseElement(exp);
            allExpenseList.appendChild(li);
        });

        allExpenseList.style.display = "block";
        seeAllButton.style.display = "none";
        hideAllButton.style.display = "inline";
    });

    /
    hideAllButton.addEventListener("click", () => {
        allExpenseList.style.display = "none";
        seeAllButton.style.display = "inline";
        hideAllButton.style.display = "none";
    });

    
    function adjustChartLayout() {
        const chartContainer = document.querySelector(".charts");
        if (window.innerWidth < 600) {
            chartContainer.style.flexDirection = "column";
        } else {
            chartContainer.style.flexDirection = "row";
        }
    }

    window.addEventListener("resize", adjustChartLayout);
    adjustChartLayout();
});
