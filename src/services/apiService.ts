import { ApiResponse, LoginCredentials, AuthUser, IProduct, ISale, ICategory, ISupplier, ICustomer, IExpense, DashboardStats, SalesReport } from '../types/index';

const API_BASE_URL = 'http://localhost:5000/api';

// Interface for API request options
interface RequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
}

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Get auth token from localStorage
  getAuthToken(): string | null {
    return localStorage.getItem('token');
  }
 
  // Set auth token
  setAuthToken(token: string): void {
    localStorage.setItem('token', token);
  }

  // Remove auth token
  removeAuthToken(): void {
    localStorage.removeItem('token');
  }

  // Generic request method
  async request<T = any>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Default headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    // Add auth token if available
    const token = this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers
    };

    try {
      const response = await fetch(url, config);
      
      // Handle 401 Unauthorized
      if (response.status === 401) {
        this.removeAuthToken();
        localStorage.removeItem('currentUser');
        localStorage.removeItem('isLoggedIn');
        window.location.reload();
        throw new Error('Authentication failed');
      }

      const data: ApiResponse<T> = await response.json();
      
      if (!response.ok) {
        console.error('API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          data: data
        });
        throw new Error(data.error || data.message || `Request failed with status ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  // GET request
  async get<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  // POST request
  async post<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined
    });
  }

  // PUT request
  async put<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined
    });
  }

  // DELETE request
  async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // PATCH request
  async patch<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined
    });
  }

  // Authentication methods
  async login(credentials: LoginCredentials): Promise<ApiResponse<{ token: string; user: AuthUser }>> {
    return this.post('/auth/login', credentials);
  }

  async register(userData: any): Promise<ApiResponse<AuthUser>> {
    return this.post('/auth/register', userData);
  }

  async getCurrentUser(): Promise<ApiResponse<AuthUser>> {
    return this.get('/auth/current');
  }

  async logout(): Promise<ApiResponse<any>> {
    return this.post('/auth/logout');
  }

  // Product methods
  async getProducts(): Promise<ApiResponse<{ products: IProduct[] }>> {
    return this.get('/products');
  }

  async getProduct(id: string): Promise<ApiResponse<IProduct>> {
    return this.get(`/products/${id}`);
  }

  async createProduct(productData: Partial<IProduct>): Promise<ApiResponse<IProduct>> {
    return this.post('/products', productData);
  }

  async updateProduct(id: string, productData: Partial<IProduct>): Promise<ApiResponse<IProduct>> {
    return this.put(`/products/${id}`, productData);
  }

  async deleteProduct(id: string): Promise<ApiResponse<any>> {
    return this.delete(`/products/${id}`);
  }

  // Sales methods
  async getSales(): Promise<ApiResponse<ISale[]>> {
    return this.get('/sales');
  }

  async createSale(saleData: Partial<ISale>): Promise<ApiResponse<ISale>> {
    return this.post('/sales', saleData);
  }

  // Categories methods
  async getCategories(): Promise<ApiResponse<{ categories: ICategory[] }>> {
    return this.get('/categories');
  }

  async createCategory(categoryData: Partial<ICategory>): Promise<ApiResponse<ICategory>> {
    return this.post('/categories', categoryData);
  }

  // Suppliers methods
  async getSuppliers(): Promise<ApiResponse<{ suppliers: ISupplier[] }>> {
    return this.get('/suppliers');
  }

  async createSupplier(supplierData: Partial<ISupplier>): Promise<ApiResponse<ISupplier>> {
    return this.post('/suppliers', supplierData);
  }

  async updateSupplier(id: string, supplierData: Partial<ISupplier>): Promise<ApiResponse<ISupplier>> {
    return this.put(`/suppliers/${id}`, supplierData);
  }

  async deleteSupplier(id: string): Promise<ApiResponse<any>> {
    return this.delete(`/suppliers/${id}`);
  }

  // Customers methods
  async getCustomers(): Promise<ApiResponse<ICustomer[]>> {
    return this.get('/customers');
  }

  async createCustomer(customerData: Partial<ICustomer>): Promise<ApiResponse<ICustomer>> {
    return this.post('/customers', customerData);
  }

  // Expense methods
  async getExpenses(): Promise<ApiResponse<{ expenses: IExpense[] }>> {
    return this.get('/expenses');
  }

  async createExpense(expenseData: Partial<IExpense>): Promise<ApiResponse<IExpense>> {
    return this.post('/expenses', expenseData);
  }

  async updateExpense(id: string, expenseData: Partial<IExpense>): Promise<ApiResponse<IExpense>> {
    return this.put(`/expenses/${id}`, expenseData);
  }

  async deleteExpense(id: string): Promise<ApiResponse<any>> {
    return this.delete(`/expenses/${id}`);
  }

  // Dashboard methods
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    return this.get('/dashboard/stats');
  }

  async getSalesReport(params?: any): Promise<ApiResponse<SalesReport>> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.get(`/dashboard/sales-report${queryString}`);
  }
}

// Create singleton instance
const apiService = new ApiService();

// Make it available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).apiService = apiService;
}

export default apiService; 