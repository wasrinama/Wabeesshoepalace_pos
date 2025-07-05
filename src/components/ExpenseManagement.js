import React, { useState, useEffect } from 'react';
import './ExpenseManagement.css';

// Sample expense data with various categories
const sampleExpenses = [
  { id: 1, date: '2024-03-01', category: 'Rent', description: 'Monthly store rent', amount: 75000, type: 'Monthly', isRecurring: true },
  { id: 2, date: '2024-03-02', category: 'Electricity Bills', description: 'CEB monthly charges', amount: 12500, type: 'Monthly', isRecurring: true },
  { id: 3, date: '2024-03-03', category: 'Employee Salaries', description: 'Sales staff salary', amount: 45000, type: 'Monthly', isRecurring: true },
  { id: 4, date: '2024-03-04', category: 'Shop Maintenance', description: 'AC repair and cleaning', amount: 8500, type: 'One-time', isRecurring: false },
  { id: 5, date: '2024-03-05', category: 'Transport Charges', description: 'Supplier delivery charges', amount: 3200, type: 'Weekly', isRecurring: true },
  { id: 6, date: '2024-03-06', category: 'Marketing', description: 'Facebook ads campaign', amount: 15000, type: 'Monthly', isRecurring: true },
  { id: 7, date: '2024-03-07', category: 'Stationery & Others', description: 'Receipt rolls and pens', amount: 2800, type: 'One-time', isRecurring: false },
  { id: 8, date: '2024-03-08', category: 'Employee Salaries', description: 'Manager salary', amount: 65000, type: 'Monthly', isRecurring: true },
  { id: 9, date: '2024-03-09', category: 'Shop Maintenance', description: 'Daily cleaning service', amount: 5000, type: 'Monthly', isRecurring: true },
  { id: 10, date: '2024-03-10', category: 'Transport Charges', description: 'Customer delivery', amount: 800, type: 'One-time', isRecurring: false }
];

const expenseCategories = [
  'Rent',
  'Electricity Bills',
  'Employee Salaries',
  'Shop Maintenance',
  'Transport Charges',
  'Marketing',
  'Stationery & Others'
];

const ExpenseManagement = () => {
  const [expenses, setExpenses] = useState(sampleExpenses);
  const [filteredExpenses, setFilteredExpenses] = useState(sampleExpenses);
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [dateFilter, setDateFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    category: '',
    description: '',
    amount: '',
    type: 'One-time',
    isRecurring: false
  });

  // Apply filters
  useEffect(() => {
    let filtered = expenses;

    // Date filter
    if (dateFilter !== 'all') {
      const today = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case '7days':
          filterDate.setDate(today.getDate() - 7);
          break;
        case '30days':
          filterDate.setDate(today.getDate() - 30);
          break;
        case '90days':
          filterDate.setDate(today.getDate() - 90);
          break;
        default:
          break;
      }
      
      if (dateFilter !== 'all') {
        filtered = filtered.filter(expense => new Date(expense.date) >= filterDate);
      }
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(expense => expense.category === categoryFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      if (typeFilter === 'recurring') {
        filtered = filtered.filter(expense => expense.isRecurring);
      } else if (typeFilter === 'one-time') {
        filtered = filtered.filter(expense => !expense.isRecurring);
      }
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(expense => 
        expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredExpenses(filtered);
  }, [expenses, dateFilter, categoryFilter, typeFilter, searchTerm]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0
    }).format(amount).replace('LKR', 'Rs.');
  };

  const calculateTotalExpenses = () => {
    return filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  };

  const calculateCategoryTotals = () => {
    const categoryTotals = {};
    filteredExpenses.forEach(expense => {
      if (!categoryTotals[expense.category]) {
        categoryTotals[expense.category] = 0;
      }
      categoryTotals[expense.category] += expense.amount;
    });
    return categoryTotals;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingExpense) {
      // Update existing expense
      setExpenses(expenses.map(expense => 
        expense.id === editingExpense.id 
          ? { ...formData, id: editingExpense.id, amount: parseFloat(formData.amount) }
          : expense
      ));
    } else {
      // Add new expense
      const newExpense = {
        id: Date.now(),
        ...formData,
        amount: parseFloat(formData.amount)
      };
      setExpenses([...expenses, newExpense]);
    }

    // Reset form
    setFormData({
      date: new Date().toISOString().split('T')[0],
      category: '',
      description: '',
      amount: '',
      type: 'One-time',
      isRecurring: false
    });
    setShowForm(false);
    setEditingExpense(null);
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setFormData({
      date: expense.date,
      category: expense.category,
      description: expense.description,
      amount: expense.amount.toString(),
      type: expense.type,
      isRecurring: expense.isRecurring
    });
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      setExpenses(expenses.filter(expense => expense.id !== id));
    }
  };

  const handleExport = () => {
    const csvContent = 'Date,Category,Description,Amount,Type,Recurring\n' +
      filteredExpenses.map(expense => 
        `${expense.date},${expense.category},"${expense.description}",${expense.amount},${expense.type},${expense.isRecurring}`
      ).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expenses_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const resetFilters = () => {
    setDateFilter('all');
    setCategoryFilter('all');
    setTypeFilter('all');
    setSearchTerm('');
  };

  return (
    <div className="expense-management">
      <div className="expense-header">
        <h1>Expense Management</h1>
        <div className="header-actions">
          <button className="add-expense-btn" onClick={() => setShowForm(true)}>
            + Add Expense
          </button>
          <button className="export-btn" onClick={handleExport}>
            Export CSV
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="expense-summary">
        <div className="summary-card total">
          <h3>Total Expenses</h3>
          <p className="amount">{formatCurrency(calculateTotalExpenses())}</p>
          <span className="period">Current Period</span>
        </div>
        <div className="summary-card monthly">
          <h3>Monthly Recurring</h3>
          <p className="amount">
            {formatCurrency(filteredExpenses.filter(e => e.isRecurring && e.type === 'Monthly').reduce((sum, e) => sum + e.amount, 0))}
          </p>
          <span className="period">Per Month</span>
        </div>
        <div className="summary-card categories">
          <h3>Categories</h3>
          <p className="amount">{Object.keys(calculateCategoryTotals()).length}</p>
          <span className="period">Active</span>
        </div>
        <div className="summary-card average">
          <h3>Average per Day</h3>
          <p className="amount">{formatCurrency(calculateTotalExpenses() / (filteredExpenses.length || 1))}</p>
          <span className="period">Daily Average</span>
        </div>
      </div>

      {/* Filters */}
      <div className="expense-filters">
        <div className="filter-group">
          <label>Date Range:</label>
          <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
            <option value="all">All Time</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Category:</label>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="all">All Categories</option>
            {expenseCategories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Type:</label>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="all">All Types</option>
            <option value="recurring">Recurring</option>
            <option value="one-time">One-time</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Search:</label>
          <input
            type="text"
            placeholder="Search expenses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <button className="reset-filters-btn" onClick={resetFilters}>
          Reset Filters
        </button>
      </div>

      {/* Category Breakdown */}
      <div className="category-breakdown">
        <h3>Expense by Category</h3>
        <div className="category-grid">
          {Object.entries(calculateCategoryTotals()).map(([category, amount]) => (
            <div key={category} className="category-card">
              <div className="category-info">
                <h4>{category}</h4>
                <p className="category-amount">{formatCurrency(amount)}</p>
                <span className="category-percentage">
                  {((amount / calculateTotalExpenses()) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="category-bar">
                <div 
                  className="bar-fill" 
                  style={{ width: `${(amount / calculateTotalExpenses()) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Expense List */}
      <div className="expense-list">
        <h3>Expense Records ({filteredExpenses.length})</h3>
        <div className="expense-table">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Type</th>
                <th>Recurring</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.map(expense => (
                <tr key={expense.id}>
                  <td>{expense.date}</td>
                  <td>
                    <span className={`category-badge ${expense.category.toLowerCase().replace(/\s+/g, '-')}`}>
                      {expense.category}
                    </span>
                  </td>
                  <td>{expense.description}</td>
                  <td className="amount-cell">{formatCurrency(expense.amount)}</td>
                  <td>
                    <span className={`type-badge ${expense.type.toLowerCase().replace(/\s+/g, '-')}`}>
                      {expense.type}
                    </span>
                  </td>
                  <td>
                    <span className={`recurring-badge ${expense.isRecurring ? 'yes' : 'no'}`}>
                      {expense.isRecurring ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="edit-btn"
                        onClick={() => handleEdit(expense)}
                      >
                        Edit
                      </button>
                      <button 
                        className="delete-btn"
                        onClick={() => handleDelete(expense.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingExpense ? 'Edit Expense' : 'Add New Expense'}</h3>
              <button 
                className="close-btn"
                onClick={() => {
                  setShowForm(false);
                  setEditingExpense(null);
                  setFormData({
                    date: new Date().toISOString().split('T')[0],
                    category: '',
                    description: '',
                    amount: '',
                    type: 'One-time',
                    isRecurring: false
                  });
                }}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Date:</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Category:</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  required
                >
                  <option value="">Select Category</option>
                  {expenseCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Description:</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Enter expense description"
                  required
                />
              </div>

              <div className="form-group">
                <label>Amount (Rs.):</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                />
              </div>

              <div className="form-group">
                <label>Type:</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  required
                >
                  <option value="One-time">One-time</option>
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Yearly">Yearly</option>
                </select>
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.isRecurring}
                    onChange={(e) => setFormData({...formData, isRecurring: e.target.checked})}
                  />
                  <span>Recurring Expense</span>
                </label>
              </div>

              <div className="form-actions">
                <button type="submit" className="submit-btn">
                  {editingExpense ? 'Update Expense' : 'Add Expense'}
                </button>
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => {
                    setShowForm(false);
                    setEditingExpense(null);
                    setFormData({
                      date: new Date().toISOString().split('T')[0],
                      category: '',
                      description: '',
                      amount: '',
                      type: 'One-time',
                      isRecurring: false
                    });
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseManagement; 