import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, ShoppingBag, Users, TrendingUp, Edit, Trash2, Plus, X, Image } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    revenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showEditProduct, setShowEditProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showEditCategory, setShowEditCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  
  const [productForm, setProductForm] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    stock: '',
    category_id: '',
    is_customizable: true
  });
  
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    slug: '',
    description: '',
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [modelFile, setModelFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [modelFileName, setModelFileName] = useState('');

  const { isAdmin, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }
    loadDashboardData();
    loadCategories();
  }, [isAdmin, navigate]);

  const loadCategories = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/categories');
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Error loading categories:', error);
      alert('Gagal mengambil kategori');
    }
  };

  const loadDashboardData = async () => {
    try {
      const [productsRes, ordersRes] = await Promise.all([
        axios.get('http://localhost:5000/api/products?limit=100'),
        axios.get('http://localhost:5000/api/orders')
      ]);

      const productsData = productsRes.data.products;
      const ordersData = ordersRes.data.orders;

      setProducts(productsData);
      setOrders(ordersData);

      const pendingOrders = ordersData.filter(o => o.status === 'pending').length;
      const revenue = ordersData
        .filter(o => o.status === 'completed')
        .reduce((sum, o) => sum + parseFloat(o.total_price), 0);

      setStats({
        totalProducts: productsData.length,
        totalOrders: ordersData.length,
        pendingOrders,
        revenue
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
      alert('Gagal memuat data dashboard');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setImageFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        alert('Hanya file gambar yang diperbolehkan!');
        e.target.value = '';
      }
    }
  };

  const handleModelChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.name.endsWith('.glb') || file.name.endsWith('.gltf')) {
        setModelFile(file);
        setModelFileName(file.name);
      } else {
        alert('Hanya file GLB/GLTF yang diperbolehkan!');
        e.target.value = '';
      }
    }
  };

  const resetProductForm = () => {
    setProductForm({
      name: '',
      slug: '',
      description: '',
      price: '',
      stock: '',
      category_id: '',
      is_customizable: true
    });
    setImageFile(null);
    setImagePreview(null);
    setShowAddProduct(false);
    setShowEditProduct(false);
    setEditingProduct(null);
  };

  const resetCategoryForm = () => {
    setCategoryForm({
      name: '',
      slug: '',
      description: '',
    });
    setModelFile(null);
    setModelFileName('');
    setShowAddCategory(false);
    setShowEditCategory(false);
    setEditingCategory(null);
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleProductFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProductForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (name === 'name') {
      setProductForm(prev => ({
        ...prev,
        slug: generateSlug(value)
      }));
    }
  };

  const handleCategoryFormChange = (e) => {
    const { name, value } = e.target;
    setCategoryForm(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'name') {
      setCategoryForm(prev => ({
        ...prev,
        slug: generateSlug(value)
      }));
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    
    if (!imageFile && showAddProduct) {
      alert('Gambar produk wajib diupload!');
      return;
    }

    const form = new FormData();
    Object.keys(productForm).forEach(key => {
      form.append(key, productForm[key]);
    });
    
    if (imageFile) form.append('image', imageFile);

    try {
      await axios.post('http://localhost:5000/api/products', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      alert('Produk berhasil ditambahkan!');
      resetProductForm();
      loadDashboardData();
    } catch (error) {
      alert('Gagal menambahkan produk: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    
    const form = new FormData();
    Object.keys(productForm).forEach(key => {
      form.append(key, productForm[key]);
    });
    
    if (imageFile) form.append('image', imageFile);

    try {
      await axios.put(`http://localhost:5000/api/products/${editingProduct.id}`, form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      alert('Produk berhasil diupdate!');
      resetProductForm();
      loadDashboardData();
    } catch (error) {
      if (error.response?.status === 401) {
        alert('Sesi telah berakhir. Silakan login kembali.');
        logout();
        navigate('/login');
      } else {
        alert('Gagal mengupdate produk: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Yakin ingin menghapus produk ini? File terkait juga akan dihapus.')) return;
    
    try {
      await axios.delete(`http://localhost:5000/api/products/${id}`);
      alert('Produk berhasil dihapus');
      loadDashboardData();
    } catch (error) {
      alert('Gagal menghapus produk: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    
    if (!modelFile && showAddCategory) {
      alert('File GLB/GLTF wajib diupload!');
      return;
    }

    const form = new FormData();
    Object.keys(categoryForm).forEach(key => {
      form.append(key, categoryForm[key]);
    });
    
    if (modelFile) form.append('model_3d', modelFile);

    try {
      await axios.post('http://localhost:5000/api/categories', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Kategori berhasil ditambahkan!');
      resetCategoryForm();
      loadCategories();
    } catch (error) {
      alert('Gagal menambahkan kategori: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEditCategory = (category) => {
      setEditingCategory(category);
      setCategoryForm({
        name: category.name,
        slug: category.slug,
        description: category.description || '',
      });
      setModelFileName(category.model_3d_url ? category.model_3d_url.split('/').pop() : '');
      setShowEditCategory(true);
    };

    const handleUpdateCategory = async (e) => {
    e.preventDefault();

    if (!categoryForm.name || !categoryForm.slug) {
      alert("Nama dan slug wajib diisi.");
      return;
    }

    const form = new FormData();
    form.append("name", categoryForm.name);
    form.append("slug", categoryForm.slug);
    form.append("description", categoryForm.description || "");
    if (modelFile) form.append("model_3d", modelFile);

    try {
      await axios.put(
        `http://localhost:5000/api/categories/${editingCategory.id}`,
        form,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true
        }
      );

      alert("Kategori berhasil diupdate!");
      resetCategoryForm();
      loadCategories();
    } catch (error) {
      console.error(error);
      alert("Gagal mengupdate kategori: " + (error.response?.data?.message || error.message));
    }
  };


  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Yakin ingin menghapus kategori ini?')) return;
    
    try {
      await axios.delete(`http://localhost:5000/api/categories/${id}`);
      alert('Kategori berhasil dihapus!');
      loadCategories();
      loadDashboardData();
    } catch (error) {
      alert('Gagal menghapus kategori: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/orders/${orderId}/status`, {
        status: newStatus
      });
      alert('Status pesanan berhasil diupdate');
      loadDashboardData();
    } catch (error) {
      alert('Gagal mengupdate status pesanan: ' + (error.response?.data?.message || error.message));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-accent-green border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-primary-dark mb-2">
            Dashboard Admin
          </h1>
          <p className="text-gray-600">
            Selamat datang, {user?.name}
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Produk</p>
                <p className="text-3xl font-bold text-primary-dark">{stats.totalProducts}</p>
              </div>
              <Package size={48} className="text-accent-green" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Pesanan</p>
                <p className="text-3xl font-bold text-primary-dark">{stats.totalOrders}</p>
              </div>
              <ShoppingBag size={48} className="text-blue-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Pending Orders</p>
                <p className="text-3xl font-bold text-primary-dark">{stats.pendingOrders}</p>
              </div>
              <Users size={48} className="text-yellow-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Revenue</p>
                <p className="text-2xl font-bold text-primary-dark">{formatPrice(stats.revenue)}</p>
              </div>
              <TrendingUp size={48} className="text-green-500" />
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-3 font-semibold transition ${
                  activeTab === 'overview'
                    ? 'bg-accent-green text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('products')}
                className={`px-6 py-3 font-semibold transition ${
                  activeTab === 'products'
                    ? 'bg-accent-green text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Produk ({products.length})
              </button>
              <button
                onClick={() => setActiveTab('categories')}
                className={`px-6 py-3 font-semibold transition ${
                  activeTab === 'categories'
                    ? 'bg-accent-green text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Kategori ({categories.length})
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`px-6 py-3 font-semibold transition ${
                  activeTab === 'orders'
                    ? 'bg-accent-green text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Pesanan ({orders.length})
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div>
                <h3 className="text-2xl font-semibold text-primary-dark mb-4">
                  Ringkasan Dashboard
                </h3>
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Selamat datang di dashboard admin. Di sini Anda dapat mengelola produk, kategori, dan pesanan.
                  </p>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">Pesanan Pending</h4>
                      <p className="text-3xl font-bold text-blue-700">{stats.pendingOrders}</p>
                      <p className="text-sm text-blue-600 mt-1">Perlu diproses</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-900 mb-2">Produk Aktif</h4>
                      <p className="text-3xl font-bold text-green-700">{products.filter(p => p.stock > 0).length}</p>
                      <p className="text-sm text-green-600 mt-1">Stok tersedia</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-purple-900 mb-2">Kategori</h4>
                      <p className="text-3xl font-bold text-purple-700">{categories.length}</p>
                      <p className="text-sm text-purple-600 mt-1">Total kategori</p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="text-xl font-semibold text-primary-dark mb-3">Pesanan Terbaru</h4>
                    <div className="space-y-2">
                      {orders.slice(0, 5).map((order) => (
                        <div key={order.id} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                          <div>
                            <p className="font-medium">{order.customer_name}</p>
                            <p className="text-sm text-gray-600">{order.product_name} x {order.quantity}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            order.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                            order.status === 'completed' ? 'bg-green-100 text-green-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Products Tab */}
            {activeTab === 'products' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-semibold text-primary-dark">
                    Manajemen Produk
                  </h3>
                  <button 
                    onClick={() => setShowAddProduct(true)}
                    className="bg-accent-green text-white px-4 py-2 rounded-lg hover:bg-green-600 transition flex items-center gap-2"
                  >
                    <Plus size={20} />
                    Tambah Produk
                  </button>
                </div>

                {/* Add/Edit Product Modal */}
                {(showAddProduct || showEditProduct) && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                      <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                          <h4 className="text-2xl font-bold text-primary-dark">
                            {showAddProduct ? 'Tambah Produk Baru' : 'Edit Produk'}
                          </h4>
                          <button onClick={resetProductForm} className="text-gray-500 hover:text-gray-700">
                            <X size={24} />
                          </button>
                        </div>

                        <form onSubmit={showAddProduct ? handleAddProduct : handleUpdateProduct} className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Nama Produk *
                            </label>
                            <input
                              type="text"
                              name="name"
                              value={productForm.name}
                              onChange={handleProductFormChange}
                              placeholder="Contoh: Kaos Polos Premium"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-green"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Slug (URL) *
                            </label>
                            <input
                              type="text"
                              name="slug"
                              value={productForm.slug}
                              onChange={handleProductFormChange}
                              placeholder="kaos-polos-premium"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-green bg-gray-50"
                              required
                            />
                            <p className="text-xs text-gray-500 mt-1">Otomatis dibuat dari nama produk</p>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Deskripsi
                            </label>
                            <textarea
                              name="description"
                              value={productForm.description}
                              onChange={handleProductFormChange}
                              placeholder="Deskripsi lengkap produk..."
                              rows="3"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-green"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Harga (Rp) *
                              </label>
                              <input
                                type="number"
                                name="price"
                                value={productForm.price}
                                onChange={handleProductFormChange}
                                placeholder="45000"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-green"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Stok *
                              </label>
                              <input
                                type="number"
                                name="stock"
                                value={productForm.stock}
                                onChange={handleProductFormChange}
                                placeholder="100"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-green"
                                required
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Kategori *
                            </label>
                            <select
                              name="category_id"
                              value={productForm.category_id}
                              onChange={handleProductFormChange}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-green"
                              required
                            >
                              <option value="">Pilih Kategori</option>
                              {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                              ))}
                            </select>
                            {categories.length === 0 && (
                              <p className="text-xs text-red-500 mt-1">Belum ada kategori. Tambahkan di tab Kategori terlebih dahulu.</p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Gambar Produk * {showEditProduct && '(Upload baru untuk mengganti)'}
                            </label>
                            <div className="flex items-center gap-4">
                              <label className="flex-1 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-accent-green transition">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleImageChange}
                                  className="hidden"
                                  required={showAddProduct}
                                />
                                <Image size={32} className="mx-auto text-gray-400 mb-2" />
                                <p className="text-sm text-gray-600">
                                  {imageFile ? imageFile.name : 'Klik untuk upload gambar'}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">JPG, PNG (Max 5MB)</p>
                              </label>
                              {imagePreview && (
                                <img 
                                  src={imagePreview} 
                                  alt="Preview" 
                                  className="w-24 h-24 object-cover rounded-lg border"
                                />
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              name="is_customizable"
                              id="is_customizable"
                              checked={productForm.is_customizable}
                              onChange={handleProductFormChange}
                              className="w-4 h-4 text-accent-green border-gray-300 rounded focus:ring-accent-green"
                            />
                            <label htmlFor="is_customizable" className="text-sm text-gray-700">
                              Produk bisa di-custom design
                            </label>
                          </div>

                          <div className="flex gap-3 pt-4">
                            <button
                              type="submit"
                              className="flex-1 bg-accent-green text-white py-3 rounded-lg hover:bg-green-600 transition font-semibold"
                            >
                              {showAddProduct ? 'Tambah Produk' : 'Update Produk'}
                            </button>
                            <button
                              type="button"
                              onClick={resetProductForm}
                              className="px-6 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition font-semibold"
                            >
                              Batal
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                )}

                {/* Products Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Produk</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Kategori</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Harga</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Stok</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">3D Model</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {products.map((product) => (
                        <tr key={product.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              {product.image_url ? (
                                <img 
                                  src={`http://localhost:5000${product.image_url}`}
                                  alt={product.name}
                                  className="w-12 h-12 object-cover rounded"
                                />
                              ) : (
                                <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                                  <Image size={20} className="text-gray-400" />
                                </div>
                              )}
                              <span className="font-medium">{product.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-600">{product.category_name}</td>
                          <td className="px-4 py-3 text-gray-600">{formatPrice(product.price)}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-sm ${
                              product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {product.stock}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {product.model_3d_url ? (
                              <span className="text-green-600 text-sm">✓ {product.model_3d_url.split('/').pop()}</span>
                            ) : (
                              <span className="text-gray-400 text-sm">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button 
                                onClick={() => {
                                  setEditingProduct(product);
                                  setProductForm({
                                    name: product.name,
                                    slug: product.slug,
                                    description: product.description || '',
                                    price: product.price,
                                    stock: product.stock,
                                    category_id: product.category_id,
                                    is_customizable: product.is_customizable
                                  });
                                  setImagePreview(product.image_url ? `http://localhost:5000${product.image_url}` : null);
                                  setShowEditProduct(true);
                                }}
                                className="text-blue-600 hover:text-blue-800"
                                title="Edit"
                              >
                                <Edit size={18} />
                              </button>
                              <button 
                                onClick={() => handleDeleteProduct(product.id)}
                                className="text-red-600 hover:text-red-800"
                                title="Hapus"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {products.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      Belum ada produk. Klik "Tambah Produk" untuk menambahkan.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Categories Tab */}
            {activeTab === 'categories' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-semibold text-primary-dark">
                    Manajemen Kategori
                  </h3>
                  <button 
                    onClick={() => setShowAddCategory(true)}
                    className="bg-accent-green text-white px-4 py-2 rounded-lg hover:bg-green-600 transition flex items-center gap-2"
                  >
                    <Plus size={20} />
                    Tambah Kategori
                  </button>
                </div>

                {/* Add/Edit Category Modal */}
                {(showAddCategory || showEditCategory) && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                      <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                          <h4 className="text-2xl font-bold text-primary-dark">
                            {showAddCategory ? 'Tambah Kategori Baru' : 'Edit Kategori'}
                          </h4>
                          <button onClick={resetCategoryForm} className="text-gray-500 hover:text-gray-700">
                            <X size={24} />
                          </button>
                        </div>

                        <form onSubmit={showAddCategory ? handleAddCategory : handleUpdateCategory} className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Nama Kategori *
                            </label>
                            <input
                              type="text"
                              name="name"
                              value={categoryForm.name}
                              onChange={handleCategoryFormChange}
                              placeholder="Contoh: Kaos"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-green"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Slug (URL) *
                            </label>
                            <input
                              type="text"
                              name="slug"
                              value={categoryForm.slug}
                              onChange={handleCategoryFormChange}
                              placeholder="kaos"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-green bg-gray-50"
                              required
                            />
                            <p className="text-xs text-gray-500 mt-1">Otomatis dibuat dari nama kategori</p>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Deskripsi
                            </label>
                            <textarea
                              name="description"
                              value={categoryForm.description}
                              onChange={handleCategoryFormChange}
                              placeholder="Deskripsi kategori..."
                              rows="3"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-green"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Model 3D (GLB/GLTF) * {showEditCategory && '(Upload baru untuk mengganti)'}
                            </label>
                            <label className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-accent-green transition block">
                              <input
                                type="file"
                                accept=".glb,.gltf"
                                onChange={handleModelChange}
                                className="hidden"
                                required={showAddCategory}
                              />
                              <Image size={32} className="mx-auto text-gray-400 mb-2" />
                              <p className="text-sm text-gray-600">
                                {modelFileName || 'Klik untuk upload model 3D'}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">GLB/GLTF (Max 10MB)</p>
                            </label>
                          </div>

                          <div className="flex gap-3 pt-4">
                            <button
                              type="submit"
                              className="flex-1 bg-accent-green text-white py-3 rounded-lg hover:bg-green-600 transition font-semibold"
                            >
                              {showAddCategory ? 'Tambah Kategori' : 'Update Kategori'}
                            </button>
                            <button
                              type="button"
                              onClick={resetCategoryForm}
                              className="px-6 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition font-semibold"
                            >
                              Batal
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                )}

                {/* Categories List */}
                <div className="grid md:grid-cols-3 gap-4">
                  {categories.map((category) => (
                    <div key={category.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-primary-dark">{category.name}</h4>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleEditCategory(category)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Edit kategori"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeleteCategory(category.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Hapus kategori"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500">Slug: {category.slug}</p>
                      <p className="text-sm text-gray-500">3D Model: {category.model_3d_url ? category.model_3d_url.split('/').pop() : '-'}</p>
                      {category.description && (
                        <p className="text-sm text-gray-600 mt-2">{category.description}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        {products.filter(p => p.category_id === category.id).length} produk
                      </p>
                    </div>
                  ))}
                </div>

                {categories.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    Belum ada kategori. Klik "Tambah Kategori" untuk menambahkan.
                  </div>
                )}
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div>
                <h3 className="text-2xl font-semibold text-primary-dark mb-6">
                  Manajemen Pesanan
                </h3>
                <div className="space-y-4">
                  {orders.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">Belum ada pesanan</p>
                  ) : (
                    orders.map((order) => (
                      <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-semibold text-primary-dark">Order #{order.id}</p>
                            <p className="text-sm text-gray-500">{order.customer_name} - {order.customer_email}</p>
                            <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleString('id-ID')}</p>
                          </div>
                          <select
                            value={order.status}
                            onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                            className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-accent-green"
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                        <div className="grid md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Produk:</span>
                            <p className="font-medium">{order.product_name}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Jumlah:</span>
                            <p className="font-medium">{order.quantity} pcs</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Total:</span>
                            <p className="font-medium text-accent-green">{formatPrice(order.total_price)}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Catatan:</span>
                            <p className="font-medium">{order.notes || '-'}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;