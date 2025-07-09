import React, { useState, useEffect } from 'react';

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
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Expense Management</h1>
        <div className="flex justify-between items-center">
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            + Add Expense
          </button>
          <button className="btn btn-secondary" onClick={handleExport}>
            Export CSV
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="card border-blue-200 bg-blue-50">
          <h3 className="text-sm font-medium text-blue-600 mb-1">Total Expenses</h3>
          <p className="text-2xl font-bold text-blue-700">{formatCurrency(calculateTotalExpenses())}</p>
          <span className="text-xs text-blue-600">Current Period</span>
        </div>
        <div className="card border-green-200 bg-green-50">
          <h3 className="text-sm font-medium text-green-600 mb-1">Monthly Recurring</h3>
          <p className="text-2xl font-bold text-green-700">
            {formatCurrency(filteredExpenses.filter(e => e.isRecurring && e.type === 'Monthly').reduce((sum, e) => sum + e.amount, 0))}
          </p>
          <span className="text-xs text-green-600">Per Month</span>
        </div>
        <div className="card border-purple-200 bg-purple-50">
          <h3 className="text-sm font-medium text-purple-600 mb-1">Categories</h3>
          <p className="text-2xl font-bold text-purple-700">{Object.keys(calculateCategoryTotals()).length}</p>
          <span className="text-xs text-purple-600">Active</span>
        </div>
        <div className="card border-orange-200 bg-orange-50">
          <h3 className="text-sm font-medium text-orange-600 mb-1">Average per Day</h3>
          <p className="text-2xl font-bold text-orange-700">{formatCurrency(calculateTotalExpenses() / (filteredExpenses.length || 1))}</p>
          <span className="text-xs text-orange-600">Daily Average</span>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          <div>
            <label className="form-label">Date Range:</label>
            <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="form-input w-full">
              <option value="all">All Time</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
            </select>
          </div>

          <div>
            <label className="form-label">Category:</label>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="form-input w-full">
              <option value="all">All Categories</option>
              {expenseCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">Type:</label>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="form-input w-full">
              <option value="all">All Types</option>
              <option value="recurring">Recurring</option>
              <option value="one-time">One-time</option>
            </select>
          </div>

          <div>
            <label className="form-label">Search:</label>
            <input
              type="text"
              placeholder="Search expenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input w-full"
            />
          </div>

          <div className="flex items-end">
            <button className="btn btn-outline w-full" onClick={resetFilters}>
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="card mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Expense by Category</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(calculateCategoryTotals()).map(([category, amount]) => (
            <div key={category} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-gray-900">{category}</h4>
                <span className="text-sm font-semibold text-green-600">{formatCurrency(amount)}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-gray-600">
                  {((amount / calculateTotalExpenses()) * 100).toFixed(1)}% of total
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(amount / calculateTotalExpenses()) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Expense List */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Expense Records ({filteredExpenses.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recurring</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredExpenses.map(expense => (
                <tr key={expense.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{expense.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {expense.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{expense.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">{formatCurrency(expense.amount)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      expense.type === 'Monthly' ? 'bg-green-100 text-green-800' :
                      expense.type === 'Weekly' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {expense.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      expense.isRecurring ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {expense.isRecurring ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button 
                        className="btn btn-primary text-xs py-1 px-3"
                        onClick={() => handleEdit(expense)}
                      >
                        Edit
                      </button>
                      <button 
                        className="btn btn-danger text-xs py-1 px-3"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">{editingExpense ? 'Edit Expense' : 'Add New Expense'}</h3>
              <button 
                className="text-gray-400 hover:text-gray-600"
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
                <span className="text-2xl">×</span>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="form-label">Date:</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="form-input w-full"
                  required
                />
              </div>

              <div>
                <label className="form-label">Category:</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="form-input w-full"
                  required
                >
                  <option value="">Select Category</option>
                  {expenseCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">Description:</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="form-input w-full"
                  placeholder="Enter expense description"
                  required
                />
              </div>

              <div>
                <label className="form-label">Amount (Rs.):</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  className="form-input w-full"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="form-label">Type:</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="form-input w-full"
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

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isRecurring"
                  checked={formData.isRecurring}
                  onChange={(e) => setFormData({...formData, isRecurring: e.target.checked})}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">
                  This is a recurring expense
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