import React, { useState } from 'react';
import ProductForm from './ProductForm';
import StockAlerts from './StockAlerts';
import SupplierManagement from './SupplierManagement';
import './InventoryManagement.css';

// Extended product data structure for footwear
const sampleInventoryProducts = [
  {
    id: '1',
    name: 'Nike Air Max 270',
    price: 120.00,
    barcode: '1234567890123',
    category: 'Running',
    brand: 'Nike',
    stock: 25,
    minStock: 10,
    sizes: ['6', '7', '8', '9', '10', '11', '12'],
    colors: ['Black', 'White', 'Red', 'Blue'],
    images: ['/images/nike-air-max-1.jpg', '/images/nike-air-max-2.jpg'],
    description: 'Comfortable running shoes with air cushioning',
    supplier: 'Nike Distributor',
    costPrice: 80.00,
    dateAdded: '2024-01-15',
    sku: 'NIK-AM270-001'
  },
  {
    id: '2',
    name: 'Adidas UltraBoost',
    price: 150.00,
    barcode: '1234567890124',
    category: 'Running',
    brand: 'Adidas',
    stock: 30,
    minStock: 15,
    sizes: ['6', '7', '8', '9', '10', '11', '12'],
    colors: ['Black', 'White', 'Gray', 'Navy'],
    images: ['/images/adidas-ultra-1.jpg', '/images/adidas-ultra-2.jpg'],
    description: 'Premium running shoes with boost technology',
    supplier: 'Adidas Distributor',
    costPrice: 100.00,
    dateAdded: '2024-01-20',
    sku: 'ADI-UB22-001'
  },
  {
    id: '3',
    name: 'Converse Chuck Taylor',
    price: 65.00,
    barcode: '1234567890125',
    category: 'Casual',
    brand: 'Converse',
    stock: 5, // Low stock example
    minStock: 10,
    sizes: ['6', '7', '8', '9', '10', '11', '12'],
    colors: ['Black', 'White', 'Red', 'Navy', 'Pink'],
    images: ['/images/converse-chuck-1.jpg', '/images/converse-chuck-2.jpg'],
    description: 'Classic casual sneakers',
    supplier: 'Converse Distributor',
    costPrice: 40.00,
    dateAdded: '2024-01-10',
    sku: 'CON-CT70-001'
  },
  {
    id: '4',
    name: 'Nike Air Jordan 1',
    price: 170.00,
    barcode: '1234567890126',
    category: 'Basketball',
    brand: 'Nike',
    stock: 20,
    minStock: 8,
    sizes: ['6', '7', '8', '9', '10', '11', '12', '13'],
    colors: ['Black/Red', 'White/Black', 'Royal Blue'],
    images: ['/images/jordan-1-1.jpg', '/images/jordan-1-2.jpg'],
    description: 'Iconic basketball sneakers',
    supplier: 'Nike Distributor',
    costPrice: 120.00,
    dateAdded: '2024-01-25',
    sku: 'NIK-AJ1-001'
  }
];

const sampleSuppliers = [
  {
    id: '1',
    name: 'Nike Distributor',
    contactPerson: 'John Smith',
    email: 'john@nike-dist.com',
    phone: '+1-555-0101',
    address: '123 Nike St, Sports City, SC 12345',
    paymentTerms: 'Net 30',
    discountRate: 5
  },
  {
    id: '2',
    name: 'Adidas Distributor',
    contactPerson: 'Sarah Johnson',
    email: 'sarah@adidas-dist.com',
    phone: '+1-555-0102',
    address: '456 Adidas Ave, Athletic Town, AT 54321',
    paymentTerms: 'Net 45',
    discountRate: 7
  },
  {
    id: '3',
    name: 'Converse Distributor',
    contactPerson: 'Mike Wilson',
    email: 'mike@converse-dist.com',
    phone: '+1-555-0103',
    address: '789 Converse Rd, Casual City, CC 67890',
    paymentTerms: 'Net 30',
    discountRate: 3
  }
];

const InventoryManagement = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState(sampleInventoryProducts);
  const [suppliers, setSuppliers] = useState(sampleSuppliers);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Get unique categories
  const categories = ['All', ...new Set(products.map(p => p.category))];

  // Filter and sort products
  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.barcode.includes(searchTerm) ||
                           product.brand.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'All' || product.category === categoryFilter;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
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
  const lowStockProducts = products.filter(p => p.stock <= p.minStock);

  // Handle product operations
  const handleAddProduct = (productData) => {
    const newProduct = {
      ...productData,
      id: Date.now().toString(),
      dateAdded: new Date().toISOString().split('T')[0]
    };
    setProducts([...products, newProduct]);
    setShowProductForm(false);
  };

  const handleUpdateProduct = (productData) => {
    setProducts(products.map(p => 
      p.id === productData.id ? productData : p
    ));
    setSelectedProduct(null);
    setShowProductForm(false);
  };

  const handleDeleteProduct = (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setProducts(products.filter(p => p.id !== productId));
    }
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setShowProductForm(true);
  };

  const handlePrintBarcode = (product) => {
    const printWindow = window.open('', '_blank', 'width=400,height=300');
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Barcode Label - ${product.name}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
              background: white;
            }
                         .barcode-label {
               width: 200px;
               height: 120px;
               border: 1px solid #000;
               padding: 8px;
               margin: 0 auto;
               display: flex;
               flex-direction: column;
               justify-content: space-between;
               background: white;
             }
                         .barcode-visual {
               font-family: 'Courier New', monospace;
               font-size: 14px;
               font-weight: bold;
               text-align: center;
               letter-spacing: 0.3px;
               padding: 4px;
               background: white;
               border: 1px solid #000;
               margin: 4px 0;
               overflow: hidden;
               white-space: nowrap;
             }
            .barcode-number {
              font-family: 'Courier New', monospace;
              font-size: 10px;
              text-align: center;
              font-weight: bold;
              margin-top: 2px;
            }
            .product-info {
              text-align: center;
            }
            .product-name {
              font-size: 11px;
              font-weight: bold;
              margin: 2px 0;
            }
            .product-details {
              font-size: 9px;
              color: #000;
              margin: 1px 0;
            }
            .size-info {
              text-align: center;
              margin: 2px 0;
            }
            .size-info span {
              font-size: 9px;
              font-weight: bold;
            }
            @media print {
              body { margin: 0; padding: 0; }
              .barcode-label { 
                width: 2in; 
                height: 1in; 
                border: 1px solid #000;
                page-break-after: always;
              }
            }
          </style>
        </head>
        <body>
          <div class="barcode-label">
            <div class="product-info">
              <div class="product-name">${product.name}</div>
              <div class="product-details">${product.brand}</div>
            </div>
                         <div class="barcode-visual">
               |||| | || |||| | | || ||| | || | | |||| | || | || | ||| |||| | || | || | | || | || | ||| | || | || | || | | || | || | || | || | || | || | || | |||| | || | || | || | || | || | || | || |
             </div>
             <div class="barcode-number">${product.barcode}</div>
             <div class="size-info">
               <span>Size: ${product.sizes[0] || 'N/A'}</span>
             </div>
          </div>
          <script>
            window.onload = function() {
              setTimeout(() => {
                window.print();
                window.close();
              }, 500);
            }
          </script>
        </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  const handlePrintAllBarcodes = () => {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    let allLabelsContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>All Barcode Labels</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
              background: white;
            }
            .labels-container {
              display: flex;
              flex-wrap: wrap;
              gap: 10px;
              justify-content: flex-start;
            }
            .barcode-label {
              width: 200px;
              height: 120px;
              border: 1px solid #000;
              padding: 8px;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              background: white;
              page-break-inside: avoid;
            }
            .barcode-visual {
              font-family: 'Courier New', monospace;
              font-size: 14px;
              font-weight: bold;
              text-align: center;
              letter-spacing: 0.3px;
              padding: 4px;
              background: white;
              border: 1px solid #000;
              margin: 4px 0;
              overflow: hidden;
              white-space: nowrap;
            }
            .barcode-number {
              font-family: 'Courier New', monospace;
              font-size: 10px;
              text-align: center;
              font-weight: bold;
              margin-top: 2px;
            }
            .product-info {
              text-align: center;
            }
            .product-name {
              font-size: 11px;
              font-weight: bold;
              margin: 2px 0;
            }
            .product-details {
              font-size: 9px;
              color: #000;
              margin: 1px 0;
            }
            .size-info {
              text-align: center;
              margin: 2px 0;
            }
            .size-info span {
              font-size: 9px;
              font-weight: bold;
            }
            @media print {
              body { margin: 0; padding: 10px; }
              .labels-container { gap: 5px; }
              .barcode-label { 
                width: 2in; 
                height: 1in; 
                border: 1px solid #000;
                margin: 0.1in;
              }
            }
          </style>
        </head>
        <body>
          <div class="labels-container">
    `;

    products.forEach(product => {
      allLabelsContent += `
        <div class="barcode-label">
          <div class="product-info">
            <div class="product-name">${product.name}</div>
            <div class="product-details">${product.brand}</div>
          </div>
          <div class="barcode-visual">
            |||| | || |||| | | || ||| | || | | |||| | || | || | ||| |||| | || | || | | || | || | ||| | || | || | || | | || | || | || | || | || | || | || | |||| | || | || | || | || | || | || | || |
          </div>
          <div class="barcode-number">${product.barcode}</div>
          <div class="size-info">
            <span>Size: ${product.sizes[0] || 'N/A'}</span>
          </div>
        </div>
      `;
    });

    allLabelsContent += `
          </div>
          <script>
            window.onload = function() {
              setTimeout(() => {
                window.print();
                window.close();
              }, 1000);
            }
          </script>
        </body>
      </html>
    `;
    
    printWindow.document.write(allLabelsContent);
    printWindow.document.close();
  };

  // Calculate inventory statistics
  const totalProducts = products.length;
  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
  const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
  const lowStockCount = lowStockProducts.length;

  return (
    <div className="inventory-management">
      <div className="inventory-header">
        <h1>Inventory Management</h1>
        <div className="inventory-stats">
          <div className="stat-card">
            <h3>Total Products</h3>
            <p>{totalProducts}</p>
          </div>
          <div className="stat-card">
            <h3>Total Stock</h3>
            <p>{totalStock}</p>
          </div>
          <div className="stat-card">
            <h3>Inventory Value</h3>
            <p>Rs. {totalValue.toFixed(2)}</p>
          </div>
          <div className="stat-card alert">
            <h3>Low Stock Items</h3>
            <p>{lowStockCount}</p>
          </div>
        </div>
      </div>

      <div className="inventory-tabs">
        <button 
          className={`tab ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          Products
        </button>
        <button 
          className={`tab ${activeTab === 'alerts' ? 'active' : ''}`}
          onClick={() => setActiveTab('alerts')}
        >
          Stock Alerts ({lowStockCount})
        </button>
        <button 
          className={`tab ${activeTab === 'suppliers' ? 'active' : ''}`}
          onClick={() => setActiveTab('suppliers')}
        >
          Suppliers
        </button>
      </div>

      <div className="inventory-content">
        {activeTab === 'products' && (
          <div className="products-section">
            <div className="products-toolbar">
              <div className="search-filters">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="filter-select"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="sort-select"
                >
                  <option value="name">Name</option>
                  <option value="price">Price</option>
                  <option value="stock">Stock</option>
                  <option value="dateAdded">Date Added</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="sort-order-btn"
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
              <div className="toolbar-actions">
                <button
                  onClick={() => handlePrintAllBarcodes()}
                  className="btn btn-success"
                  title="Print all barcode labels"
                >
                  Print All Labels
                </button>
                <button
                  onClick={() => {
                    setSelectedProduct(null);
                    setShowProductForm(true);
                  }}
                  className="btn btn-primary"
                >
                  Add New Product
                </button>
              </div>
            </div>

            <div className="products-grid">
              {filteredProducts.map(product => (
                <div key={product.id} className="product-inventory-card">
                  <div className="product-image-container">
                    <div className="product-image-placeholder">
                      {product.name.substring(0, 2)}
                    </div>
                    {product.stock <= product.minStock && (
                      <div className="low-stock-badge">Low Stock</div>
                    )}
                  </div>
                  <div className="product-details">
                    <h3>{product.name}</h3>
                    <p className="brand">{product.brand}</p>
                    <p className="price">Rs. {product.price.toFixed(2)}</p>
                    <p className="stock">Stock: {product.stock}</p>
                    <p className="sku">SKU: {product.sku}</p>
                    <div className="product-sizes">
                      Sizes: {product.sizes.slice(0, 3).join(', ')}
                      {product.sizes.length > 3 && '...'}
                    </div>
                    <div className="product-colors">
                      Colors: {product.colors.slice(0, 2).join(', ')}
                      {product.colors.length > 2 && '...'}
                    </div>
                  </div>
                  <div className="product-actions">
                    <button
                      onClick={() => handleEditProduct(product)}
                      className="btn btn-primary btn-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handlePrintBarcode(product)}
                      className="btn btn-success btn-sm"
                    >
                      Print
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="btn btn-danger btn-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'alerts' && (
          <StockAlerts products={lowStockProducts} />
        )}

        {activeTab === 'suppliers' && (
          <SupplierManagement 
            suppliers={suppliers} 
            setSuppliers={setSuppliers}
          />
        )}
      </div>

      {showProductForm && (
        <ProductForm
          product={selectedProduct}
          suppliers={suppliers}
          onSave={selectedProduct ? handleUpdateProduct : handleAddProduct}
          onCancel={() => {
            setShowProductForm(false);
            setSelectedProduct(null);
          }}
          onUpdateSuppliers={setSuppliers}
        />
      )}
    </div>
  );
};

export default InventoryManagement; 