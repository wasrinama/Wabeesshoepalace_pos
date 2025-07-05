import React, { useState } from 'react';

const SupplierManagement = ({ suppliers, setSuppliers }) => {
  const [showForm, setShowForm] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    paymentTerms: 'Net 30',
    discountRate: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (selectedSupplier) {
      // Update existing supplier
      setSuppliers(suppliers.map(s => 
        s.id === selectedSupplier.id 
          ? { ...formData, id: selectedSupplier.id }
          : s
      ));
    } else {
      // Add new supplier
      const newSupplier = {
        ...formData,
        id: Date.now().toString(),
        discountRate: parseFloat(formData.discountRate) || 0
      };
      setSuppliers([...suppliers, newSupplier]);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      paymentTerms: 'Net 30',
      discountRate: ''
    });
    setSelectedSupplier(null);
    setShowForm(false);
  };

  const handleEdit = (supplier) => {
    setSelectedSupplier(supplier);
    setFormData({ ...supplier });
    setShowForm(true);
  };

  const handleDelete = (supplierId) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      setSuppliers(suppliers.filter(s => s.id !== supplierId));
    }
  };

  return (
    <div className="supplier-management">
      <div className="supplier-header">
        <h3>Supplier Management</h3>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          Add New Supplier
        </button>
      </div>

      <div className="suppliers-grid">
        {suppliers.map(supplier => (
          <div key={supplier.id} className="supplier-card">
            <div className="supplier-header-card">
              <h4>{supplier.name}</h4>
              <div className="supplier-actions">
                <button
                  onClick={() => handleEdit(supplier)}
                  className="btn btn-primary btn-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(supplier.id)}
                  className="btn btn-danger btn-sm"
                >
                  Delete
                </button>
              </div>
            </div>
            
            <div className="supplier-details">
              <p><strong>Contact:</strong> {supplier.contactPerson}</p>
              <p><strong>Email:</strong> {supplier.email}</p>
              <p><strong>Phone:</strong> {supplier.phone}</p>
              <p><strong>Address:</strong> {supplier.address}</p>
              <p><strong>Payment Terms:</strong> {supplier.paymentTerms}</p>
              <p><strong>Discount Rate:</strong> {supplier.discountRate}%</p>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="supplier-form-overlay">
          <div className="supplier-form-container">
            <div className="supplier-form-header">
              <h3>{selectedSupplier ? 'Edit Supplier' : 'Add New Supplier'}</h3>
              <button onClick={resetForm} className="close-btn">×</button>
            </div>

            <form onSubmit={handleSubmit} className="supplier-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Supplier Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter supplier name"
                  />
                </div>

                <div className="form-group">
                  <label>Contact Person *</label>
                  <input
                    type="text"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleChange}
                    required
                    placeholder="Enter contact person name"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Enter email address"
                  />
                </div>

                <div className="form-group">
                  <label>Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter full address"
                  rows="3"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Payment Terms</label>
                  <select
                    name="paymentTerms"
                    value={formData.paymentTerms}
                    onChange={handleChange}
                  >
                    <option value="Net 15">Net 15</option>
                    <option value="Net 30">Net 30</option>
                    <option value="Net 45">Net 45</option>
                    <option value="Net 60">Net 60</option>
                    <option value="COD">Cash on Delivery</option>
                    <option value="Prepaid">Prepaid</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Discount Rate (%)</label>
                  <input
                    type="number"
                    name="discountRate"
                    value={formData.discountRate}
                    onChange={handleChange}
                    placeholder="0"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" onClick={resetForm} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {selectedSupplier ? 'Update Supplier' : 'Add Supplier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierManagement; 