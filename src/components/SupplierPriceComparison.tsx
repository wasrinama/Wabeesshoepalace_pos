import React, { useState, useEffect, ChangeEvent } from 'react';
import apiService from '../services/apiService';
import { IProduct, ISupplier } from '../types/index';

interface DiscountTier {
  minQty: number;
  discount: number;
}

interface SupplierPrice {
  id: string;
  supplierId: string;
  supplierName: string;
  price: number;
  minOrderQuantity: number;
  leadTime: string;
  rating: number;
  reliabilityScore: number;
  lastUpdated: string;
  notes: string;
  discountTiers: DiscountTier[];
}

interface NewSupplierPrice {
  supplierId: string;
  price: number;
  minOrderQuantity: number;
  leadTime: string;
  notes: string;
}

interface SupplierPriceComparisonProps {
  product: IProduct;
  suppliers: ISupplier[];
  onSelectSupplier: (supplier: any) => void;
  onClose: () => void;
}

const SupplierPriceComparison: React.FC<SupplierPriceComparisonProps> = ({ 
  product, 
  suppliers, 
  onSelectSupplier, 
  onClose 
}) => {
  const [quantity, setQuantity] = useState<number>(1);
  const [showAddSupplierPrice, setShowAddSupplierPrice] = useState<boolean>(false);
  const [supplierPrices, setSupplierPrices] = useState<SupplierPrice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [newSupplierPrice, setNewSupplierPrice] = useState<NewSupplierPrice>({
    supplierId: '',
    price: 0,
    minOrderQuantity: 1,
    leadTime: '',
    notes: ''
  });

  // Fetch supplier prices from API
  useEffect(() => {
    if (product && product._id) {
      fetchSupplierPrices();
    }
  }, [product]);

  const fetchSupplierPrices = async (): Promise<void> => {
    try {
      setLoading(true);
      setError('');
      const response = await apiService.getSuppliers();
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

  const calculateFinalPrice = (supplierPrice: SupplierPrice, qty: number): number => {
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

  const getBestDeal = (): SupplierPrice | null => {
    if (supplierPrices.length === 0) return null;
    
    return supplierPrices.reduce((best, current) => {
      const bestPrice = calculateFinalPrice(best, quantity);
      const currentPrice = calculateFinalPrice(current, quantity);
      return currentPrice < bestPrice ? current : best;
    });
  };

  const handleSelectSupplier = (supplierPrice: SupplierPrice): void => {
    const finalPrice = calculateFinalPrice(supplierPrice, quantity);
    onSelectSupplier({
      supplier: supplierPrice.supplierName,
      price: finalPrice,
      quantity: quantity,
      total: finalPrice * quantity,
      leadTime: supplierPrice.leadTime
    });
    onClose();
  };

  const handleQuantityChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setQuantity(Math.max(1, parseInt(e.target.value) || 1));
  };

  const sortedSupplierPrices = [...supplierPrices].sort((a, b) => {
    const aPrice = calculateFinalPrice(a, quantity);
    const bPrice = calculateFinalPrice(b, quantity);
    return aPrice - bPrice;
  });

  const bestDeal = getBestDeal();

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
          <div className="text-center">Loading supplier prices...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-4xl w-full mx-4 max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Supplier Price Comparison</h3>
            <p className="text-gray-600">{product.name}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <span className="text-2xl">×</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Quantity Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Order Quantity
          </label>
          <input
            type="number"
            value={quantity}
            onChange={handleQuantityChange}
            className="form-input w-32"
            min="1"
          />
        </div>

        {/* Supplier Price Cards */}
        <div className="space-y-4">
          {sortedSupplierPrices.map((supplierPrice, index) => {
            const finalPrice = calculateFinalPrice(supplierPrice, quantity);
            const totalCost = finalPrice * quantity;
            const isBestDeal = bestDeal && supplierPrice.id === bestDeal.id;
            const discount = supplierPrice.discountTiers.find(tier => 
              quantity >= tier.minQty
            );

            return (
              <div 
                key={supplierPrice.id}
                className={`card border ${isBestDeal ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      {supplierPrice.supplierName}
                      {isBestDeal && <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">Best Deal</span>}
                    </h4>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                      <span>Rating: {supplierPrice.rating}/5</span>
                      <span>Reliability: {supplierPrice.reliabilityScore}%</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">
                      Rs. {finalPrice.toFixed(2)} <span className="text-sm font-normal">per unit</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Total: Rs. {totalCost.toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <span className="text-sm text-gray-600">Base Price:</span>
                    <div className="font-semibold">Rs. {supplierPrice.price.toFixed(2)}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Min Order:</span>
                    <div className="font-semibold">{supplierPrice.minOrderQuantity} units</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Lead Time:</span>
                    <div className="font-semibold">{supplierPrice.leadTime}</div>
                  </div>
                </div>

                {discount && discount.discount > 0 && (
                  <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded">
                    <span className="text-sm text-blue-800">
                      {discount.discount}% discount applied for {quantity}+ units
                    </span>
                  </div>
                )}

                {supplierPrice.notes && (
                  <div className="mb-3 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                    {supplierPrice.notes}
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    Last updated: {supplierPrice.lastUpdated}
                  </span>
                  <button
                    onClick={() => handleSelectSupplier(supplierPrice)}
                    className={`btn ${isBestDeal ? 'btn-primary' : 'btn-outline'}`}
                    disabled={quantity < supplierPrice.minOrderQuantity}
                  >
                    {quantity < supplierPrice.minOrderQuantity 
                      ? `Min order: ${supplierPrice.minOrderQuantity}`
                      : 'Select Supplier'
                    }
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {supplierPrices.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-500">
            No supplier prices available for this product
          </div>
        )}
      </div>
    </div>
  );
};

export default SupplierPriceComparison; 