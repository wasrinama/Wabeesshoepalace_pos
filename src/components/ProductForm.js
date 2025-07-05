import React, { useState, useEffect } from 'react';

const ProductForm = ({ product, suppliers, onSave, onCancel, onUpdateSuppliers }) => {
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    price: '',
    costPrice: '',
    barcode: '',
    category: 'Running',
    stock: 0,
    minStock: '',
    sizeQuantities: [], // Array of objects: {size: '8', quantity: 10}
    colors: [],
    images: [],
    description: '',
    supplier: ''
  });

  const [newSize, setNewSize] = useState('');
  const [newColor, setNewColor] = useState('');
  const [newImage, setNewImage] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newSupplier, setNewSupplier] = useState('');
  const [errors, setErrors] = useState({});

  // Dynamic options
  const [categories, setCategories] = useState(['Running', 'Casual', 'Basketball', 'Skate', 'Formal', 'Boots', 'Sandals']);
  const [currentSuppliers, setCurrentSuppliers] = useState(suppliers || []);
  const commonSizes = ['5', '6', '7', '8', '9', '10', '11', '12'];
  const commonColors = ['Black', 'White', 'Brown', 'Red', 'Blue', 'Navy', 'Gray'];

  useEffect(() => {
    if (product) {
      // Convert old product format to new format
      const sizeQuantities = product.sizes ? 
        product.sizes.map(size => ({ size, quantity: Math.floor(product.stock / product.sizes.length) || 1 })) : 
        [];
      
      setFormData({ 
        ...product, 
        sizeQuantities,
        stock: product.stock || 0
      });
    } else {
      // Auto-generate barcode for new products
      setFormData(prev => ({
        ...prev,
        barcode: generateBarcode()
      }));
    }
  }, [product]);

  useEffect(() => {
    setCurrentSuppliers(suppliers || []);
  }, [suppliers]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleAddSize = () => {
    if (newSize && !formData.sizeQuantities.some(sq => sq.size === newSize)) {
      setFormData(prev => ({
        ...prev,
        sizeQuantities: [...prev.sizeQuantities, { size: newSize, quantity: 1 }]
      }));
      setNewSize('');
      calculateTotalStock();
    }
  };

  const handleRemoveSize = (size) => {
    setFormData(prev => ({
      ...prev,
      sizeQuantities: prev.sizeQuantities.filter(sq => sq.size !== size)
    }));
    calculateTotalStock();
  };

  const handleSizeQuantityChange = (size, quantity) => {
    setFormData(prev => ({
      ...prev,
      sizeQuantities: prev.sizeQuantities.map(sq => 
        sq.size === size ? { ...sq, quantity: parseInt(quantity) || 0 } : sq
      )
    }));
    calculateTotalStock();
  };

  const calculateTotalStock = () => {
    setTimeout(() => {
      setFormData(prev => ({
        ...prev,
        stock: prev.sizeQuantities.reduce((total, sq) => total + (sq.quantity || 0), 0)
      }));
    }, 100);
  };

  const handleAddColor = () => {
    if (newColor && !formData.colors.includes(newColor)) {
      setFormData(prev => ({
        ...prev,
        colors: [...prev.colors, newColor]
      }));
      setNewColor('');
    }
  };

  const handleRemoveColor = (color) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.filter(c => c !== color)
    }));
  };

  const handleAddImage = () => {
    if (newImage && !formData.images.includes(newImage)) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, newImage]
      }));
      setNewImage('');
    }
  };

  const handleRemoveImage = (image) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter(i => i !== image)
    }));
  };

  const handleAddCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      const updatedCategories = [...categories, newCategory.trim()];
      setCategories(updatedCategories);
      setFormData(prev => ({
        ...prev,
        category: newCategory.trim()
      }));
      setNewCategory('');
    }
  };

  const handleAddSupplier = () => {
    if (newSupplier.trim() && !currentSuppliers.some(s => s.name === newSupplier.trim())) {
      const newSupplierObj = {
        id: Date.now().toString(),
        name: newSupplier.trim(),
        contactPerson: '',
        email: '',
        phone: '',
        address: '',
        paymentTerms: 'Net 30',
        discountRate: 0
      };
      const updatedSuppliers = [...currentSuppliers, newSupplierObj];
      setCurrentSuppliers(updatedSuppliers);
      setFormData(prev => ({
        ...prev,
        supplier: newSupplier.trim()
      }));
      setNewSupplier('');
      
      // Notify parent component about new supplier
      if (onUpdateSuppliers) {
        onUpdateSuppliers(updatedSuppliers);
      }
    }
  };

  // Generate unique barcode
  const generateBarcode = () => {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${timestamp}${random}`.slice(-13); // Keep last 13 digits for standard barcode length
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Required';
    if (!formData.brand.trim()) newErrors.brand = 'Required';
    if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = 'Required';
    if (!formData.costPrice || parseFloat(formData.costPrice) <= 0) newErrors.costPrice = 'Required';
    if (formData.sizeQuantities.length === 0) newErrors.sizeQuantities = 'At least one size is required';
    if (formData.colors.length === 0) newErrors.colors = 'At least one color is required';
    if (!formData.minStock || parseInt(formData.minStock) < 0) newErrors.minStock = 'Required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const processedData = {
        ...formData,
        price: parseFloat(formData.price),
        costPrice: parseFloat(formData.costPrice),
        stock: formData.stock, // Already calculated from size quantities
        minStock: parseInt(formData.minStock),
        barcode: formData.barcode || generateBarcode(), // Ensure barcode is always present
        sizes: formData.sizeQuantities.map(sq => sq.size) // Convert back to simple array for display
      };
      onSave(processedData);
    }
  };

  return (
    <div className="product-form-overlay">
      <div className="product-form-container">
        <div className="product-form-header">
          <h2>{product ? 'Edit Product' : 'Add New Product'}</h2>
          <button onClick={onCancel} className="close-btn">×</button>
        </div>

        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-row">
            <div className="form-group">
              <label>Product Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={errors.name ? 'error' : ''}
                placeholder="Enter product name"
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label>Brand *</label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                className={errors.brand ? 'error' : ''}
                placeholder="Enter brand name"
              />
              {errors.brand && <span className="error-message">{errors.brand}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <div className="category-input-row">
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Add new category"
                />
                <button type="button" onClick={handleAddCategory} className="add-btn">
                  Add Category
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Supplier</label>
              <select
                name="supplier"
                value={formData.supplier}
                onChange={handleChange}
              >
                <option value="">Select supplier</option>
                {currentSuppliers.map(supplier => (
                  <option key={supplier.id} value={supplier.name}>{supplier.name}</option>
                ))}
              </select>
              <div className="supplier-input-row">
                <input
                  type="text"
                  value={newSupplier}
                  onChange={(e) => setNewSupplier(e.target.value)}
                  placeholder="Add new supplier"
                />
                <button type="button" onClick={handleAddSupplier} className="add-btn">
                  Add Supplier
                </button>
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Selling Price *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className={errors.price ? 'error' : ''}
                placeholder="Rs. 0.00"
                step="0.01"
                min="0"
              />
              {errors.price && <span className="error-message">{errors.price}</span>}
            </div>

            <div className="form-group">
              <label>Cost Price *</label>
              <input
                type="number"
                name="costPrice"
                value={formData.costPrice}
                onChange={handleChange}
                className={errors.costPrice ? 'error' : ''}
                placeholder="Rs. 0.00"
                step="0.01"
                min="0"
              />
              {errors.costPrice && <span className="error-message">{errors.costPrice}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Barcode (Auto-Generated)</label>
              <input
                type="text"
                name="barcode"
                value={formData.barcode}
                readOnly
                className="barcode-readonly"
                placeholder="Auto-generated barcode"
              />
              <small style={{color: '#7f8c8d', fontSize: '0.8rem'}}>
                Barcode is automatically generated by the system
              </small>
            </div>

            <div className="form-group">
              <label>Minimum Stock *</label>
              <input
                type="number"
                name="minStock"
                value={formData.minStock}
                onChange={handleChange}
                className={errors.minStock ? 'error' : ''}
                placeholder="0"
                min="0"
              />
              {errors.minStock && <span className="error-message">{errors.minStock}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Total Stock Quantity (Auto-Calculated)</label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                readOnly
                className="barcode-readonly"
                placeholder="0"
              />
              <small style={{color: '#7f8c8d', fontSize: '0.8rem'}}>
                Total calculated from individual size quantities
              </small>
            </div>
          </div>

          <div className="form-group">
            <label>Available Sizes & Quantities *</label>
            <div className="size-input-row">
              <select
                value={newSize}
                onChange={(e) => setNewSize(e.target.value)}
              >
                <option value="">Select size</option>
                {commonSizes.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
              <button type="button" onClick={handleAddSize} className="add-btn">
                Add Size
              </button>
            </div>
            <div className="size-quantities-list">
              {formData.sizeQuantities.map((sizeQty, index) => (
                <div key={sizeQty.size} className="size-quantity-item">
                  <span className="size-label">Size {sizeQty.size}:</span>
                  <input
                    type="number"
                    value={sizeQty.quantity}
                    onChange={(e) => handleSizeQuantityChange(sizeQty.size, e.target.value)}
                    min="0"
                    placeholder="0"
                    className="quantity-input"
                  />
                  <button type="button" onClick={() => handleRemoveSize(sizeQty.size)} className="remove-btn">
                    ×
                  </button>
                </div>
              ))}
            </div>
            {errors.sizeQuantities && <span className="error-message">{errors.sizeQuantities}</span>}
          </div>

          <div className="form-group">
            <label>Available Colors *</label>
            <div className="color-input-row">
              <select
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
              >
                <option value="">Select color</option>
                {commonColors.map(color => (
                  <option key={color} value={color}>{color}</option>
                ))}
              </select>
              <button type="button" onClick={handleAddColor} className="add-btn">
                Add Color
              </button>
            </div>
            <div className="selected-items">
              {formData.colors.map(color => (
                <span key={color} className="selected-item">
                  {color}
                  <button type="button" onClick={() => handleRemoveColor(color)}>×</button>
                </span>
              ))}
            </div>
            {errors.colors && <span className="error-message">{errors.colors}</span>}
          </div>

          <div className="form-group">
            <label>Product Images</label>
            <div className="image-input-row">
              <input
                type="text"
                value={newImage}
                onChange={(e) => setNewImage(e.target.value)}
                placeholder="Enter image URL"
              />
              <button type="button" onClick={handleAddImage} className="add-btn">
                Add Image
              </button>
            </div>
            <div className="selected-items">
              {formData.images.map((image, index) => (
                <span key={index} className="selected-item">
                  Image {index + 1}
                  <button type="button" onClick={() => handleRemoveImage(image)}>×</button>
                </span>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter product description"
              rows="3"
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={onCancel} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {product ? 'Update Product' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm; 