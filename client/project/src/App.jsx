import { useEffect, useState } from 'react';
import './App.css';

const API_BASE_URL = 'http://localhost:3000/api';
const categories = ['all', 'food', 'travel', 'bills', 'shopping', 'other'];

function App() {
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState([]);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: 'food',
  });

  const fetchExpenses = async (selectedCategory = filter) => {
    try {
      const query = selectedCategory === 'all' ? '' : `?category=${selectedCategory}`;
      const response = await fetch(`${API_BASE_URL}/expenses${query}`);
      const data = await response.json();
      setExpenses(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Could not load expenses.');
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/expenses/summary`);
      const data = await response.json();
      setSummary(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Could not load summary.');
    }
  };

  useEffect(() => {
    fetchExpenses(filter);
    fetchSummary();
  }, [filter]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_BASE_URL}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          amount: Number(formData.amount),
          category: formData.category,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to add expense.');
      }

      setSuccess('Expense added successfully.');
      setFormData({ title: '', amount: '', category: 'food' });
      setFilter('all');
      fetchExpenses('all');
      fetchSummary();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Unable to delete expense.');
      }

      setSuccess('Expense deleted successfuly.');
      fetchExpenses(filter);
      fetchSummary();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Finance dashboard</p>
          <h1>Expense Tracker</h1>
        </div>
      </header>

      <main className="dashboard">
        <section className="panel form-panel">
          <h2>Add new expense</h2>
          <form onSubmit={handleSubmit} className="expense-form">
            <label>
              Title
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Groceries"
                required
              />
            </label>

            <label>
              Amount
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="120"
                required
              />
            </label>

            <label>
              Category
              <select name="category" value={formData.category} onChange={handleChange}>
                {categories
                  .filter((category) => category !== 'all')
                  .map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
              </select>
            </label>

            <button type="submit">Add expense</button>
          </form>

          {error && <p className="message error">{error}</p>}
          {success && <p className="message success">{success}</p>}
        </section>

        <section className="panel list-panel">
          <div className="section-header">
            <h2>Expenses</h2>
            <select value={filter} onChange={(event) => setFilter(event.target.value)}>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All categories' : category}
                </option>
              ))}
            </select>
          </div>

          <div className="summary-grid">
            {summary.length > 0 ? (
              summary.map((item) => (
                <div key={item._id} className="summary-card">
                  <span>{item.category}</span>
                  <strong>${Number(item.total).toFixed(2)}</strong>
                </div>
              ))
            ) : (
              <p className="empty-state">No summary available yet.</p>
            )}
          </div>

          <ul className="expense-list">
            {expenses.length > 0 ? (
              expenses.map((expense) => (
                <li key={expense._id} className="expense-item">
                  <div>
                    <h3>{expense.title}</h3>
                    <p>
                      {expense.category} • ${Number(expense.amount).toFixed(2)}
                    </p>
                  </div>
                  <button type="button" onClick={() => handleDelete(expense._id)}>
                    Delete
                  </button>
                </li>
              ))
            ) : (
              <li className="empty-state">No expenses found for this filter.</li>
            )}
          </ul>
        </section>
      </main>
    </div>
  );
}

export default App;
