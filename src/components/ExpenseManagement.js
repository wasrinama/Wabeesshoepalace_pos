import React, { useState, useEffect } from 'react';
import apiService from '../services/apiService';

const ExpenseManagement = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [dateRange, setDateRange] = useState('30days');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  // Load expense data
  useEffect(() => {
    loadExpenseData();
  }, []);

  // Filter expenses when data or filters change
  useEffect(() => {
    filterExpenses();
  }, [expenses, searchTerm, categoryFilter, dateRange]);

  const loadExpenseData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.get('/expenses');
      
      // Transform backend expense data to frontend format
      const backendExpenses = response.data || [];
      const frontendExpenses = backendExpenses.map(expense => transformBackendToFrontend(expense));
      
      setExpenses(frontendExpenses);

    } catch (error) {
      console.error('Error loading expense data:', error);
      setError('Failed to load expense data. Please try again.');
      
      // Fallback to sample data if API fails
      setExpenses([
        {
          id: '1',
          date: '2024-03-10',
          category: 'Rent',
          description: 'Monthly store rent',
          amount: 75000,
          type: 'Monthly',
          isRecurring: true,
          receipt: 'receipt_001.pdf',
          createdBy: 'Admin',
          approvedBy: 'Manager',
          status: 'Approved'
        },
        {
          id: '2',
          date: '2024-03-10',
          category: 'Utilities',
          description: 'Electricity bill',
          amount: 12500,
          type: 'Monthly',
          isRecurring: true,
          receipt: 'receipt_002.pdf',
          createdBy: 'Admin',
          approvedBy: 'Manager',
          status: 'Approved'
        },
        {
          id: '3',
          date: '2024-03-09',
          category: 'Marketing',
          description: 'Facebook ads campaign',
          amount: 15000,
          type: 'One-time',
          isRecurring: false,
          receipt: 'receipt_003.pdf',
          createdBy: 'Manager',
          approvedBy: 'Admin',
          status: 'Approved'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filterExpenses = () => {
    let filtered = expenses;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(expense => 
        expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter !== 'All') {
      filtered = filtered.filter(expense => expense.category === categoryFilter);
    }

    // Date filter
    if (dateRange !== 'All') {
      const today = new Date();
      const filterDate = new Date();
      
      switch (dateRange) {
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
      
      filtered = filtered.filter(expense => new Date(expense.date) >= filterDate);
    }

    // Sorting
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return sortOrder === 'desc' ? new Date(b.date).getTime() - new Date(a.date).getTime() : new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortBy === 'category') {
        return sortOrder === 'desc' ? b.category.localeCompare(a.category) : a.category.localeCompare(b.category);
      } else if (sortBy === 'amount') {
        return sortOrder === 'desc' ? b.amount - a.amount : a.amount - b.amount;
      }
      return 0;
    });

    setFilteredExpenses(filtered);
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);

      // Transform frontend data to backend format
      const backendData = {
        title: selectedExpense.description, // Backend expects 'title' field
        description: selectedExpense.description,
        amount: parseFloat(selectedExpense.amount),
        category: selectedExpense.category.toLowerCase().replace(/\s+/g, '_'), // Convert to backend format
        paidDate: selectedExpense.date,
        isRecurring: selectedExpense.isRecurring || false,
        recurringPeriod: selectedExpense.type ? selectedExpense.type.toLowerCase() : 'monthly',
        paymentStatus: 'paid'
      };

      if (selectedExpense.id) {
        // Update existing expense
        const response = await apiService.put(`/expenses/${selectedExpense.id}`, backendData);
        
        if (response.success) {
          // Transform backend response to frontend format
          const frontendExpense = transformBackendToFrontend(response.data);
          
          setExpenses(expenses.map(expense => 
            expense.id === selectedExpense.id ? frontendExpense : expense
          ));
          
          alert('Expense updated successfully!');
        }
      } else {
        // Add new expense
        const response = await apiService.post('/expenses', backendData);
        
        if (response.success) {
          // Transform backend response to frontend format
          const frontendExpense = transformBackendToFrontend(response.data);
          
          setExpenses([...expenses, frontendExpense]);
          
          alert('Expense added successfully!');
        }
      }

      setShowExpenseForm(false);
      setSelectedExpense(null);
      
    } catch (error) {
      console.error('Error saving expense:', error);
      setError('Failed to save expense. Please try again.');
      alert('Failed to save expense: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Transform backend expense data to frontend format
  const transformBackendToFrontend = (expense) => ({
    id: expense._id,
    date: expense.paidDate ? expense.paidDate.split('T')[0] : new Date().toISOString().split('T')[0],
    category: formatCategoryForDisplay(expense.category),
    description: expense.description || expense.title,
    amount: expense.amount,
    type: expense.recurringPeriod ? formatTypeForDisplay(expense.recurringPeriod) : 'One-time',
    isRecurring: expense.isRecurring,
    createdBy: expense.createdBy?.firstName || 'System',
    status: expense.paymentStatus || 'Approved'
  });

  // Format category for display
  const formatCategoryForDisplay = (category) => {
    const categoryMap = {
      'rent': 'Rent',
      'utilities': 'Utilities',
      'salaries': 'Employee Salaries',
      'inventory': 'Inventory',
      'marketing': 'Marketing',
      'maintenance': 'Shop Maintenance',
      'transport': 'Transport Charges',
      'insurance': 'Insurance',
      'taxes': 'Taxes',
      'office_supplies': 'Stationery & Others',
      'equipment': 'Equipment',
      'other': 'Other'
    };
    return categoryMap[category] || category;
  };

  // Format type for display
  const formatTypeForDisplay = (type) => {
    const typeMap = {
      'daily': 'Daily',
      'weekly': 'Weekly',
      'monthly': 'Monthly',
      'quarterly': 'Quarterly',
      'yearly': 'Yearly'
    };
    return typeMap[type] || 'One-time';
  };

  const handleEdit = (expense) => {
    setSelectedExpense(expense);
    setShowExpenseForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        setLoading(true);
        setError(null);

        const response = await apiService.delete(`/expenses/${id}`);
        
        if (response.success) {
          setExpenses(expenses.filter(expense => expense.id !== id));
          alert('Expense deleted successfully!');
        }
      } catch (error) {
        console.error('Error deleting expense:', error);
        setError('Failed to delete expense. Please try again.');
        alert('Failed to delete expense: ' + (error.message || 'Unknown error'));
      } finally {
        setLoading(false);
      }
    }
  };

  const handleExport = () => {
    const csvContent = 'Date,Category,Description,Amount,Type,Recurring\n' +
      filteredExpenses.map(expense => 
        `${expense.date},"${typeof expense.category === 'object' ? expense.category?.name : expense.category}","${expense.description}",${expense.amount},${expense.type},${expense.isRecurring}`
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
    setCategoryFilter('All');
    setDateRange('30days');
    setSearchTerm('');
  };

  // Loading state
  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <span className="ml-4 text-gray-600">Loading expense data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Expense Management</h1>
        
        {/* Error message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-red-400">⚠️</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                  <button 
                    onClick={() => loadExpenseData()}
                    className="mt-2 text-red-800 underline hover:text-red-900"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="flex justify-between items-center">
          <button 
            className="btn btn-primary" 
            onClick={() => {
              setSelectedExpense({
                date: new Date().toISOString().split('T')[0],
                category: '',
                description: '',
                amount: '',
                type: 'One-time',
                isRecurring: false
              });
              setShowExpenseForm(true);
            }}
          >
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
            <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="form-input w-full">
              <option value="All">All Time</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
            </select>
          </div>

          <div>
            <label className="form-label">Category:</label>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="form-input w-full">
              <option value="All">All Categories</option>
              <option value="Rent">Rent</option>
              <option value="Utilities">Utilities</option>
              <option value="Employee Salaries">Employee Salaries</option>
              <option value="Inventory">Inventory</option>
              <option value="Marketing">Marketing</option>
              <option value="Shop Maintenance">Shop Maintenance</option>
              <option value="Transport Charges">Transport Charges</option>
              <option value="Insurance">Insurance</option>
              <option value="Taxes">Taxes</option>
              <option value="Stationery & Others">Stationery & Others</option>
              <option value="Equipment">Equipment</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="form-label">Sort By:</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="form-input w-full">
              <option value="date">Date</option>
              <option value="category">Category</option>
              <option value="amount">Amount</option>
            </select>
          </div>

          <div>
            <label className="form-label">Sort Order:</label>
            <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="form-input w-full">
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
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
                      {typeof expense.category === 'object' ? expense.category?.name : expense.category}
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
      {showExpenseForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">{selectedExpense ? 'Edit Expense' : 'Add New Expense'}</h3>
              <button 
                className="text-gray-400 hover:text-gray-600"
                onClick={() => {
                  setShowExpenseForm(false);
                  setSelectedExpense(null);
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
                  value={selectedExpense?.date || ''}
                  onChange={(e) => setSelectedExpense({...selectedExpense, date: e.target.value})}
                  className="form-input w-full"
                  required
                />
              </div>

              <div>
                <label className="form-label">Category:</label>
                <select
                  value={selectedExpense?.category || ''}
                  onChange={(e) => setSelectedExpense({...selectedExpense, category: e.target.value})}
                  className="form-input w-full"
                  required
                >
                  <option value="">Select Category</option>
                  <option value="Rent">Rent</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Employee Salaries">Employee Salaries</option>
                  <option value="Inventory">Inventory</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Shop Maintenance">Shop Maintenance</option>
                  <option value="Transport Charges">Transport Charges</option>
                  <option value="Insurance">Insurance</option>
                  <option value="Taxes">Taxes</option>
                  <option value="Stationery & Others">Stationery & Others</option>
                  <option value="Equipment">Equipment</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="form-label">Description:</label>
                <input
                  type="text"
                  value={selectedExpense?.description || ''}
                  onChange={(e) => setSelectedExpense({...selectedExpense, description: e.target.value})}
                  className="form-input w-full"
                  placeholder="Enter expense description"
                  required
                />
              </div>

              <div>
                <label className="form-label">Amount (Rs.):</label>
                <input
                  type="number"
                  value={selectedExpense?.amount || ''}
                  onChange={(e) => setSelectedExpense({...selectedExpense, amount: e.target.value})}
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
                  value={selectedExpense?.type || ''}
                  onChange={(e) => setSelectedExpense({...selectedExpense, type: e.target.value})}
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
                  checked={selectedExpense?.isRecurring || false}
                  onChange={(e) => setSelectedExpense({...selectedExpense, isRecurring: e.target.checked})}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">
                  This is a recurring expense
                </label>
              </div>

              <div className="form-actions">
                <button type="submit" className="submit-btn">
                  {selectedExpense ? 'Update Expense' : 'Add Expense'}
                </button>
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => {
                    setShowExpenseForm(false);
                    setSelectedExpense(null);
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