import React, { useState, useEffect } from 'react';

const ProductForm = ({ product, suppliers, categories, onSave, onCancel, onUpdateSuppliers, onUpdateCategories }) => {
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    sku: '',
    price: '',
    costPrice: '',
    barcode: '',
    category: '',
    stock: 0,
    minStock: '5',
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamic options with safety checks
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [currentSuppliers, setCurrentSuppliers] = useState([]);
  const commonSizes = ['5', '6', '7', '8', '9', '10', '11', '12'];
  const commonColors = ['Black', 'White', 'Brown', 'Red', 'Blue', 'Navy', 'Gray'];

  // Safety function to ensure data is properly structured
  const safeCategories = (cats) => {
    if (!Array.isArray(cats)) return [];
    return cats.filter(cat => 
      cat && 
      typeof cat === 'object' && 
      (cat._id || cat.id) && 
      cat.name && 
      typeof cat.name === 'string'
    );
  };

  const safeSuppliers = (sups) => {
    if (!Array.isArray(sups)) return [];
    return sups.filter(sup => 
      sup && 
      typeof sup === 'object' && 
      (sup.id || sup._id) && 
      sup.name && 
      typeof sup.name === 'string'
    );
  };

  useEffect(() => {
    if (product) {
      // Convert old product format to new format
      const sizeQuantities = product.sizes ? 
        product.sizes.map(size => ({ size, quantity: Math.floor(product.stock / product.sizes.length) || 1 })) : 
        [];
      
      // Clean product data to ensure form fields are strings, not objects
      setFormData({ 
        ...product, 
        category: typeof product.category === 'object' ? product.category?._id || product.category?.id : product.category,
        supplier: typeof product.supplier === 'object' ? product.supplier?.name : product.supplier,
        brand: typeof product.brand === 'object' ? product.brand?.name : product.brand,
        name: String(product.name || ''),
        price: product.price || product.sellingPrice || '',
        costPrice: product.costPrice || '',
        minStock: product.minStock || product.reorderLevel || '',
        sku: String(product.sku || ''),
        barcode: String(product.barcode || ''),
        description: String(product.description || ''),
        sizeQuantities,
        stock: product.stock || 0,
        colors: Array.isArray(product.colors) ? product.colors : [],
        images: Array.isArray(product.images) ? product.images : []
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
    const safeSuppliersData = safeSuppliers(suppliers);
    setCurrentSuppliers(safeSuppliersData);
  }, [suppliers]);

  useEffect(() => {
    const safeCategoriesData = safeCategories(categories);
    setCategoryOptions(safeCategoriesData);
  }, [categories]);

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
    if (newCategory.trim() && !categoryOptions.some(cat => cat.name === newCategory.trim())) {
      const newCategoryObj = {
        _id: Date.now().toString(),
        name: newCategory.trim(),
        description: '',
        isActive: true
      };
      const updatedCategories = [...categoryOptions, newCategoryObj];
      setCategoryOptions(updatedCategories);
      setFormData(prev => ({
        ...prev,
        category: newCategoryObj._id
      }));
      setNewCategory('');
      
      // Notify parent component about new category
      if (onUpdateCategories) {
        onUpdateCategories(updatedCategories);
      }
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
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${timestamp}${random}`.slice(-13); // Keep last 13 digits for standard barcode length
  };

  const validateForm = () => {
    const newErrors = {};

    // Basic required fields
    if (!formData.name || !formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }
    
    if (!formData.brand || !formData.brand.trim()) {
      newErrors.brand = 'Brand is required';
    }
    
    // Make category optional for now - can be added later
    // if (!formData.category) {
    //   newErrors.category = 'Category is required';
    // }
    
    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Valid price is required';
    }
    
    if (!formData.costPrice || parseFloat(formData.costPrice) <= 0) {
      newErrors.costPrice = 'Valid cost price is required';
    }
    
    // Make minStock optional with default value
    if (formData.minStock && parseInt(formData.minStock) < 0) {
      newErrors.minStock = 'Minimum stock cannot be negative';
    }

    // Show helpful messages for optional fields
    if (formData.sizeQuantities.length === 0) {
      console.warn('No sizes specified - will default to "One Size"');
    }
    
    if (formData.colors.length === 0) {
      console.warn('No colors specified - will default to "Default"');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Provide defaults for optional fields
      const defaultSizeQuantities = formData.sizeQuantities.length === 0 ? 
        [{ size: 'One Size', quantity: parseInt(formData.minStock) || 1 }] : 
        formData.sizeQuantities;
      
      const defaultColors = formData.colors.length === 0 ? ['Default'] : formData.colors;
      
      // Calculate total stock from size quantities
      const totalStock = defaultSizeQuantities.reduce((total, sq) => total + (sq.quantity || 0), 0);
      
      // Generate unique SKU if not provided
      const uniqueId = Date.now().toString().slice(-6);
      const generatedSku = formData.sku || `${formData.brand.substring(0, 3).toUpperCase()}-${uniqueId}`;
      
      // Clean data - remove empty strings and undefined values
      const processedData = {
        name: formData.name.trim(),
        brand: formData.brand.trim(),
        sku: generatedSku,
        price: parseFloat(formData.price),
        costPrice: parseFloat(formData.costPrice),
        sellingPrice: parseFloat(formData.price),
        stock: totalStock || 0,
        reorderLevel: parseInt(formData.minStock) || 5,
        unit: 'piece'
      };
      
      // Only add optional fields if they have values
      if (formData.category) processedData.category = formData.category;
      if (formData.description) processedData.description = formData.description;
      if (formData.barcode) processedData.barcode = formData.barcode;
      if (defaultSizeQuantities.length > 0) processedData.size = defaultSizeQuantities.map(sq => sq.size).join(', ');
      if (defaultColors.length > 0) processedData.color = defaultColors.join(', ');
      if (formData.images && formData.images.length > 0) processedData.images = formData.images;
      if (formData.description) processedData.notes = formData.description;
      
      console.log('=== ProductForm: Submitting product data ===');
      console.log('Processed data:', JSON.stringify(processedData, null, 2));
      await onSave(processedData);
              console.log('=== ProductForm: onSave completed successfully ===');
      } catch (error) {
        console.error('=== ProductForm: Error submitting form ===');
        console.error('Error object:', error);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        
        // Handle specific error types
        if (error.message && error.message.includes('sku already exists')) {
          setErrors({ sku: 'SKU already exists. Please use a different SKU.' });
        } else if (error.message && error.message.includes('barcode already exists')) {
          setErrors({ barcode: 'Barcode already exists. Please use a different barcode.' });
        } else if (error.message && error.message.includes('category')) {
          setErrors({ category: 'Invalid category. Please select a valid category.' });
        } else if (error.message && error.message.includes('400')) {
          setErrors({ submit: 'Invalid data submitted. Please check all fields and try again.' });
        } else {
          setErrors({ submit: error.message || 'Failed to save product. Please try again.' });
        }
      } finally {
        setIsSubmitting(false);
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
          {/* Error Summary */}
          {Object.keys(errors).length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <h4 className="text-red-800 font-semibold mb-2">Please fix the following errors:</h4>
              <ul className="text-red-700 text-sm space-y-1">
                {Object.entries(errors).map(([field, error]) => (
                  <li key={field}>
                    <strong>{field.charAt(0).toUpperCase() + field.slice(1)}:</strong> {error}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Form Status */}
          {isSubmitting && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
                <span className="text-blue-800">Saving product...</span>
              </div>
            </div>
          )}

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
              {errors.name && <span className="text-red-500 text-sm mt-1">{typeof errors.name === 'object' ? errors.name?.message || 'Invalid name' : errors.name}</span>}
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
              {errors.brand && <span className="text-red-500 text-sm mt-1">{typeof errors.brand === 'object' ? errors.brand?.message || 'Invalid brand' : errors.brand}</span>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">SKU *</label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                className="form-input w-full"
                placeholder="Auto-generated if empty"
              />
              {errors.sku && <span className="text-red-500 text-sm mt-1">{typeof errors.sku === 'object' ? errors.sku?.message || 'Invalid SKU' : errors.sku}</span>}
            </div>

            <div>
              <label className="form-label">Description</label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="form-input w-full"
                placeholder="Product description"
              />
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
                  <option value="">Select category (optional)</option>
                  {categoryOptions.map(cat => (
                    <option key={cat._id || cat.id} value={cat._id || cat.id}>
                      {String(cat.name)}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => {
                    const categoryName = prompt('Enter new category:');
                    if (categoryName && categoryName.trim()) {
                      setNewCategory(categoryName.trim());
                      // Directly call handleAddCategory after setting the category
                      setTimeout(() => {
                        if (categoryName.trim() && !categoryOptions.some(cat => cat.name === categoryName.trim())) {
                          const newCategoryObj = {
                            _id: Date.now().toString(),
                            name: categoryName.trim(),
                            description: '',
                            isActive: true
                          };
                          const updatedCategories = [...categoryOptions, newCategoryObj];
                          setCategoryOptions(updatedCategories);
                          setFormData(prev => ({
                            ...prev,
                            category: newCategoryObj._id
                          }));
                          setNewCategory('');
                          
                          // Notify parent component about new category
                          if (onUpdateCategories) {
                            onUpdateCategories(updatedCategories);
                          }
                        }
                      }, 0);
                    }
                  }}
                  className="btn btn-outline text-sm px-3"
                >
                  +
                </button>
              </div>
              {errors.category && <span className="text-red-500 text-sm mt-1">{typeof errors.category === 'object' ? errors.category?.message || 'Invalid category' : errors.category}</span>}
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
                    <option key={supplier.id || supplier._id} value={supplier.name}>
                      {String(supplier.name)}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => {
                    const supplierName = prompt('Enter new supplier name:');
                    if (supplierName && supplierName.trim()) {
                      setNewSupplier(supplierName.trim());
                      // Directly call handleAddSupplier after setting the supplier
                      setTimeout(() => {
                        if (supplierName.trim() && !currentSuppliers.some(s => s.name === supplierName.trim())) {
                          const newSupplierObj = {
                            id: Date.now().toString(),
                            name: supplierName.trim(),
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
                            supplier: supplierName.trim()
                          }));
                          setNewSupplier('');
                          
                          // Notify parent component about new supplier
                          if (onUpdateSuppliers) {
                            onUpdateSuppliers(updatedSuppliers);
                          }
                        }
                      }, 0);
                    }
                  }}
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
              {errors.price && <span className="text-red-500 text-sm mt-1">{typeof errors.price === 'object' ? errors.price?.message || 'Invalid price' : errors.price}</span>}
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
              {errors.costPrice && <span className="text-red-500 text-sm mt-1">{typeof errors.costPrice === 'object' ? errors.costPrice?.message || 'Invalid cost price' : errors.costPrice}</span>}
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
              <label className="form-label">Minimum Stock (Optional)</label>
              <input
                type="number"
                name="minStock"
                value={formData.minStock}
                onChange={handleChange}
                className="form-input w-full"
                placeholder="5 (default)"
                min="0"
              />
              <p className="text-xs text-gray-500 mt-1">Alert when stock falls below this level</p>
              {errors.minStock && <span className="text-red-500 text-sm mt-1">{typeof errors.minStock === 'object' ? errors.minStock?.message || 'Invalid minimum stock' : errors.minStock}</span>}
            </div>
          </div>

          {/* Size Management */}
          <div>
            <label className="form-label">Available Sizes & Quantities (Optional)</label>
            <p className="text-sm text-gray-600 mb-2">Add sizes and quantities, or leave empty for "One Size" default</p>
            
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
            {formData.sizeQuantities.length === 0 && (
              <div className="text-sm text-gray-500 mt-2">
                No sizes added. Will default to "One Size" when saved.
              </div>
            )}
            {errors.sizeQuantities && <span className="text-red-500 text-sm mt-1">{typeof errors.sizeQuantities === 'object' ? errors.sizeQuantities?.message || 'Invalid size quantities' : errors.sizeQuantities}</span>}
          </div>

          {/* Color Management */}
          <div>
            <label className="form-label">Available Colors (Optional)</label>
            <p className="text-sm text-gray-600 mb-2">Add colors, or leave empty for "Default" color</p>
            
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
            {formData.colors.length === 0 && (
              <div className="text-sm text-gray-500 mt-2">
                No colors added. Will default to "Default" when saved.
              </div>
            )}
            {errors.colors && <span className="text-red-500 text-sm mt-1">{typeof errors.colors === 'object' ? errors.colors?.message || 'Invalid colors' : errors.colors}</span>}
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

          {/* Debug Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h4 className="font-semibold text-blue-800 mb-2">Form Status:</h4>
            <div className="text-sm text-blue-700">
              <p><strong>Required Fields:</strong> Name: {formData.name ? '✓' : '✗'}, Brand: {formData.brand ? '✓' : '✗'}, Price: {formData.price ? '✓' : '✗'}, Cost Price: {formData.costPrice ? '✓' : '✗'}</p>
              <p><strong>Category:</strong> {formData.category ? `✓ (${categoryOptions.find(c => c._id === formData.category)?.name || 'Unknown'})` : '✗ (Optional)'}</p>
              <p><strong>Form Valid:</strong> {Object.keys(errors).length === 0 ? '✓ Ready to submit' : '✗ Has errors'}</p>
              {Object.keys(errors).length > 0 && (
                <div className="mt-2 text-red-600">
                  <strong>Errors:</strong>
                  <ul className="list-disc ml-4">
                    {Object.entries(errors).map(([field, error]) => (
                      <li key={field}>{field}: {error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button type="submit" className="btn btn-primary flex-1" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : (product ? 'Update Product' : 'Add Product')}
            </button>
            <button type="button" onClick={onCancel} className="btn btn-outline flex-1" disabled={isSubmitting}>
              {isSubmitting ? 'Cancelling...' : 'Cancel'}
            </button>
          </div>
          {errors.submit && <p className="text-red-500 text-sm mt-2">{errors.submit}</p>}
        </form>
      </div>
    </div>
  );
};

export default ProductForm; 