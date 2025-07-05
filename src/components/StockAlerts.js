import React from 'react';

const StockAlerts = ({ products }) => {
  if (products.length === 0) {
    return (
      <div className="stock-alerts">
        <div className="no-alerts">
          <h3>🎉 Great News!</h3>
          <p>All products are well stocked. No low stock alerts at this time.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="stock-alerts">
      <div className="alerts-header">
        <h3>⚠️ Low Stock Alerts</h3>
        <p>{products.length} items need restocking</p>
      </div>

      <div className="alerts-table">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Brand</th>
              <th>Category</th>
              <th>Current Stock</th>
              <th>Min Stock</th>
              <th>Supplier</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id} className="alert-row">
                <td>
                  <div className="product-info">
                    <strong>{product.name}</strong>
                    <small>SKU: {product.sku}</small>
                  </div>
                </td>
                <td>{product.brand}</td>
                <td>{product.category}</td>
                <td>
                  <span className="stock-critical">
                    {product.stock}
                  </span>
                </td>
                <td>{product.minStock}</td>
                <td>{product.supplier || 'Not assigned'}</td>
                <td>
                  <button className="btn btn-primary btn-sm">
                    Reorder
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="alerts-summary">
        <div className="summary-card">
          <h4>Quick Actions</h4>
          <button className="btn btn-primary">
            Generate Purchase Order for All
          </button>
          <button className="btn btn-secondary">
            Export Low Stock Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default StockAlerts; 