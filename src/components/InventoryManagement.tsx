import React, { useState, useEffect, ChangeEvent } from 'react';
import { IProduct, ISupplier, ICategory } from '../types';
import apiService from '../services/apiService';
import universalPrintService from '../services/universalPrintService';
import ProductForm from './ProductForm';
import StockAlerts from './StockAlerts';
import SupplierManagement from './SupplierManagement';
import BarcodeScanner from './BarcodeScanner';

// Extended interfaces for InventoryManagement
interface InventoryProduct extends Omit<IProduct, 'category' | 'supplier'> {
  id?: string; // Add id property for compatibility
  stock: number;
  reorderLevel: number;
  sku: string;
  barcode?: string;
  brand?: string;
  sellingPrice?: number;
  costPrice: number;
  category: string | { name: string; _id: string };
  supplier: string | { name: string; _id: string };
}

interface ProductAnalytics {
  _id: string;
  name: string;
  sku: string;
  stock: number;
  costPrice: number;
  sellingPrice: number;
  assetValue: number;
  potentialRevenue: number;
  potentialProfit: number;
  marginPercent: string;
  category: string;
}

interface InventoryAnalytics {
  totalAssetValue: number;
  totalPotentialRevenue: number;
  totalPotentialProfit: number;
  totalProducts: number;
  totalStock: number;
  averageMargin: string;
  highestMarginProduct: (InventoryProduct & { margin: number }) | null;
  lowestMarginProduct: (InventoryProduct & { margin: number }) | null;
  productAnalytics: ProductAnalytics[];
}

interface SalesUpdateEvent extends CustomEvent {
  detail: {
    sale?: any;
    timestamp: string;
  };
}

interface StockAdjustmentData {
  productId: string;
  quantity: number;
  type: 'add' | 'remove';
  reason: string;
  notes?: string;
}

type ViewMode = 'grid' | 'table';
type ActiveTab = 'products' | 'analytics' | 'stock-alerts' | 'suppliers' | 'batch-tracker';
type SortBy = 'name' | 'price' | 'stock' | 'category' | 'brand';
type SortOrder = 'asc' | 'desc';
type StockFilter = 'All' | 'Low Stock' | 'Out of Stock' | 'In Stock';

const InventoryManagement: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const [suppliers, setSuppliers] = useState<ISupplier[]>([]);
  const [categoriesData, setCategoriesData] = useState<ICategory[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<InventoryProduct | null>(null);
  const [showProductForm, setShowProductForm] = useState<boolean>(false);
  const [showStockAdjustmentForm, setShowStockAdjustmentForm] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('products');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [stockFilter, setStockFilter] = useState<StockFilter>('All');
  const [sortBy, setSortBy] = useState<SortBy>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [viewMode, setViewMode] = useState<ViewMode>('grid'); // grid or table
  const [showBatchTracker, setShowBatchTracker] = useState<boolean>(false);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState<boolean>(false);
  const [showBarcodeSticker, setShowBarcodeSticker] = useState<boolean>(false);
  const [selectedProductForSticker, setSelectedProductForSticker] = useState<InventoryProduct | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [productToDelete, setProductToDelete] = useState<InventoryProduct | null>(null);
  const [showPrintingOptions, setShowPrintingOptions] = useState<boolean>(false);

  // Load inventory data
  useEffect(() => {
    loadInventoryData();
  }, []);

  // **NEW: Listen for sales updates from POS system**
  useEffect(() => {
    const handleSalesUpdate = (event: SalesUpdateEvent) => {
      console.log('🔄 Inventory Management received sales update:', event.detail);
      // Refresh inventory data when new sale is made (stock levels change)
      const refreshInventory = async () => {
        try {
          await loadInventoryData();
          console.log('✅ Inventory data refreshed after sale');
        } catch (error) {
          console.error('❌ Error refreshing inventory data:', error);
        }
      };
      
      // Small delay to ensure backend is updated
      setTimeout(refreshInventory, 500);
    };

    // Listen for sales updates
    window.addEventListener('salesDataUpdated', handleSalesUpdate as EventListener);
    
    // Also listen for localStorage changes (cross-tab updates)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'lastSaleUpdate') {
        handleSalesUpdate({ detail: { timestamp: e.newValue || '' } } as SalesUpdateEvent);
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // Cleanup listeners
    return () => {
      window.removeEventListener('salesDataUpdated', handleSalesUpdate as EventListener);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const loadInventoryData = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      // Make parallel API calls
      const [productsResponse, suppliersResponse, categoriesResponse] = await Promise.all([
        apiService.get('/products'),
        apiService.get('/suppliers'),
        apiService.get('/categories')
      ]);

      // Handle the API response structure with safety checks
      const products = Array.isArray(productsResponse.data) ? productsResponse.data : 
                      Array.isArray((productsResponse as any).products) ? (productsResponse as any).products : 
                      Array.isArray(productsResponse) ? productsResponse : [];
      
      const suppliers = Array.isArray(suppliersResponse.data) ? suppliersResponse.data : 
                       Array.isArray((suppliersResponse as any).suppliers) ? (suppliersResponse as any).suppliers : 
                       Array.isArray(suppliersResponse) ? suppliersResponse : [];
      
      const categories = Array.isArray(categoriesResponse.data) ? categoriesResponse.data : 
                        Array.isArray((categoriesResponse as any).categories) ? (categoriesResponse as any).categories : 
                        Array.isArray(categoriesResponse) ? categoriesResponse : [];

      // Validate data structure before setting state
      const validProducts: InventoryProduct[] = products.filter((p: any) => p && typeof p === 'object' && p.name);
      const validSuppliers: ISupplier[] = suppliers.filter((s: any) => s && typeof s === 'object' && s.name);
      const validCategories: ICategory[] = categories.filter((c: any) => c && typeof c === 'object' && c.name);

      setProducts(validProducts);
      setSuppliers(validSuppliers);
      setCategoriesData(validCategories);

    } catch (error) {
      console.error('Error loading inventory data:', error);
      setError('Failed to load inventory data. Please try again.');
      
      // Empty arrays on error - no dummy data
      setProducts([]);
      setSuppliers([]);
      setCategoriesData([]);
    } finally {
      setLoading(false);
    }
  };

  // Get unique categories with safety checks
  const categories = ['All', ...new Set(products.map(p => {
    if (typeof p.category === 'object' && p.category?.name) {
      return String(p.category.name);
    } else if (typeof p.category === 'string') {
      return p.category;
    }
    return null;
  }).filter(Boolean))];

  // Filter and sort products
  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (product.barcode && product.barcode.includes(searchTerm)) ||
                           (product.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase()));
      const productCategoryName = typeof product.category === 'object' ? product.category?.name : product.category;
      const matchesCategory = categoryFilter === 'All' || productCategoryName === categoryFilter;
      
      let matchesStock = true;
      if (stockFilter === 'Low Stock') {
        matchesStock = product.stock <= product.reorderLevel;
      } else if (stockFilter === 'Out of Stock') {
        matchesStock = product.stock === 0;
      } else if (stockFilter === 'In Stock') {
        matchesStock = product.stock > 0;
      }
      
      return matchesSearch && matchesCategory && matchesStock;
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

  // Get low stock products
  const lowStockProducts = products.filter(p => p.stock <= p.reorderLevel);

  // Calculate analytics data
  const calculateAnalytics = (): InventoryAnalytics => {
    const analytics: InventoryAnalytics = {
      totalAssetValue: 0,
      totalPotentialRevenue: 0,
      totalPotentialProfit: 0,
      totalProducts: products.length,
      totalStock: 0,
      averageMargin: '0',
      highestMarginProduct: null,
      lowestMarginProduct: null,
      productAnalytics: []
    };

    if (products.length === 0) return analytics;

    let totalMargin = 0;
    let highestMargin = -Infinity;
    let lowestMargin = Infinity;

    products.forEach(product => {
      const costPrice = parseFloat(product.costPrice?.toString() || '0');
      const sellingPrice = parseFloat(product.sellingPrice?.toString() || product.price?.toString() || '0');
      const stock = parseInt(product.stock?.toString() || '0');
      
      // Calculate values
      const assetValue = costPrice * stock;
      const potentialRevenue = sellingPrice * stock;
      const potentialProfit = potentialRevenue - assetValue;
      const marginPercent = sellingPrice > 0 ? ((sellingPrice - costPrice) / sellingPrice * 100) : 0;
      
      // Add to totals
      analytics.totalAssetValue += assetValue;
      analytics.totalPotentialRevenue += potentialRevenue;
      analytics.totalPotentialProfit += potentialProfit;
      analytics.totalStock += stock;
      totalMargin += marginPercent;
      
      // Track highest and lowest margin products
      if (marginPercent > highestMargin) {
        highestMargin = marginPercent;
        analytics.highestMarginProduct = { ...product, margin: marginPercent };
      }
      if (marginPercent < lowestMargin) {
        lowestMargin = marginPercent;
        analytics.lowestMarginProduct = { ...product, margin: marginPercent };
      }
      
      // Add product analytics
      analytics.productAnalytics.push({
        _id: product._id,
        name: product.name,
        sku: product.sku,
        stock,
        costPrice,
        sellingPrice,
        assetValue,
        potentialRevenue,
        potentialProfit,
        marginPercent: marginPercent.toFixed(2),
        category: typeof product.category === 'object' ? product.category?.name : product.category
      });
    });

    // Calculate average margin
    analytics.averageMargin = (totalMargin / products.length).toFixed(2);
    
    return analytics;
  };

  const analytics = calculateAnalytics();

  // Generate unique barcode
  const generateUniqueBarcode = (): string => {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${timestamp}${random}`.slice(-13); // Standard 13-digit barcode
  };

  // Handle barcode scan
  const handleBarcodeScanned = (barcode: string): void => {
    const product = products.find(p => p.barcode && p.barcode === barcode);
    if (product) {
      setSelectedProduct(product);
      setShowBarcodeScanner(false);
      alert(`Product found: ${product.name}`);
    } else {
      alert(`No product found with barcode: ${barcode}`);
    }
  };

  // Handle product operations
  const handleAddProduct = async (productData: any): Promise<void> => {
    try {
      setLoading(true);
      console.log('=== InventoryManagement: Adding Product ===');
      console.log('Product data received:', JSON.stringify(productData, null, 2));
      
      console.log('Making API call to /products...');
      const response = await apiService.post('/products', productData);
      console.log('API Response received:', response);
      
      if (response.success) {
        // Add the new product to the local state
        const newProduct = response.data;
        console.log('New product added:', newProduct);
        setProducts([...products, newProduct]);
        setShowProductForm(false);
        setError(null);
        alert('Product added successfully!');
      } else {
        console.error('Failed to add product:', response);
        const errorMessage = response.error || 'Failed to add product. Please try again.';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.error('Error adding product:', error);
      const errorMessage = error.message || 'Failed to add product. Please check your data and try again.';
      setError(errorMessage);
      throw new Error(errorMessage); // Re-throw to let the form handle it
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProduct = async (productData: any): Promise<void> => {
    try {
      setLoading(true);
      
      const response = await apiService.put(`/products/${productData._id || productData.id}`, productData);
      
      if (response.success) {
        // Update the product in the local state
        const updatedProduct = response.data;
        setProducts(products.map(p => 
          (p._id === updatedProduct._id || p.id === updatedProduct._id) ? updatedProduct : p
        ));
        setShowProductForm(false);
        setSelectedProduct(null);
        setError(null);
        alert('Product updated successfully!');
      } else {
        const errorMessage = response.error || 'Failed to update product. Please try again.';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.error('Error updating product:', error);
      const errorMessage = error.message || 'Failed to update product. Please check your data and try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: string): Promise<void> => {
    try {
      setLoading(true);
      
      const response = await apiService.delete(`/products/${productId}`);
      
      if (response.success) {
        // Remove the product from the local state
        setProducts(products.filter(p => p._id !== productId && p.id !== productId));
        setShowDeleteConfirm(false);
        setProductToDelete(null);
        setError(null);
        alert('Product deleted successfully!');
      } else {
        const errorMessage = response.error || 'Failed to delete product. Please try again.';
        setError(errorMessage);
        alert(errorMessage);
      }
    } catch (error: any) {
      console.error('Error deleting product:', error);
      const errorMessage = error.message || 'Failed to delete product. Please try again.';
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleStockAdjustment = async (adjustmentData: StockAdjustmentData): Promise<void> => {
    try {
      setLoading(true);
      
      const response = await apiService.post('/products/stock-adjustment', adjustmentData);
      
      if (response.success) {
        // Update the product in the local state
        const updatedProduct = response.data;
        setProducts(products.map(p => 
          (p._id === updatedProduct._id || p.id === updatedProduct._id) ? updatedProduct : p
        ));
        setShowStockAdjustmentForm(false);
        setSelectedProduct(null);
        setError(null);
        alert('Stock adjustment completed successfully!');
      } else {
        const errorMessage = response.error || 'Failed to adjust stock. Please try again.';
        setError(errorMessage);
        alert(errorMessage);
      }
    } catch (error: any) {
      console.error('Error adjusting stock:', error);
      const errorMessage = error.message || 'Failed to adjust stock. Please try again.';
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryFilterChange = (e: ChangeEvent<HTMLSelectElement>): void => {
    setCategoryFilter(e.target.value);
  };

  const handleStockFilterChange = (e: ChangeEvent<HTMLSelectElement>): void => {
    setStockFilter(e.target.value as StockFilter);
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

  // Get stock status color
  const getStockStatusColor = (product: InventoryProduct): string => {
    if (product.stock === 0) return 'text-red-600';
    if (product.stock <= product.reorderLevel) return 'text-orange-600';
    return 'text-green-600';
  };

  // Print barcode sticker
  const handlePrintBarcodeSticker = (product: InventoryProduct): void => {
    try {
      universalPrintService.printBarcodeSticker(product);
      setShowBarcodeSticker(false);
      setSelectedProductForSticker(null);
    } catch (error) {
      console.error('Error printing barcode sticker:', error);
      alert('Failed to print barcode sticker. Please check printer connection.');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
        <div className="flex space-x-2">
          {activeTab === 'products' && (
            <>
              <button
                onClick={() => setShowBarcodeScanner(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Scan Barcode
              </button>
              <button
                onClick={() => setShowProductForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Add Product
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('products')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'products'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Products ({products.length})
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
          <button
            onClick={() => setActiveTab('stock-alerts')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'stock-alerts'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Stock Alerts ({lowStockProducts.length})
          </button>
          <button
            onClick={() => setActiveTab('suppliers')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'suppliers'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Suppliers ({suppliers.length})
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

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div>
          {/* Filters and Controls */}
          <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Search Products</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Search by name, SKU, barcode, or brand..."
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={categoryFilter}
                  onChange={handleCategoryFilterChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock Status</label>
                <select
                  value={stockFilter}
                  onChange={handleStockFilterChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="All">All</option>
                  <option value="In Stock">In Stock</option>
                  <option value="Low Stock">Low Stock</option>
                  <option value="Out of Stock">Out of Stock</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                <select
                  value={sortBy}
                  onChange={handleSortChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="name">Name</option>
                  <option value="price">Price</option>
                  <option value="stock">Stock</option>
                  <option value="category">Category</option>
                  <option value="brand">Brand</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                <select
                  value={sortOrder}
                  onChange={handleSortOrderChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </div>
            </div>
            
            {/* View Mode Toggle */}
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-gray-600">
                Showing {filteredProducts.length} of {products.length} products
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2 rounded ${viewMode === 'table' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  Table
                </button>
              </div>
            </div>
          </div>

          {/* Products Display */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white p-12 rounded-lg shadow-sm border text-center">
              <p className="text-gray-500 text-lg">No products found matching your filters.</p>
              {products.length === 0 && (
                <button
                  onClick={() => setShowProductForm(true)}
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
                >
                  Add Your First Product
                </button>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            /* Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <div key={product._id} className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-gray-900 text-sm">{product.name}</h3>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => {
                          setSelectedProduct(product);
                          setShowProductForm(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 text-xs"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setProductToDelete(product);
                          setShowDeleteConfirm(true);
                        }}
                        className="text-red-600 hover:text-red-800 text-xs"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-600">SKU: {product.sku}</p>
                    <p className="text-gray-600">
                      Category: {typeof product.category === 'object' ? product.category.name : product.category}
                    </p>
                    <p className="text-lg font-semibold text-green-600">{formatCurrency(product.price)}</p>
                    <p className={`font-medium ${getStockStatusColor(product)}`}>
                      Stock: {product.stock} units
                    </p>
                    {product.stock <= product.reorderLevel && (
                      <p className="text-orange-600 text-xs">⚠ Low Stock Alert</p>
                    )}
                  </div>
                  
                  <div className="mt-4 flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedProduct(product);
                        setShowStockAdjustmentForm(true);
                      }}
                      className="flex-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded"
                    >
                      Adjust Stock
                    </button>
                    <button
                      onClick={() => {
                        setSelectedProductForSticker(product);
                        setShowBarcodeSticker(true);
                      }}
                      className="flex-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded"
                    >
                      Print Barcode
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Table View */
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stock
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredProducts.map((product) => (
                      <tr key={product._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500">SKU: {product.sku}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {typeof product.category === 'object' ? product.category.name : product.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(product.price)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm font-medium ${getStockStatusColor(product)}`}>
                            {product.stock} units
                          </span>
                          {product.stock <= product.reorderLevel && (
                            <div className="text-xs text-orange-600">⚠ Low Stock</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => {
                              setSelectedProduct(product);
                              setShowProductForm(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              setSelectedProduct(product);
                              setShowStockAdjustmentForm(true);
                            }}
                            className="text-green-600 hover:text-green-900"
                          >
                            Stock
                          </button>
                          <button
                            onClick={() => {
                              setProductToDelete(product);
                              setShowDeleteConfirm(true);
                            }}
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

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Total Asset Value</h3>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(analytics.totalAssetValue)}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Potential Revenue</h3>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(analytics.totalPotentialRevenue)}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Potential Profit</h3>
              <p className="text-2xl font-bold text-purple-600">{formatCurrency(analytics.totalPotentialProfit)}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Average Margin</h3>
              <p className="text-2xl font-bold text-orange-600">{analytics.averageMargin}%</p>
            </div>
          </div>

          {/* Top/Bottom Performers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {analytics.highestMarginProduct && (
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Highest Margin Product</h3>
                <div className="space-y-2">
                  <p className="font-medium">{analytics.highestMarginProduct.name}</p>
                  <p className="text-sm text-gray-600">Margin: {analytics.highestMarginProduct.margin.toFixed(2)}%</p>
                  <p className="text-sm text-gray-600">Stock: {analytics.highestMarginProduct.stock} units</p>
                </div>
              </div>
            )}
            {analytics.lowestMarginProduct && (
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Lowest Margin Product</h3>
                <div className="space-y-2">
                  <p className="font-medium">{analytics.lowestMarginProduct.name}</p>
                  <p className="text-sm text-gray-600">Margin: {analytics.lowestMarginProduct.margin.toFixed(2)}%</p>
                  <p className="text-sm text-gray-600">Stock: {analytics.lowestMarginProduct.stock} units</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stock Alerts Tab */}
      {activeTab === 'stock-alerts' && (
        <StockAlerts products={lowStockProducts} onProductClick={setSelectedProduct} />
      )}

      {/* Suppliers Tab */}
      {activeTab === 'suppliers' && (
        <SupplierManagement />
      )}

      {/* Product Form Modal */}
      {showProductForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto max-w-4xl">
            <ProductForm
              product={selectedProduct}
              suppliers={suppliers}
              categories={categoriesData}
              onSave={selectedProduct ? handleUpdateProduct : handleAddProduct}
              onCancel={() => {
                setShowProductForm(false);
                setSelectedProduct(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Barcode Scanner Modal */}
      {showBarcodeScanner && (
        <BarcodeScanner
          onScan={handleBarcodeScanned}
          onClose={() => setShowBarcodeScanner(false)}
          isOpen={showBarcodeScanner}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && productToDelete && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Product</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete "{productToDelete.name}"? This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => handleDeleteProduct(productToDelete._id)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors"
                >
                  Delete
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setProductToDelete(null);
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Barcode Sticker Print Modal */}
      {showBarcodeSticker && selectedProductForSticker && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Print Barcode Sticker</h3>
              <div className="space-y-3 mb-6">
                <p><strong>Product:</strong> {selectedProductForSticker.name}</p>
                <p><strong>SKU:</strong> {selectedProductForSticker.sku}</p>
                <p><strong>Barcode:</strong> {selectedProductForSticker.barcode || 'N/A'}</p>
                <p><strong>Price:</strong> {formatCurrency(selectedProductForSticker.price)}</p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => handlePrintBarcodeSticker(selectedProductForSticker)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
                >
                  Print
                </button>
                <button
                  onClick={() => {
                    setShowBarcodeSticker(false);
                    setSelectedProductForSticker(null);
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryManagement; 