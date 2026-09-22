# 💰 Personal Expense Tracker

A modern, responsive, and feature-rich **Personal Expense Tracker** web application built to help users seamlessly monitor their income, manage daily expenses, track spending limits, and visualize financial growth.

---

## 🌟 Key Features

- **Separate Income & Expense Tracking**: Dedicated actions and modal forms for logging both Income and Expenses independently.
- **Custom Date Picker**: Select custom dates for transactions to accurately backdate or log records.
- **Dynamic Financial Overview**: Interactive Bar Chart built with **Chart.js** that auto-aggregates earnings and spendings across Daily, Monthly, and Yearly views.
- **Budgeting & Spending Limit**: Real-time spending limit progress indicator with dynamic percentage calculation.
- **Transaction Logs & Management**: View organized transaction history with visual category icons and instant single-item or bulk deletion options.
- **CSV Data Export**: Export all recorded transactions into a `.csv` spreadsheet file with a single click.
- **Responsive UI**: Fully styled with **Tailwind CSS** and custom micro-animations for desktop and mobile devices.

---

## 🛠️ Tech Stack

- **Frontend**: HTML5, Tailwind CSS, JavaScript (Vanilla ES6+)
- **Data Visualization**: Chart.js
- **Icons & Fonts**: FontAwesome 6, Google Fonts (Inter)
- **Database / Logic**: In-Memory JavaScript Data Aggregation

---

## 📁 Project Structure

```text
expense-tracker/
├── assets/
│   ├── css/
│   │   └── style.css
│   └── images/
│       └── screenshot.png
├── index.html
├── script.js
├── README.md
└── .gitignore