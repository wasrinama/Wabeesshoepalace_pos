import React from 'react';

const StockAlerts = ({ products }) => {
  if (products.length === 0) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="card text-center py-12">
          <h3 className="text-2xl font-bold text-green-600 mb-4">🎉 Great News!</h3>
          <p className="text-gray-600">All products are well stocked. No low stock alerts at this time.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h3 className="text-3xl font-bold text-red-600 mb-2 flex items-center gap-2">
          ⚠️ Low Stock Alerts
        </h3>
        <p className="text-gray-600">{products.length} items are running low on stock</p>
      </div>

      <div className="card mb-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Min Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map(product => (
                <tr key={product.id} className="hover:bg-red-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="font-medium text-gray-900">{product.name}</div>
                      <div className="text-sm text-gray-500">SKU: {product.sku}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.brand}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-red-100 text-red-800">
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.minStock}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.supplier || 'Not assigned'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h4>
        <div className="flex flex-col sm:flex-row gap-3">
          <button className="btn btn-secondary flex-1">
            Export Low Stock Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default StockAlerts; 