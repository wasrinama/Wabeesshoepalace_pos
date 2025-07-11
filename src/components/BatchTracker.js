import React, { useState } from 'react';

const BatchTracker = ({ product, batches, onUpdateBatches, onClose }) => {
  const [newBatch, setNewBatch] = useState({
    batchNumber: '',
    quantity: '',
    expiryDate: '',
    manufacturingDate: '',
    supplier: '',
    costPrice: '',
    location: '',
    notes: ''
  });
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddBatch = (e) => {
    e.preventDefault();
    const batch = {
      ...newBatch,
      id: Date.now().toString(),
      productId: product.id,
      dateAdded: new Date().toISOString().split('T')[0],
      quantity: parseInt(newBatch.quantity),
      costPrice: parseFloat(newBatch.costPrice),
      status: 'Active'
    };
    
    const updatedBatches = [...batches, batch];
    onUpdateBatches(updatedBatches);
    
    setNewBatch({
      batchNumber: '',
      quantity: '',
      expiryDate: '',
      manufacturingDate: '',
      supplier: '',
      costPrice: '',
      location: '',
      notes: ''
    });
    setShowAddForm(false);
  };

  const handleAdjustQuantity = (batchId, adjustment) => {
    const updatedBatches = batches.map(batch => {
      if (batch.id === batchId) {
        const newQuantity = Math.max(0, batch.quantity + adjustment);
        return { ...batch, quantity: newQuantity };
      }
      return batch;
    });
    onUpdateBatches(updatedBatches);
  };

  const handleDeleteBatch = (batchId) => {
    if (window.confirm('Are you sure you want to delete this batch?')) {
      const updatedBatches = batches.filter(batch => batch.id !== batchId);
      onUpdateBatches(updatedBatches);
    }
  };

  const getExpiryStatus = (expiryDate) => {
    if (!expiryDate) return { status: 'no-expiry', label: 'No Expiry', color: 'gray' };
    
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysToExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    
    if (daysToExpiry < 0) {
      return { status: 'expired', label: 'Expired', color: 'red' };
    } else if (daysToExpiry <= 7) {
      return { status: 'expiring-soon', label: `${daysToExpiry} days left`, color: 'yellow' };
    } else if (daysToExpiry <= 30) {
      return { status: 'expiring-month', label: `${daysToExpiry} days left`, color: 'orange' };
    } else {
      return { status: 'fresh', label: `${daysToExpiry} days left`, color: 'green' };
    }
  };

  const productBatches = batches.filter(batch => batch.productId === product.id);
  const totalBatchQuantity = productBatches.reduce((sum, batch) => sum + batch.quantity, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-6xl w-full mx-4 max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Batch Tracking</h3>
            <p className="text-gray-600">{product.name} - Total Quantity: {totalBatchQuantity}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <span className="text-2xl">×</span>
          </button>
        </div>

        <div className="mb-6">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn btn-primary"
          >
            Add New Batch
          </button>
        </div>

        {/* Add Batch Form */}
        {showAddForm && (
          <div className="card mb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Add New Batch</h4>
            <form onSubmit={handleAddBatch} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="form-label">Batch Number *</label>
                  <input
                    type="text"
                    value={newBatch.batchNumber}
                    onChange={(e) => setNewBatch({...newBatch, batchNumber: e.target.value})}
                    className="form-input w-full"
                    required
                    placeholder="BAT-001"
                  />
                </div>
                <div>
                  <label className="form-label">Quantity *</label>
                  <input
                    type="number"
                    value={newBatch.quantity}
                    onChange={(e) => setNewBatch({...newBatch, quantity: e.target.value})}
                    className="form-input w-full"
                    required
                    min="1"
                  />
                </div>
                <div>
                  <label className="form-label">Cost Price</label>
                  <input
                    type="number"
                    value={newBatch.costPrice}
                    onChange={(e) => setNewBatch({...newBatch, costPrice: e.target.value})}
                    className="form-input w-full"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Manufacturing Date</label>
                  <input
                    type="date"
                    value={newBatch.manufacturingDate}
                    onChange={(e) => setNewBatch({...newBatch, manufacturingDate: e.target.value})}
                    className="form-input w-full"
                  />
                </div>
                <div>
                  <label className="form-label">Expiry Date</label>
                  <input
                    type="date"
                    value={newBatch.expiryDate}
                    onChange={(e) => setNewBatch({...newBatch, expiryDate: e.target.value})}
                    className="form-input w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Supplier</label>
                  <input
                    type="text"
                    value={newBatch.supplier}
                    onChange={(e) => setNewBatch({...newBatch, supplier: e.target.value})}
                    className="form-input w-full"
                    placeholder="Supplier name"
                  />
                </div>
                <div>
                  <label className="form-label">Storage Location</label>
                  <input
                    type="text"
                    value={newBatch.location}
                    onChange={(e) => setNewBatch({...newBatch, location: e.target.value})}
                    className="form-input w-full"
                    placeholder="Shelf A-1"
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Notes</label>
                <textarea
                  value={newBatch.notes}
                  onChange={(e) => setNewBatch({...newBatch, notes: e.target.value})}
                  className="form-textarea w-full"
                  rows="2"
                  placeholder="Additional notes about this batch"
                />
              </div>

              <div className="flex gap-3">
                <button type="submit" className="btn btn-primary">Add Batch</button>
                <button 
                  type="button" 
                  onClick={() => setShowAddForm(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Batch List */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900">Current Batches</h4>
          
          {productBatches.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No batches found for this product
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {productBatches.map(batch => {
                const expiryStatus = getExpiryStatus(batch.expiryDate);
                return (
                  <div key={batch.id} className="card border">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h5 className="font-semibold text-gray-900">Batch: {batch.batchNumber}</h5>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            expiryStatus.color === 'red' ? 'bg-red-100 text-red-800' :
                            expiryStatus.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                            expiryStatus.color === 'orange' ? 'bg-orange-100 text-orange-800' :
                            expiryStatus.color === 'green' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {expiryStatus.label}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteBatch(batch.id)}
                        className="text-red-500 hover:text-red-700"
                        title="Delete batch"
                      >
                        🗑️
                      </button>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex justify-between">
                        <span>Quantity:</span>
                        <span className="font-semibold">{batch.quantity}</span>
                      </div>
                      {batch.costPrice > 0 && (
                        <div className="flex justify-between">
                          <span>Cost Price:</span>
                          <span>Rs. {batch.costPrice.toFixed(2)}</span>
                        </div>
                      )}
                      {batch.manufacturingDate && (
                        <div className="flex justify-between">
                          <span>Mfg Date:</span>
                          <span>{batch.manufacturingDate}</span>
                        </div>
                      )}
                      {batch.expiryDate && (
                        <div className="flex justify-between">
                          <span>Expiry Date:</span>
                          <span>{batch.expiryDate}</span>
                        </div>
                      )}
                      {batch.supplier && (
                        <div className="flex justify-between">
                          <span>Supplier:</span>
                          <span>
                            {typeof batch.supplier === 'object' ? batch.supplier?.name : batch.supplier}
                          </span>
                        </div>
                      )}
                      {batch.location && (
                        <div className="flex justify-between">
                          <span>Location:</span>
                          <span>{batch.location}</span>
                        </div>
                      )}
                    </div>

                    {/* Quantity Adjustment */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm text-gray-600">Adjust Quantity:</span>
                      <button
                        onClick={() => handleAdjustQuantity(batch.id, -1)}
                        className="w-8 h-8 rounded-full bg-red-100 text-red-600 hover:bg-red-200 flex items-center justify-center"
                        disabled={batch.quantity <= 0}
                      >
                        -
                      </button>
                      <span className="px-3 py-1 bg-gray-100 rounded text-sm font-medium">
                        {batch.quantity}
                      </span>
                      <button
                        onClick={() => handleAdjustQuantity(batch.id, 1)}
                        className="w-8 h-8 rounded-full bg-green-100 text-green-600 hover:bg-green-200 flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>

                    {batch.notes && (
                      <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                        <strong>Notes:</strong> {batch.notes}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BatchTracker; 