import React, { useState, useEffect } from 'react';
import apiService from '../services/apiService';

const SupplierPriceComparison = ({ product, suppliers, onSelectSupplier, onClose }) => {
  const [quantity, setQuantity] = useState(1);
  const [showAddSupplierPrice, setShowAddSupplierPrice] = useState(false);
  const [supplierPrices, setSupplierPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newSupplierPrice, setNewSupplierPrice] = useState({
    supplierId: '',
    price: 0,
    minOrderQuantity: 1,
    leadTime: '',
    notes: ''
  });

  // Fetch supplier prices from API
  useEffect(() => {
    if (product && product.id) {
      fetchSupplierPrices();
    }
  }, [product]);

  const fetchSupplierPrices = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await apiService.get(`/products/${product.id}/supplier-prices`);
      setSupplierPrices(response.data || []);
    } catch (error) {
      console.error('Error fetching supplier prices:', error);
      setError('Failed to load supplier prices. Please try again.');
      // Fallback to sample data if API fails
      setSupplierPrices([
        {
          id: '1',
          supplierId: '1',
          supplierName: 'Nike Distribution Lanka',
          price: 80.00,
          minOrderQuantity: 10,
          leadTime: '5-7 days',
          rating: 4.8,
          reliabilityScore: 95,
          lastUpdated: '2024-03-01',
          notes: 'Bulk discount available for 50+ units',
          discountTiers: [
            { minQty: 10, discount: 0 },
            { minQty: 50, discount: 5 },
            { minQty: 100, discount: 10 }
          ]
        },
        {
          id: '2',
          supplierId: '2',
          supplierName: 'Adidas Sri Lanka',
          price: 85.00,
          minOrderQuantity: 5,
          leadTime: '3-5 days',
          rating: 4.5,
          reliabilityScore: 88,
          lastUpdated: '2024-02-28',
          notes: 'Fast delivery, premium quality',
          discountTiers: [
            { minQty: 5, discount: 0 },
            { minQty: 25, discount: 3 },
            { minQty: 75, discount: 8 }
          ]
        },
        {
          id: '3',
          supplierId: '3',
          supplierName: 'Local Sports Distributor',
          price: 75.00,
          minOrderQuantity: 20,
          leadTime: '7-10 days',
          rating: 4.2,
          reliabilityScore: 82,
          lastUpdated: '2024-03-05',
          notes: 'Competitive pricing, longer lead time',
          discountTiers: [
            { minQty: 20, discount: 0 },
            { minQty: 60, discount: 7 },
            { minQty: 120, discount: 12 }
          ]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const calculateFinalPrice = (supplierPrice, qty) => {
    let price = supplierPrice.price;
    let discountPercent = 0;

    // Find applicable discount tier
    for (let i = supplierPrice.discountTiers.length - 1; i >= 0; i--) {
      if (qty >= supplierPrice.discountTiers[i].minQty) {
        discountPercent = supplierPrice.discountTiers[i].discount;
        break;
      }
    }

    const discountAmount = (price * discountPercent) / 100;
    return price - discountAmount;
  };

  const calculateTotalCost = (supplierPrice, qty) => {
    const finalPrice = calculateFinalPrice(supplierPrice, qty);
    return finalPrice * qty;
  };

  const handleAddSupplierPrice = async (e) => {
    e.preventDefault();
    const supplier = suppliers.find(s => s.id === newSupplierPrice.supplierId);
    if (!supplier) return;

    const newPrice = {
      ...newSupplierPrice,
      productId: product.id,
      supplierName: supplier.name,
      price: parseFloat(newSupplierPrice.price),
      minOrderQuantity: parseInt(newSupplierPrice.minOrderQuantity),
      rating: 4.0,
      reliabilityScore: 90,
      lastUpdated: new Date().toISOString().split('T')[0],
      discountTiers: [
        { minQty: parseInt(newSupplierPrice.minOrderQuantity), discount: 0 }
      ]
    };

    try {
      const response = await apiService.post(`/products/${product.id}/supplier-prices`, newPrice);
      const savedPrice = response.data;
      setSupplierPrices([...supplierPrices, savedPrice]);
      setNewSupplierPrice({
        supplierId: '',
        price: 0,
        minOrderQuantity: 1,
        leadTime: '',
        notes: ''
      });
      setShowAddSupplierPrice(false);
    } catch (error) {
      console.error('Error adding supplier price:', error);
      // Fallback to local addition
      const priceWithId = {
        ...newPrice,
        id: Date.now().toString()
      };
      setSupplierPrices([...supplierPrices, priceWithId]);
      setNewSupplierPrice({
        supplierId: '',
        price: 0,
        minOrderQuantity: 1,
        leadTime: '',
        notes: ''
      });
      setShowAddSupplierPrice(false);
    }
  };

  const handleSelectSupplier = (supplierPrice) => {
    const finalPrice = calculateFinalPrice(supplierPrice, quantity);
    onSelectSupplier({
      ...supplierPrice,
      selectedQuantity: quantity,
      finalPrice: finalPrice,
      totalCost: calculateTotalCost(supplierPrice, quantity)
    });
  };

  const getBestDeal = () => {
    return supplierPrices.reduce((best, current) => {
      const bestTotal = calculateTotalCost(best, quantity);
      const currentTotal = calculateTotalCost(current, quantity);
      return currentTotal < bestTotal ? current : best;
    });
  };

  const sortedSuppliers = [...supplierPrices]
    .filter(sp => quantity >= sp.minOrderQuantity)
    .sort((a, b) => calculateTotalCost(a, quantity) - calculateTotalCost(b, quantity));

  const bestDeal = sortedSuppliers.length > 0 ? sortedSuppliers[0] : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-6xl w-full mx-4 max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Supplier Price Comparison</h3>
            <p className="text-gray-600">{product.name}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <span className="text-2xl">×</span>
          </button>
        </div>

        {/* Quantity Selector */}
        <div className="card mb-6">
          <div className="flex items-center gap-4 mb-4">
            <label className="text-sm font-medium text-gray-700">Order Quantity:</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              className="form-input w-32"
              min="1"
            />
            <button
              onClick={() => setShowAddSupplierPrice(!showAddSupplierPrice)}
              className="btn btn-outline ml-auto"
            >
              Add Supplier Price
            </button>
          </div>

          {bestDeal && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-green-600">🏆</span>
                <span className="font-semibold text-green-800">Best Deal</span>
              </div>
              <p className="text-sm text-green-700">
                {bestDeal.supplierName} - Rs. {calculateFinalPrice(bestDeal, quantity).toFixed(2)} per unit
                (Total: Rs. {calculateTotalCost(bestDeal, quantity).toFixed(2)})
              </p>
            </div>
          )}
        </div>

        {/* Add Supplier Price Form */}
        {showAddSupplierPrice && (
          <div className="card mb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Add Supplier Price</h4>
            <form onSubmit={handleAddSupplierPrice} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Supplier *</label>
                  <select
                    value={newSupplierPrice.supplierId}
                    onChange={(e) => setNewSupplierPrice({...newSupplierPrice, supplierId: e.target.value})}
                    className="form-input w-full"
                    required
                  >
                    <option value="">Select Supplier</option>
                    {suppliers.map(supplier => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">Price per Unit *</label>
                  <input
                    type="number"
                    value={newSupplierPrice.price}
                    onChange={(e) => setNewSupplierPrice({...newSupplierPrice, price: e.target.value})}
                    className="form-input w-full"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Minimum Order Quantity</label>
                  <input
                    type="number"
                    value={newSupplierPrice.minOrderQuantity}
                    onChange={(e) => setNewSupplierPrice({...newSupplierPrice, minOrderQuantity: e.target.value})}
                    className="form-input w-full"
                    min="1"
                  />
                </div>
                <div>
                  <label className="form-label">Lead Time</label>
                  <input
                    type="text"
                    value={newSupplierPrice.leadTime}
                    onChange={(e) => setNewSupplierPrice({...newSupplierPrice, leadTime: e.target.value})}
                    className="form-input w-full"
                    placeholder="e.g., 5-7 days"
                  />
                </div>
              </div>
              <div>
                <label className="form-label">Notes</label>
                <textarea
                  value={newSupplierPrice.notes}
                  onChange={(e) => setNewSupplierPrice({...newSupplierPrice, notes: e.target.value})}
                  className="form-textarea w-full"
                  rows="2"
                />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="btn btn-primary">Add Price</button>
                <button 
                  type="button" 
                  onClick={() => setShowAddSupplierPrice(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Supplier Comparison Table */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900">Price Comparison</h4>
          
          {loading ? (
            <div className="text-center py-8 text-gray-500">
              Loading supplier prices...
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              {error}
            </div>
          ) : sortedSuppliers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No suppliers available for this quantity. 
              {quantity < Math.min(...supplierPrices.map(sp => sp.minOrderQuantity)) && (
                <p className="mt-2">
                  Minimum order quantity required: {Math.min(...supplierPrices.map(sp => sp.minOrderQuantity))}
                </p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {sortedSuppliers.map((supplierPrice, index) => {
                const finalPrice = calculateFinalPrice(supplierPrice, quantity);
                const totalCost = calculateTotalCost(supplierPrice, quantity);
                const isBestDeal = index === 0;
                
                return (
                  <div 
                    key={supplierPrice.id} 
                    className={`card border-2 ${isBestDeal ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h5 className="font-semibold text-gray-900">{supplierPrice.supplierName}</h5>
                        {isBestDeal && (
                          <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full mt-1">
                            Best Deal
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-500">⭐</span>
                          <span className="text-sm text-gray-600">{supplierPrice.rating}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Base Price:</span>
                        <span>Rs. {supplierPrice.price.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Final Price:</span>
                        <span className="font-semibold">Rs. {finalPrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Cost:</span>
                        <span className="font-bold text-lg">Rs. {totalCost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Min Order:</span>
                        <span>{supplierPrice.minOrderQuantity} units</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Lead Time:</span>
                        <span>{supplierPrice.leadTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Reliability:</span>
                        <span>{supplierPrice.reliabilityScore}%</span>
                      </div>
                    </div>

                    {/* Discount Information */}
                    {supplierPrice.discountTiers.length > 1 && (
                      <div className="mb-4 p-2 bg-blue-50 rounded text-xs">
                        <strong>Bulk Discounts:</strong>
                        {supplierPrice.discountTiers.map((tier, idx) => (
                          <div key={idx} className="text-blue-700">
                            {tier.minQty}+ units: {tier.discount}% off
                          </div>
                        ))}
                      </div>
                    )}

                    {supplierPrice.notes && (
                      <div className="mb-4 p-2 bg-gray-50 rounded text-xs text-gray-600">
                        {supplierPrice.notes}
                      </div>
                    )}

                    <button
                      onClick={() => handleSelectSupplier(supplierPrice)}
                      className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
                        isBestDeal 
                          ? 'bg-green-600 text-white hover:bg-green-700' 
                          : 'bg-primary-600 text-white hover:bg-primary-700'
                      }`}
                    >
                      Select Supplier
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Price History Chart Placeholder */}
        <div className="mt-8 card">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Price History</h4>
          <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
            Price trend chart would be displayed here
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierPriceComparison; 