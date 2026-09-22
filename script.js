// Student Expense Tracker JavaScript Engine
// Manages local storage persistence, student category analytics, budget tracking, and chart renderings.

const STORAGE_KEY = 'student_expense_tracker_data';

// Default initial dataset tailored for student life if LocalStorage is empty
const defaultTransactions = [
    { id: 1, title: "Semester Scholarship Grant", amount: 25000.00, type: "income", category: "Scholarship", date: "2026-01-02" },
    { id: 2, title: "Monthly Allowance from Home", amount: 12000.00, type: "income", category: "Allowance", date: "2026-01-05" },
    { id: 3, title: "College Textbooks & Stationery", amount: 3450.00, type: "expense", category: "Books & Supplies", date: "2026-01-08" },
    { id: 4, title: "Campus Canteen & Coffee", amount: 850.00, type: "expense", category: "Food & Canteen", date: "2026-01-12" },
    { id: 5, title: "Dormitory / Hostel Rent", amount: 6500.00, type: "expense", category: "Dorm & Housing", date: "2026-01-14" },
    { id: 6, title: "Monthly Bus & Metro Pass", amount: 600.00, type: "expense", category: "Transportation", date: "2026-01-15" }
];

let transactions = [];
let chartInstance = null;
const studentMonthlyBudget = 15000.00; // Standard monthly student budget threshold

// Category to Icon mapping for student utilities
const categoryIcons = {
    'Books & Supplies': { icon: 'fa-book', colorClass: 'text-indigo-600', bgClass: 'bg-indigo-50' },
    'Food & Canteen': { icon: 'fa-utensils', colorClass: 'text-amber-600', bgClass: 'bg-amber-50' },
    'Dorm & Housing': { icon: 'fa-building', colorClass: 'text-blue-600', bgClass: 'bg-blue-50' },
    'Transportation': { icon: 'fa-bus', colorClass: 'text-cyan-600', bgClass: 'bg-cyan-50' },
    'Entertainment': { icon: 'fa-gamepad', colorClass: 'text-rose-600', bgClass: 'bg-rose-50' },
    'Scholarship': { icon: 'fa-graduation-cap', colorClass: 'text-emerald-600', bgClass: 'bg-emerald-50' },
    'Allowance': { icon: 'fa-hand-holding-dollar', colorClass: 'text-emerald-600', bgClass: 'bg-emerald-50' },
    'Part-time Job': { icon: 'fa-briefcase', colorClass: 'text-teal-600', bgClass: 'bg-teal-50' },
    'Other': { icon: 'fa-receipt', colorClass: 'text-slate-600', bgClass: 'bg-slate-50' }
};

// Load stored transactions or initialize defaults
function loadTransactions() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            transactions = JSON.parse(saved);
        } else {
            transactions = [...defaultTransactions];
            saveTransactions();
        }
    } catch (error) {
        console.error("Error reading from LocalStorage:", error);
        transactions = [...defaultTransactions];
    }
}

// Persist data to LocalStorage
function saveTransactions() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    } catch (error) {
        console.error("Error saving to LocalStorage:", error);
    }
}

// Format numbers into Indian Rupee format
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 2
    }).format(amount);
}

// Update high-level financial summary cards
function calculateMetrics() {
    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0);

    const netSavings = totalIncome - totalExpense;

    // Element bindings with defensive checks
    const incomeEl = document.getElementById('incomeDisplay');
    const expenseEl = document.getElementById('expenseDisplay');
    const limitRatioEl = document.getElementById('limitRatio');
    const progressBarEl = document.getElementById('progressBar');

    if (incomeEl) incomeEl.innerText = formatCurrency(totalIncome);
    if (expenseEl) expenseEl.innerText = formatCurrency(totalExpense);

    // Calculate budget utilization percentage
    if (progressBarEl && limitRatioEl) {
        const percentage = Math.min(Math.round((totalExpense / studentMonthlyBudget) * 100), 100);
        progressBarEl.style.width = `${percentage}%`;
        
        // Color alert warning if spending exceeds 85% of student budget
        if (percentage > 85) {
            progressBarEl.className = "bg-rose-500 h-full rounded-full transition-all duration-500";
        } else {
            progressBarEl.className = "bg-sky-400 h-full rounded-full transition-all duration-500";
        }

        limitRatioEl.innerText = `${formatCurrency(totalExpense)} / ${formatCurrency(studentMonthlyBudget)}`;
    }
}

// Render the transaction history list
function renderTransactions() {
    const listEl = document.getElementById('transactionList');
    if (!listEl) return;

    listEl.innerHTML = '';

    if (transactions.length === 0) {
        listEl.innerHTML = `
            <div class="text-center py-8 text-slate-400 text-sm">
                <i class="fas fa-folder-open text-2xl mb-2 block text-slate-300"></i>
                No student expenses recorded yet. Add one above!
            </div>
        `;
        return;
    }

    transactions.forEach(tx => {
        const config = categoryIcons[tx.category] || categoryIcons['Other'];
        const isExpense = tx.type === 'expense';

        const itemNode = document.createElement('div');
        itemNode.className = 'flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition border-b border-slate-100 last:border-0';
        itemNode.innerHTML = `
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl flex items-center justify-center ${config.bgClass} ${config.colorClass}">
                    <i class="fas ${config.icon} text-sm"></i>
                </div>
                <div>
                    <p class="text-sm font-semibold text-slate-800">${escapeHTML(tx.title)}</p>
                    <p class="text-xs text-slate-400">${tx.date} • <span class="font-medium text-slate-500">${tx.category}</span></p>
                </div>
            </div>
            <div class="text-right flex items-center gap-3">
                <div>
                    <p class="text-sm font-bold ${isExpense ? 'text-slate-900' : 'text-emerald-600'}">
                        ${isExpense ? '-' : '+'}${formatCurrency(tx.amount)}
                    </p>
                </div>
                <button onclick="deleteTransaction(${tx.id})" title="Delete entry" class="text-slate-300 hover:text-rose-500 p-1 transition cursor-pointer">
                    <i class="fas fa-trash-alt text-xs"></i>
                </button>
            </div>
        `;
        listEl.appendChild(itemNode);
    });
}

// Sanitize user inputs to prevent XSS attacks
function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}

// Render interactive expense & income breakdown chart
function updateChart(timeframe = 'monthly') {
    const canvas = document.getElementById('overviewChart');
    if (!canvas || typeof Chart === 'undefined') return;

    const ctx = canvas.getContext('2d');

    let labels = [];
    let incomeData = [];
    let expenseData = [];

    if (timeframe === 'daily') {
        labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        incomeData = [0, 12000, 0, 0, 0, 0, 0];
        expenseData = [450, 800, 1200, 350, 600, 1500, 900];
    } else if (timeframe === 'yearly') {
        labels = ['2024', '2025', '2026'];
        incomeData = [120000, 150000, 180000];
        expenseData = [95000, 110000, 125000];
    } else { // default: monthly view
        labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        incomeData = [37000, 12000, 12000, 15000, 12000, 25000, 12000, 12000, 18000, 12000, 12000, 15000];
        expenseData = [11400, 9800, 10500, 12300, 8900, 14200, 9100, 10800, 11500, 9400, 10200, 13100];
    }

    if (chartInstance) {
        chartInstance.destroy();
    }

    chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Income / Grants',
                    data: incomeData,
                    backgroundColor: '#4f46e5',
                    borderRadius: 6
                },
                {
                    label: 'Student Expenses',
                    data: expenseData,
                    backgroundColor: '#f43f5e',
                    borderRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${formatCurrency(context.raw)}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { font: { family: 'Inter', size: 11 } }
                },
                y: {
                    border: { dash: [4, 4] },
                    grid: { color: '#f1f5f9' },
                    ticks: { font: { family: 'Inter', size: 11 } }
                }
            }
        }
    });
}

// Open transaction creation modal
function openAddModal() {
    const modal = document.getElementById('addModal');
    if (!modal) return;
    const content = modal.querySelector('.modal-content');
    modal.classList.remove('hidden');
    setTimeout(() => {
        if (content) {
            content.classList.remove('scale-95', 'opacity-0');
            content.classList.add('scale-100', 'opacity-100');
        }
    }, 10);
}

// Close transaction creation modal
function closeAddModal() {
    const modal = document.getElementById('addModal');
    if (!modal) return;
    const content = modal.querySelector('.modal-content');
    if (content) {
        content.classList.remove('scale-100', 'opacity-100');
        content.classList.add('scale-95', 'opacity-0');
    }
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 200);
}

// Handle submission of new expense/income entry
function handleAddTransaction(event) {
    event.preventDefault();

    const typeRadio = document.querySelector('input[name="type"]:checked');
    const titleInput = document.getElementById('txTitle');
    const amountInput = document.getElementById('txAmount');
    const categorySelect = document.getElementById('txCategory');

    if (!titleInput || !amountInput || !typeRadio || !categorySelect) return;

    const title = titleInput.value.trim();
    const amount = parseFloat(amountInput.value);
    const type = typeRadio.value;
    const category = categorySelect.value;

    if (!title || isNaN(amount) || amount <= 0) {
        alert("Please enter a valid title and positive amount.");
        return;
    }

    const newTx = {
        id: Date.now(),
        title: title,
        amount: amount,
        type: type,
        category: category,
        date: new Date().toISOString().split('T')[0]
    };

    transactions.unshift(newTx);
    saveTransactions();
    renderTransactions();
    calculateMetrics();
    closeAddModal();

    // Reset Form fields
    document.getElementById('transactionForm').reset();
}

// Delete an individual transaction
function deleteTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);
    saveTransactions();
    renderTransactions();
    calculateMetrics();
}

// Clear all recorded transactions
function clearAllTransactions() {
    if (confirm("Are you sure you want to reset all your student transactions?")) {
        transactions = [];
        saveTransactions();
        renderTransactions();
        calculateMetrics();
    }
}

// Export current transactions list as a downloadable CSV file
function exportToCSV() {
    if (transactions.length === 0) {
        alert("No transaction records found to export!");
        return;
    }

    let csvContent = "data:text/csv;charset=utf-8,ID,Title,Amount (INR),Type,Category,Date\n";
    transactions.forEach(t => {
        const cleanTitle = t.title.replace(/"/g, '""');
        csvContent += `${t.id},"${cleanTitle}",${t.amount},${t.type},${t.category},${t.date}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const downloadLink = document.createElement("a");
    downloadLink.setAttribute("href", encodedUri);
    downloadLink.setAttribute("download", `Student_Expense_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}

// Bind all event handlers when DOM content is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    loadTransactions();
    renderTransactions();
    calculateMetrics();
    updateChart('monthly');

    // Timeframe selector event listener
    const timeframeSelect = document.getElementById('timeframeSelect');
    if (timeframeSelect) {
        timeframeSelect.addEventListener('change', (e) => {
            updateChart(e.target.value);
        });
    }

    // Form submit listener
    const form = document.getElementById('transactionForm');
    if (form) {
        form.addEventListener('submit', handleAddTransaction);
    }
});