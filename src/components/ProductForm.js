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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-4xl w-full mx-4 max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">
            {product ? 'Edit Product' : 'Add New Product'}
          </h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <span className="text-2xl">×</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Product Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="form-input w-full"
                placeholder="Enter product name"
                required
              />
              {errors.name && <span className="text-red-500 text-sm mt-1">{errors.name}</span>}
            </div>

            <div>
              <label className="form-label">Brand *</label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                className="form-input w-full"
                placeholder="Enter brand name"
                required
              />
              {errors.brand && <span className="text-red-500 text-sm mt-1">{errors.brand}</span>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="form-label">Category</label>
              <div className="flex gap-2">
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="form-input flex-1"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setNewCategory(prompt('Enter new category:') || '')}
                  className="btn btn-outline text-sm px-3"
                >
                  +
                </button>
              </div>
            </div>

            <div>
              <label className="form-label">Barcode</label>
              <input
                type="text"
                name="barcode"
                value={formData.barcode}
                onChange={handleChange}
                className="form-input w-full"
                placeholder="Auto-generated"
              />
            </div>

            <div>
              <label className="form-label">Supplier</label>
              <div className="flex gap-2">
                <select
                  name="supplier"
                  value={formData.supplier}
                  onChange={handleChange}
                  className="form-input flex-1"
                >
                  <option value="">Select supplier</option>
                  {currentSuppliers.map(supplier => (
                    <option key={supplier.id} value={supplier.name}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setNewSupplier(prompt('Enter new supplier name:') || '')}
                  className="btn btn-outline text-sm px-3"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Selling Price (Rs.) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="form-input w-full"
                placeholder="0.00"
                step="0.01"
                required
              />
              {errors.price && <span className="text-red-500 text-sm mt-1">{errors.price}</span>}
            </div>

            <div>
              <label className="form-label">Cost Price (Rs.) *</label>
              <input
                type="number"
                name="costPrice"
                value={formData.costPrice}
                onChange={handleChange}
                className="form-input w-full"
                placeholder="0.00"
                step="0.01"
                required
              />
              {errors.costPrice && <span className="text-red-500 text-sm mt-1">{errors.costPrice}</span>}
            </div>
          </div>

          {/* Stock Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Current Stock</label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                className="form-input w-full bg-gray-100"
                readOnly
              />
              <p className="text-sm text-gray-500 mt-1">Auto-calculated from size quantities</p>
            </div>

            <div>
              <label className="form-label">Minimum Stock Alert</label>
              <input
                type="number"
                name="minStock"
                value={formData.minStock}
                onChange={handleChange}
                className="form-input w-full"
                placeholder="10"
                min="0"
              />
              {errors.minStock && <span className="text-red-500 text-sm mt-1">{errors.minStock}</span>}
            </div>
          </div>

          {/* Size Management */}
          <div>
            <label className="form-label">Available Sizes & Quantities *</label>
            
            {/* Add Size Section */}
            <div className="flex gap-2 mb-4">
              <select
                value={newSize}
                onChange={(e) => setNewSize(e.target.value)}
                className="form-input"
              >
                <option value="">Select size</option>
                {commonSizes.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
              <input
                type="text"
                value={newSize}
                onChange={(e) => setNewSize(e.target.value)}
                className="form-input flex-1"
                placeholder="Or enter custom size"
              />
              <button
                type="button"
                onClick={handleAddSize}
                className="btn btn-primary"
              >
                Add Size
              </button>
            </div>

            {/* Size List */}
            <div className="space-y-2">
              {formData.sizeQuantities.map((sq, index) => (
                <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium min-w-16">Size {sq.size}:</span>
                  <input
                    type="number"
                    value={sq.quantity}
                    onChange={(e) => handleSizeQuantityChange(sq.size, e.target.value)}
                    className="form-input flex-1"
                    min="0"
                  />
                  <span className="text-sm text-gray-500">pieces</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSize(sq.size)}
                    className="btn btn-danger text-sm px-2 py-1"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            {errors.sizeQuantities && <span className="text-red-500 text-sm mt-1">{errors.sizeQuantities}</span>}
          </div>

          {/* Color Management */}
          <div>
            <label className="form-label">Available Colors *</label>
            
            {/* Add Color Section */}
            <div className="flex gap-2 mb-4">
              <select
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                className="form-input"
              >
                <option value="">Select color</option>
                {commonColors.map(color => (
                  <option key={color} value={color}>{color}</option>
                ))}
              </select>
              <input
                type="text"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                className="form-input flex-1"
                placeholder="Or enter custom color"
              />
              <button
                type="button"
                onClick={handleAddColor}
                className="btn btn-primary"
              >
                Add Color
              </button>
            </div>

            {/* Color List */}
            <div className="flex flex-wrap gap-2">
              {formData.colors.map((color, index) => (
                <div key={index} className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1">
                  <span className="text-sm">{color}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveColor(color)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            {errors.colors && <span className="text-red-500 text-sm mt-1">{errors.colors}</span>}
          </div>

          {/* Image Management */}
          <div>
            <label className="form-label">Product Images</label>
            
            {/* Add Image Section */}
            <div className="flex gap-2 mb-4">
              <input
                type="url"
                value={newImage}
                onChange={(e) => setNewImage(e.target.value)}
                className="form-input flex-1"
                placeholder="Enter image URL"
              />
              <button
                type="button"
                onClick={handleAddImage}
                className="btn btn-primary"
              >
                Add Image
              </button>
            </div>

            {/* Image List */}
            <div className="space-y-2">
              {formData.images.map((image, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  <img
                    src={image}
                    alt={`Product ${index + 1}`}
                    className="w-16 h-16 object-cover rounded"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  <input
                    type="url"
                    value={image}
                    onChange={(e) => {
                      const newImages = [...formData.images];
                      newImages[index] = e.target.value;
                      setFormData(prev => ({ ...prev, images: newImages }));
                    }}
                    className="form-input flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(image)}
                    className="btn btn-danger text-sm px-2 py-1"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="form-label">Product Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="form-input w-full"
              rows="4"
              placeholder="Enter product description (optional)"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button type="submit" className="btn btn-primary flex-1">
              {product ? 'Update Product' : 'Add Product'}
            </button>
            <button type="button" onClick={onCancel} className="btn btn-outline flex-1">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm; 