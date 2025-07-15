import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { ICustomer } from '../types';
import apiService from '../services/apiService';

// Loyalty tiers
interface LoyaltyTier {
  name: string;
  minSpent: number;
  pointsMultiplier: number;
  discount: number;
  color: string;
}

const loyaltyTiers: LoyaltyTier[] = [
  { name: 'Bronze', minSpent: 0, pointsMultiplier: 1, discount: 0, color: '#CD7F32' },
  { name: 'Silver', minSpent: 25000, pointsMultiplier: 1.5, discount: 5, color: '#C0C0C0' },
  { name: 'Gold', minSpent: 40000, pointsMultiplier: 2, discount: 10, color: '#FFD700' },
  { name: 'Platinum', minSpent: 75000, pointsMultiplier: 3, discount: 15, color: '#E5E4E2' }
];

// Extended interfaces for CustomerManagement
interface Purchase {
  id: string;
  date: string;
  total: number;
  items: number;
}

interface FrontendCustomer {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  birthday: string;
  dateJoined: string;
  totalSpent: number;
  totalOrders: number;
  loyaltyPoints: number;
  loyaltyTier: string;
  lastPurchase: string | null;
  lastMessageSent: string | null;
  purchases: Purchase[];
  smsOptIn: boolean;
  whatsappOptIn: boolean;
  emailOptIn: boolean;
}

interface BackendCustomerData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  dateOfBirth: string | null;
  customerType: string;
  loyaltyPoints: number;
  totalSpent: number;
}

interface CustomerFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  birthday: string;
  smsOptIn: boolean;
  whatsappOptIn: boolean;
  emailOptIn: boolean;
}

interface Promotion {
  id: string;
  title: string;
  message: string;
  type: 'discount' | 'birthday' | 'seasonal' | 'loyalty';
  discount?: number;
  validUntil: string;
  targetTier: string;
  status: 'active' | 'inactive' | 'expired';
  sentCount: number;
  createdAt: string;
}

interface PromotionFormData {
  title: string;
  message: string;
  type: 'discount' | 'birthday' | 'seasonal' | 'loyalty';
  discount: string;
  validUntil: string;
  targetTier: string;
}

interface MessageResult {
  success: boolean;
  message: string;
}

interface CampaignResult {
  successCount: number;
  failCount: number;
}

type ActiveTab = 'customers' | 'promotions' | 'loyalty' | 'analytics';
type SortBy = 'name' | 'totalSpent' | 'loyaltyPoints' | 'dateJoined';
type SortOrder = 'asc' | 'desc';
type MessageChannel = 'SMS' | 'WhatsApp' | 'Email';

const CustomerManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('customers');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Real data state
  const [customers, setCustomers] = useState<FrontendCustomer[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<FrontendCustomer | null>(null);
  const [showCustomerForm, setShowCustomerForm] = useState<boolean>(false);
  const [showPromotionForm, setShowPromotionForm] = useState<boolean>(false);
  const [showMessageForm, setShowMessageForm] = useState<boolean>(false);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [tierFilter, setTierFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<SortBy>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Load customer data
  useEffect(() => {
    loadCustomerData();
  }, []);

  const loadCustomerData = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      // Make parallel API calls
      const [customersResponse, promotionsResponse] = await Promise.all([
        apiService.get('/customers'),
        apiService.get('/promotions').catch(() => ({ promotions: [] })) // Fallback if promotions endpoint doesn't exist
      ]);

      // Transform backend customer data to frontend format
      const backendCustomers = customersResponse.data || [];
      const frontendCustomers: FrontendCustomer[] = backendCustomers.map((customer: any) => ({
        id: customer._id,
        name: `${customer.firstName} ${customer.lastName}`,
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone,
        address: customer.address?.street || '',
        birthday: customer.dateOfBirth ? customer.dateOfBirth.split('T')[0] : '',
        dateJoined: customer.createdAt ? customer.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
        totalSpent: customer.totalSpent || 0,
        totalOrders: 0, // This would need to be calculated from sales data
        loyaltyPoints: customer.loyaltyPoints || 0,
        loyaltyTier: customer.tier || 'Bronze',
        lastPurchase: null, // This would need to be calculated from sales data
        lastMessageSent: null,
        purchases: [],
        smsOptIn: true, // Default values for marketing preferences
        whatsappOptIn: true,
        emailOptIn: true
      }));
      setCustomers(frontendCustomers);
      setPromotions(promotionsResponse.promotions || []);

    } catch (error) {
      console.error('Error loading customer data:', error);
      setError('Failed to load customer data. Please try again.');
      
      // Fallback to sample data if API fails
      setCustomers([
        {
          id: '1',
          name: 'Kamal Perera',
          firstName: 'Kamal',
          lastName: 'Perera',
          email: 'kamal@email.com',
          phone: '+94701234567',
          address: '123 Galle Road, Colombo 03',
          birthday: '1985-06-15',
          dateJoined: '2024-01-15',
          totalSpent: 45000,
          totalOrders: 8,
          loyaltyPoints: 450,
          loyaltyTier: 'Gold',
          lastPurchase: '2024-03-10',
          smsOptIn: true,
          whatsappOptIn: true,
          emailOptIn: true,
          lastMessageSent: '2024-03-01',
          purchases: [
            { id: 'ORD001', date: '2024-03-10', total: 8500, items: 3 },
            { id: 'ORD002', date: '2024-02-28', total: 6200, items: 2 },
            { id: 'ORD003', date: '2024-02-15', total: 12000, items: 4 }
          ]
        },
        {
          id: '2',
          name: 'Nimal Silva',
          firstName: 'Nimal',
          lastName: 'Silva',
          email: 'nimal@email.com',
          phone: '+94712345678',
          address: '456 Kandy Road, Kaduwela',
          birthday: '1990-12-22',
          dateJoined: '2024-02-01',
          totalSpent: 28000,
          totalOrders: 5,
          loyaltyPoints: 280,
          loyaltyTier: 'Silver',
          lastPurchase: '2024-03-08',
          smsOptIn: true,
          whatsappOptIn: false,
          emailOptIn: true,
          lastMessageSent: '2024-02-25',
          purchases: [
            { id: 'ORD004', date: '2024-03-08', total: 5500, items: 2 },
            { id: 'ORD005', date: '2024-02-20', total: 7800, items: 3 }
          ]
        }
      ]);
      
      setPromotions([
        {
          id: '1',
          title: 'Summer Sale 2024',
          message: 'Get 30% OFF on all summer collection! Use code SUMMER30. Valid until June 30th.',
          type: 'discount',
          discount: 30,
          validUntil: '2024-06-30',
          targetTier: 'All',
          status: 'active',
          sentCount: 0,
          createdAt: '2024-03-01'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Get customers with upcoming birthdays (next 30 days)
  const getUpcomingBirthdays = (): FrontendCustomer[] => {
    const today = new Date();
    const next30Days = new Date();
    next30Days.setDate(today.getDate() + 30);
    
    return customers.filter(customer => {
      if (!customer.birthday) return false;
      
      const birthday = new Date(customer.birthday);
      const thisYearBirthday = new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate());
      const nextYearBirthday = new Date(today.getFullYear() + 1, birthday.getMonth(), birthday.getDate());
      
      return (thisYearBirthday >= today && thisYearBirthday <= next30Days) ||
             (nextYearBirthday >= today && nextYearBirthday <= next30Days);
    }).sort((a, b) => {
      const aBirthday = new Date(a.birthday);
      const bBirthday = new Date(b.birthday);
      const aThisYear = new Date(today.getFullYear(), aBirthday.getMonth(), aBirthday.getDate());
      const bThisYear = new Date(today.getFullYear(), bBirthday.getMonth(), bBirthday.getDate());
      return aThisYear.getTime() - bThisYear.getTime();
    });
  };

  // Send promotional message
  const sendPromotionalMessage = async (customer: FrontendCustomer, message: string, channel: MessageChannel): Promise<MessageResult> => {
    // Simulate API call to SMS/WhatsApp service
    try {
      console.log(`Sending ${channel} to ${customer.phone}: ${message}`);
      
      // Update customer last message sent
      setCustomers(prev => prev.map(c => 
        c.id === customer.id 
          ? { ...c, lastMessageSent: new Date().toISOString().split('T')[0] }
          : c
      ));
      
      return { success: true, message: `${channel} sent successfully!` };
    } catch (error) {
      return { success: false, message: 'Failed to send message' };
    }
  };

  // Send birthday wish
  const sendBirthdayWish = async (customer: FrontendCustomer): Promise<MessageResult> => {
    const message = `🎉 Happy Birthday ${customer.name}! 🎂 We hope you have a wonderful day! As a birthday gift, enjoy 15% off your next purchase with code BIRTHDAY15. Valid for 7 days. Thank you for being our valued customer! 🎁`;
    
    const channel: MessageChannel = customer.whatsappOptIn ? 'WhatsApp' : customer.smsOptIn ? 'SMS' : 'Email';
    return await sendPromotionalMessage(customer, message, channel);
  };

  // Send promotional campaign
  const sendPromotionToCustomers = async (promotion: Promotion, targetCustomers: FrontendCustomer[]): Promise<CampaignResult> => {
    let successCount = 0;
    let failCount = 0;
    
    for (const customer of targetCustomers) {
      const channel: MessageChannel = customer.whatsappOptIn ? 'WhatsApp' : customer.smsOptIn ? 'SMS' : 'Email';
      const result = await sendPromotionalMessage(customer, promotion.message, channel);
      
      if (result.success) {
        successCount++;
      } else {
        failCount++;
      }
      
      // Small delay between messages
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Update promotion sent count
    setPromotions(prev => prev.map(p => 
      p.id === promotion.id 
        ? { ...p, sentCount: p.sentCount + successCount }
        : p
    ));
    
    return { successCount, failCount };
  };

  // Filter and sort customers
  const filteredCustomers = customers
    .filter(customer => {
      const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           customer.phone.includes(searchTerm);
      const matchesTier = tierFilter === 'All' || customer.loyaltyTier === tierFilter;
      return matchesSearch && matchesTier;
    })
    .sort((a, b) => {
      let aValue: any = a[sortBy];
      let bValue: any = b[sortBy];
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  // Calculate customer tier based on spending
  const calculateTier = (totalSpent: number): LoyaltyTier => {
    for (let i = loyaltyTiers.length - 1; i >= 0; i--) {
      if (totalSpent >= loyaltyTiers[i].minSpent) {
        return loyaltyTiers[i];
      }
    }
    return loyaltyTiers[0];
  };

  // Customer operations
  const handleAddCustomer = async (customerData: CustomerFormData): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      // Transform frontend data to backend format
      const backendData: BackendCustomerData = {
        firstName: customerData.firstName,
        lastName: customerData.lastName,
        email: customerData.email,
        phone: customerData.phone,
        address: {
          street: customerData.address,
          city: '',
          state: '',
          zipCode: '',
          country: 'Sri Lanka'
        },
        dateOfBirth: customerData.birthday || null,
        customerType: 'regular',
        loyaltyPoints: 0,
        totalSpent: 0
      };

      // Make API call to save customer
      const response = await apiService.post('/customers', backendData);
      
      if (response.success) {
        // Transform backend response to frontend format
        const frontendCustomer: FrontendCustomer = {
          id: response.data._id,
          name: `${response.data.firstName} ${response.data.lastName}`,
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          email: response.data.email,
          phone: response.data.phone,
          address: response.data.address?.street || '',
          birthday: response.data.dateOfBirth ? response.data.dateOfBirth.split('T')[0] : '',
          dateJoined: response.data.createdAt ? response.data.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
          totalSpent: response.data.totalSpent || 0,
          totalOrders: 0,
          loyaltyPoints: response.data.loyaltyPoints || 0,
          loyaltyTier: 'Bronze',
          lastPurchase: null,
          lastMessageSent: null,
          purchases: [],
          smsOptIn: customerData.smsOptIn,
          whatsappOptIn: customerData.whatsappOptIn,
          emailOptIn: customerData.emailOptIn
        };

        setCustomers(prev => [...prev, frontendCustomer]);
        setShowCustomerForm(false);
        alert('Customer added successfully!');
      } else {
        throw new Error(response.error || 'Failed to add customer');
      }
    } catch (error: any) {
      console.error('Error adding customer:', error);
      setError(error.message || 'Failed to add customer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCustomer = async (customerData: CustomerFormData): Promise<void> => {
    if (!selectedCustomer) return;

    try {
      setLoading(true);
      setError(null);

      // Transform frontend data to backend format
      const backendData: BackendCustomerData = {
        firstName: customerData.firstName,
        lastName: customerData.lastName,
        email: customerData.email,
        phone: customerData.phone,
        address: {
          street: customerData.address,
          city: '',
          state: '',
          zipCode: '',
          country: 'Sri Lanka'
        },
        dateOfBirth: customerData.birthday || null,
        customerType: 'regular',
        loyaltyPoints: selectedCustomer.loyaltyPoints,
        totalSpent: selectedCustomer.totalSpent
      };

      const response = await apiService.put(`/customers/${selectedCustomer.id}`, backendData);
      
      if (response.success) {
        // Update local state
        const updatedCustomer: FrontendCustomer = {
          ...selectedCustomer,
          name: `${customerData.firstName} ${customerData.lastName}`,
          firstName: customerData.firstName,
          lastName: customerData.lastName,
          email: customerData.email,
          phone: customerData.phone,
          address: customerData.address,
          birthday: customerData.birthday,
          smsOptIn: customerData.smsOptIn,
          whatsappOptIn: customerData.whatsappOptIn,
          emailOptIn: customerData.emailOptIn
        };

        setCustomers(prev => prev.map(c => c.id === selectedCustomer.id ? updatedCustomer : c));
        setShowCustomerForm(false);
        setSelectedCustomer(null);
        alert('Customer updated successfully!');
      } else {
        throw new Error(response.error || 'Failed to update customer');
      }
    } catch (error: any) {
      console.error('Error updating customer:', error);
      setError(error.message || 'Failed to update customer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCustomer = async (customerId: string): Promise<void> => {
    if (!confirm('Are you sure you want to delete this customer?')) return;

    try {
      setLoading(true);
      const response = await apiService.delete(`/customers/${customerId}`);
      
      if (response.success) {
        setCustomers(prev => prev.filter(c => c.id !== customerId));
        alert('Customer deleted successfully!');
      } else {
        throw new Error(response.error || 'Failed to delete customer');
      }
    } catch (error: any) {
      console.error('Error deleting customer:', error);
      setError(error.message || 'Failed to delete customer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value);
  };

  const handleTierFilterChange = (e: ChangeEvent<HTMLSelectElement>): void => {
    setTierFilter(e.target.value);
  };

  const handleSortChange = (e: ChangeEvent<HTMLSelectElement>): void => {
    setSortBy(e.target.value as SortBy);
  };

  const handleSortOrderChange = (e: ChangeEvent<HTMLSelectElement>): void => {
    setSortOrder(e.target.value as SortOrder);
  };

  // Format currency for display
  const formatCurrency = (amount: number): string => {
    return `LKR ${amount.toFixed(2)}`;
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Get tier badge color
  const getTierBadgeColor = (tier: string): string => {
    const tierData = loyaltyTiers.find(t => t.name === tier);
    if (!tierData) return 'bg-gray-100 text-gray-800';
    
    switch (tier) {
      case 'Bronze':
        return 'bg-orange-100 text-orange-800';
      case 'Silver':
        return 'bg-gray-100 text-gray-800';
      case 'Gold':
        return 'bg-yellow-100 text-yellow-800';
      case 'Platinum':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Customer Management</h1>
        {activeTab === 'customers' && (
          <button
            onClick={() => setShowCustomerForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Add Customer
          </button>
        )}
        {activeTab === 'promotions' && (
          <button
            onClick={() => setShowPromotionForm(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Create Promotion
          </button>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('customers')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'customers'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Customers ({customers.length})
          </button>
          <button
            onClick={() => setActiveTab('promotions')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'promotions'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Promotions ({promotions.length})
          </button>
          <button
            onClick={() => setActiveTab('loyalty')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'loyalty'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Loyalty Program
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'analytics'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Analytics
          </button>
        </nav>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-red-600 hover:text-red-800 text-sm underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Customers Tab */}
      {activeTab === 'customers' && (
        <div>
          {/* Filters and Controls */}
          <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Search Customers</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Search by name, email, or phone..."
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Loyalty Tier</label>
                <select
                  value={tierFilter}
                  onChange={handleTierFilterChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="All">All Tiers</option>
                  {loyaltyTiers.map(tier => (
                    <option key={tier.name} value={tier.name}>{tier.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                <div className="flex space-x-2">
                  <select
                    value={sortBy}
                    onChange={handleSortChange}
                    className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="name">Name</option>
                    <option value="totalSpent">Total Spent</option>
                    <option value="loyaltyPoints">Loyalty Points</option>
                    <option value="dateJoined">Date Joined</option>
                  </select>
                  <select
                    value={sortOrder}
                    onChange={handleSortOrderChange}
                    className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="asc">↑</option>
                    <option value="desc">↓</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="text-sm text-gray-600 mt-4">
              Showing {filteredCustomers.length} of {customers.length} customers
            </div>
          </div>

          {/* Upcoming Birthdays */}
          {getUpcomingBirthdays().length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-medium text-yellow-800 mb-3">🎂 Upcoming Birthdays</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {getUpcomingBirthdays().slice(0, 6).map(customer => (
                  <div key={customer.id} className="flex justify-between items-center bg-white p-3 rounded">
                    <div>
                      <p className="font-medium">{customer.name}</p>
                      <p className="text-sm text-gray-600">{formatDate(customer.birthday)}</p>
                    </div>
                    <button
                      onClick={() => sendBirthdayWish(customer)}
                      className="text-xs bg-yellow-600 hover:bg-yellow-700 text-white px-2 py-1 rounded"
                    >
                      Send Wish
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Customers List */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="bg-white p-12 rounded-lg shadow-sm border text-center">
              <p className="text-gray-500 text-lg">No customers found matching your filters.</p>
              {customers.length === 0 && (
                <button
                  onClick={() => setShowCustomerForm(true)}
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
                >
                  Add Your First Customer
                </button>
              )}
            </div>
          ) : (
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Loyalty
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Spending
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredCustomers.map((customer) => (
                      <tr key={customer.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                            <div className="text-sm text-gray-500">Joined: {formatDate(customer.dateJoined)}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm text-gray-900">{customer.email}</div>
                            <div className="text-sm text-gray-500">{customer.phone}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTierBadgeColor(customer.loyaltyTier)}`}>
                              {customer.loyaltyTier}
                            </span>
                            <div className="text-sm text-gray-500">{customer.loyaltyPoints} points</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{formatCurrency(customer.totalSpent)}</div>
                            <div className="text-sm text-gray-500">{customer.totalOrders} orders</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => {
                              setSelectedCustomer(customer);
                              setShowCustomerForm(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              setSelectedCustomer(customer);
                              setShowMessageForm(true);
                            }}
                            className="text-green-600 hover:text-green-900"
                          >
                            Message
                          </button>
                          <button
                            onClick={() => handleDeleteCustomer(customer.id)}
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
            </div>
          )}
        </div>
      )}

      {/* Promotions Tab */}
      {activeTab === 'promotions' && (
        <div className="space-y-6">
          {promotions.length === 0 ? (
            <div className="bg-white p-12 rounded-lg shadow-sm border text-center">
              <p className="text-gray-500 text-lg">No promotions created yet.</p>
              <button
                onClick={() => setShowPromotionForm(true)}
                className="mt-4 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg"
              >
                Create Your First Promotion
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {promotions.map((promotion) => (
                <div key={promotion.id} className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-gray-900">{promotion.title}</h3>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      promotion.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {promotion.status}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4">{promotion.message}</p>
                  
                  <div className="space-y-2 text-sm">
                    <p><strong>Type:</strong> {promotion.type}</p>
                    {promotion.discount && <p><strong>Discount:</strong> {promotion.discount}%</p>}
                    <p><strong>Target:</strong> {promotion.targetTier}</p>
                    <p><strong>Valid Until:</strong> {formatDate(promotion.validUntil)}</p>
                    <p><strong>Sent:</strong> {promotion.sentCount} times</p>
                  </div>
                  
                  <div className="mt-4 flex space-x-2">
                    <button
                      onClick={() => {
                        const targetCustomers = promotion.targetTier === 'All' 
                          ? customers 
                          : customers.filter(c => c.loyaltyTier === promotion.targetTier);
                        sendPromotionToCustomers(promotion, targetCustomers);
                      }}
                      className="flex-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded"
                    >
                      Send Campaign
                    </button>
                    <button
                      onClick={() => {
                        setSelectedPromotion(promotion);
                        setShowPromotionForm(true);
                      }}
                      className="flex-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Loyalty Program Tab */}
      {activeTab === 'loyalty' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Loyalty Tiers</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {loyaltyTiers.map((tier) => (
                <div key={tier.name} className="border rounded-lg p-4" style={{ borderColor: tier.color }}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold" style={{ color: tier.color }}>{tier.name}</h4>
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: tier.color }}></div>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p>Min Spent: {formatCurrency(tier.minSpent)}</p>
                    <p>Points: {tier.pointsMultiplier}x</p>
                    <p>Discount: {tier.discount}%</p>
                  </div>
                  <div className="mt-3">
                    <div className="text-xs text-gray-600">
                      {customers.filter(c => c.loyaltyTier === tier.name).length} customers
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Total Customers</h3>
              <p className="text-2xl font-bold text-blue-600">{customers.length}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Total Revenue</h3>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(customers.reduce((sum, c) => sum + c.totalSpent, 0))}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Avg. Spending</h3>
              <p className="text-2xl font-bold text-purple-600">
                {formatCurrency(customers.length > 0 ? customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.length : 0)}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Loyalty Points</h3>
              <p className="text-2xl font-bold text-orange-600">
                {customers.reduce((sum, c) => sum + c.loyaltyPoints, 0)}
              </p>
            </div>
          </div>

          {/* Tier Distribution */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Distribution by Tier</h3>
            <div className="space-y-3">
              {loyaltyTiers.map((tier) => {
                const count = customers.filter(c => c.loyaltyTier === tier.name).length;
                const percentage = customers.length > 0 ? (count / customers.length * 100).toFixed(1) : 0;
                return (
                  <div key={tier.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: tier.color }}></div>
                      <span className="font-medium">{tier.name}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full" 
                          style={{ backgroundColor: tier.color, width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 w-16 text-right">{count} ({percentage}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Customer Form Modal */}
      {showCustomerForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {selectedCustomer ? 'Edit Customer' : 'Add New Customer'}
              </h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const customerData: CustomerFormData = {
                  firstName: formData.get('firstName') as string,
                  lastName: formData.get('lastName') as string,
                  email: formData.get('email') as string,
                  phone: formData.get('phone') as string,
                  address: formData.get('address') as string,
                  birthday: formData.get('birthday') as string,
                  smsOptIn: formData.get('smsOptIn') === 'on',
                  whatsappOptIn: formData.get('whatsappOptIn') === 'on',
                  emailOptIn: formData.get('emailOptIn') === 'on',
                };
                
                if (selectedCustomer) {
                  handleUpdateCustomer(customerData);
                } else {
                  handleAddCustomer(customerData);
                }
              }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                    <input
                      type="text"
                      name="firstName"
                      defaultValue={selectedCustomer?.firstName || ''}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                    <input
                      type="text"
                      name="lastName"
                      defaultValue={selectedCustomer?.lastName || ''}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    name="email"
                    defaultValue={selectedCustomer?.email || ''}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    defaultValue={selectedCustomer?.phone || ''}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <textarea
                    name="address"
                    defaultValue={selectedCustomer?.address || ''}
                    rows={3}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Birthday</label>
                  <input
                    type="date"
                    name="birthday"
                    defaultValue={selectedCustomer?.birthday || ''}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                {/* Marketing Preferences */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Marketing Preferences</label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="smsOptIn"
                        defaultChecked={selectedCustomer?.smsOptIn ?? true}
                        className="mr-2"
                      />
                      <span className="text-sm">SMS Notifications</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="whatsappOptIn"
                        defaultChecked={selectedCustomer?.whatsappOptIn ?? true}
                        className="mr-2"
                      />
                      <span className="text-sm">WhatsApp Messages</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="emailOptIn"
                        defaultChecked={selectedCustomer?.emailOptIn ?? true}
                        className="mr-2"
                      />
                      <span className="text-sm">Email Marketing</span>
                    </label>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
                  >
                    {selectedCustomer ? 'Update Customer' : 'Add Customer'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCustomerForm(false);
                      setSelectedCustomer(null);
                    }}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerManagement; 