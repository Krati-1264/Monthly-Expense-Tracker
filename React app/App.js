import React, { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import './App.css';

const INITIAL_BALANCE = 20000;

function App() {
  const [expenses, setExpenses] = useState([]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [showAll, setShowAll] = useState(false);

  const monthlyChartRef = useRef(null);
  const categoryChartRef = useRef(null);
  const monthlyChartInstance = useRef(null);
  const categoryChartInstance = useRef(null);

  const balance = INITIAL_BALANCE - expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  useEffect(() => {
    updateCharts();
  }, [expenses]);

  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!description || !amount || !date) return;
    setExpenses(prev => [
      { id: Date.now(), description, amount: parseFloat(amount), date },
      ...prev
    ]);
    setDescription('');
    setAmount('');
    setDate('');
  };

  const handleDelete = (id) => {
    setExpenses(expenses.filter(exp => exp.id !== id));
  };

  const updateCharts = () => {
    const dateWise = {}, categoryWise = {};
    expenses.forEach(exp => {
      if (!dateWise[exp.date]) dateWise[exp.date] = 0;
      dateWise[exp.date] += exp.amount;

      const cat = exp.description || 'Misc';
      if (!categoryWise[cat]) categoryWise[cat] = 0;
      categoryWise[cat] += exp.amount;
    });

    const sortedDates = Object.keys(dateWise).sort((a, b) => new Date(a) - new Date(b));

    if (monthlyChartInstance.current) monthlyChartInstance.current.destroy();
    monthlyChartInstance.current = new Chart(monthlyChartRef.current, {
      type: 'line',
      data: {
        labels: sortedDates,
        datasets: [{
          label: 'Expenses Over Time',
          data: sortedDates.map(date => dateWise[date]),
          borderColor: '#028575',
          backgroundColor: 'rgba(2, 133, 117, 0.2)',
          fill: true
        }]
      }
    });

    if (categoryChartInstance.current) categoryChartInstance.current.destroy();
    categoryChartInstance.current = new Chart(categoryChartRef.current, {
      type: 'pie',
      data: {
        labels: Object.keys(categoryWise),
        datasets: [{
          data: Object.values(categoryWise),
          backgroundColor: ["#f67280", "#ff9f43", "#6a89cc", "#78e08f", "#e58e26"]
        }]
      }
    });
  };

  return (
    <div className="container">
      <div className="left-section">
        <h1 id="MainHeading">Monthly Expense Tracker</h1>
        <form onSubmit={handleAddExpense} id="expense-form">
          <input type="text" id="description" value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" required />
          <input type="number" id="amount" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount" required />
          <input type="date" id="date" value={date} onChange={e => setDate(e.target.value)} required />
          <button type="submit">Add Expense</button>
        </form>
        <h2 id="Bal">Account Balance: ₹<span id="balance">{balance}</span></h2>
        <h2 id="Exp">Total Expenses: ₹<span id="total-expenses">{totalExpenses}</span></h2>
      </div>

      <div className="right-section">
        <div className="recent-expenses">
          <h2>Recent Expenses</h2>
          <ul id="recent-expense-list">
            {(showAll ? expenses : expenses.slice(0, 3)).map(exp => (
              <li key={exp.id}>
                <span id="dte">{exp.date}</span>
                <span id="desc">{exp.description}</span>
                <span id="amt">₹{exp.amount}</span>
                <button className="delete" onClick={() => handleDelete(exp.id)}>X</button>
              </li>
            ))}
          </ul>
          <button id="see-all" onClick={() => setShowAll(true)} style={{ display: showAll ? 'none' : 'inline' }}>See All Expenses</button>
          <button id="hide-all" onClick={() => setShowAll(false)} style={{ display: showAll ? 'inline' : 'none' }}>Hide All Expenses</button>
        </div>
        <div className="all-expenses">
          <ul id="expense-list" style={{ display: showAll ? 'block' : 'none' }}>
            {showAll && expenses.slice(3).map(exp => (
              <li key={exp.id}>
                <span id="dte">{exp.date}</span>
                <span id="desc">{exp.description}</span>
                <span id="amt">₹{exp.amount}</span>
                <button className="delete" onClick={() => handleDelete(exp.id)}>X</button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="charts">
        <div>
          <h2>Monthly Expenses</h2>
          <canvas id="monthly-expenses-chart" ref={monthlyChartRef} width="300" height="200"></canvas>
        </div>
        <div>
          <h2>Expense Categories</h2>
          <canvas id="category-expenses-chart" ref={categoryChartRef} width="300" height="200"></canvas>
        </div>
      </div>
    </div>
  );
}

export default App;
