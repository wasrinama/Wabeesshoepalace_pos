import React, { useState, useEffect, ChangeEvent } from 'react';
import apiService from '../services/apiService';
import { IExpense } from '../types/index';

interface ExpenseForm {
  description: string;
  amount: string;
  category: string;
  date: string;
  paymentMethod: 'cash' | 'card' | 'mobile';
  notes: string;
}

const ExpenseManagement: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expenses, setExpenses] = useState<IExpense[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<IExpense[]>([]);
  const [selectedExpense, setSelectedExpense] = useState<IExpense | null>(null);
  const [showExpenseForm, setShowExpenseForm] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [dateRange, setDateRange] = useState<string>('30days');
  const [sortBy, setSortBy] = useState<string>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [expenseForm, setExpenseForm] = useState<ExpenseForm>({
    description: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'cash',
    notes: ''
  });

  // Load expense data
  useEffect(() => {
    loadExpenseData();
  }, []);

  // Filter expenses when data or filters change
  useEffect(() => {
    filterExpenses();
  }, [expenses, searchTerm, categoryFilter, dateRange]);

  const loadExpenseData = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getExpenses();
      // Handle different response structures
      const expenses = Array.isArray(response.data) ? response.data : 
                      Array.isArray((response as any).expenses) ? (response as any).expenses : [];
      setExpenses(expenses);

    } catch (error) {
      console.error('Error loading expense data:', error);
      setError('Failed to load expense data. Please try again.');
      
      // Fallback to sample data if API fails
      setExpenses([
        {
          _id: '1',
          date: new Date('2024-03-10'),
          category: 'Rent',
          description: 'Monthly store rent',
          amount: 75000,
          paymentMethod: 'cash',
          createdBy: 'admin',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          _id: '2',
          date: new Date('2024-03-10'),
          category: 'Utilities',
          description: 'Electricity bill',
          amount: 12500,
          paymentMethod: 'card',
          createdBy: 'admin',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          _id: '3',
          date: new Date('2024-03-09'),
          category: 'Marketing',
          description: 'Facebook ads campaign',
          amount: 15000,
          paymentMethod: 'card',
          createdBy: 'manager',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filterExpenses = (): void => {
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

    // Date range filter
    const now = new Date();
    let startDate: Date;
    
    switch (dateRange) {
      case '7days':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30days':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90days':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(0);
    }

    filtered = filtered.filter(expense => new Date(expense.date) >= startDate);

    // Sort expenses
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'amount':
          aValue = a.amount;
          bValue = b.amount;
          break;
        case 'category':
          aValue = a.category;
          bValue = b.category;
          break;
        default:
          aValue = new Date(a.date);
          bValue = new Date(b.date);
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredExpenses(filtered);
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    try {
      const expenseData = {
        ...expenseForm,
        amount: parseFloat(expenseForm.amount),
        date: new Date(expenseForm.date)
      };

      if (selectedExpense) {
        // Update existing expense
        const response = await apiService.updateExpense(selectedExpense._id, expenseData);
        if (response.data) {
          setExpenses(prev => prev.map(exp => 
            exp._id === selectedExpense._id ? response.data! : exp
          ));
        }
      } else {
        // Create new expense
        const response = await apiService.createExpense(expenseData);
        if (response.data) {
          setExpenses(prev => [response.data!, ...prev]);
        }
      }

      // Reset form
      setExpenseForm({
        description: '',
        amount: '',
        category: '',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'cash',
        notes: ''
      });
      setSelectedExpense(null);
      setShowExpenseForm(false);
    } catch (error) {
      console.error('Error saving expense:', error);
      setError('Failed to save expense. Please try again.');
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    setExpenseForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEdit = (expense: IExpense): void => {
    setSelectedExpense(expense);
    setExpenseForm({
      description: expense.description,
      amount: expense.amount.toString(),
      category: expense.category,
      date: new Date(expense.date).toISOString().split('T')[0],
      paymentMethod: expense.paymentMethod,
      notes: ''
    });
    setShowExpenseForm(true);
  };

  const handleDelete = async (expenseId: string): Promise<void> => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await apiService.deleteExpense(expenseId);
        setExpenses(prev => prev.filter(exp => exp._id !== expenseId));
      } catch (error) {
        console.error('Error deleting expense:', error);
        setError('Failed to delete expense. Please try again.');
      }
    }
  };

  const categories = Array.from(new Set(expenses.map(exp => exp.category)));
  const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="text-center">Loading expenses...</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Expense Management</h2>
        <button
          onClick={() => setShowExpenseForm(true)}
          className="btn btn-primary"
        >
          Add Expense
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Summary Card */}
      <div className="card mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">Rs. {totalExpenses.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total Expenses</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{filteredExpenses.length}</div>
            <div className="text-sm text-gray-600">Total Transactions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              Rs. {filteredExpenses.length > 0 ? Math.round(totalExpenses / filteredExpenses.length).toLocaleString() : 0}
            </div>
            <div className="text-sm text-gray-600">Average per Transaction</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="form-label">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search expenses..."
              className="form-input"
            />
          </div>
          <div>
            <label className="form-label">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="form-select"
            >
              <option value="All">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label">Date Range</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="form-select"
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="all">All Time</option>
            </select>
          </div>
          <div>
            <label className="form-label">Sort By</label>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order as 'asc' | 'desc');
              }}
              className="form-select"
            >
              <option value="date-desc">Date (Newest)</option>
              <option value="date-asc">Date (Oldest)</option>
              <option value="amount-desc">Amount (High to Low)</option>
              <option value="amount-asc">Amount (Low to High)</option>
              <option value="category-asc">Category (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Expenses List */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredExpenses.map(expense => (
                <tr key={expense._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(expense.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{expense.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{expense.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Rs. {expense.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                    {expense.paymentMethod}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEdit(expense)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(expense._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredExpenses.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No expenses found matching your criteria
          </div>
        )}
      </div>

      {/* Expense Form Modal */}
      {showExpenseForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {selectedExpense ? 'Edit Expense' : 'Add New Expense'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="form-label">Description *</label>
                <input
                  type="text"
                  name="description"
                  value={expenseForm.description}
                  onChange={handleInputChange}
                  className="form-input w-full"
                  required
                />
              </div>
              <div>
                <label className="form-label">Amount *</label>
                <input
                  type="number"
                  name="amount"
                  value={expenseForm.amount}
                  onChange={handleInputChange}
                  className="form-input w-full"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
              <div>
                <label className="form-label">Category *</label>
                <input
                  type="text"
                  name="category"
                  value={expenseForm.category}
                  onChange={handleInputChange}
                  className="form-input w-full"
                  required
                />
              </div>
              <div>
                <label className="form-label">Date *</label>
                <input
                  type="date"
                  name="date"
                  value={expenseForm.date}
                  onChange={handleInputChange}
                  className="form-input w-full"
                  required
                />
              </div>
              <div>
                <label className="form-label">Payment Method *</label>
                <select
                  name="paymentMethod"
                  value={expenseForm.paymentMethod}
                  onChange={handleInputChange}
                  className="form-select w-full"
                  required
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="mobile">Mobile Payment</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button type="submit" className="btn btn-primary">
                  {selectedExpense ? 'Update' : 'Add'} Expense
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowExpenseForm(false);
                    setSelectedExpense(null);
                    setExpenseForm({
                      description: '',
                      amount: '',
                      category: '',
                      date: new Date().toISOString().split('T')[0],
                      paymentMethod: 'cash',
                      notes: ''
                    });
                  }}
                  className="btn btn-outline"
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