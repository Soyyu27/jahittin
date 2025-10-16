import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Clock, CheckCircle, XCircle, Eye, X } from 'lucide-react';
import { getUserOrders } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadOrders();
  }, [isAuthenticated]);

  const loadOrders = async () => {
    try {
      const data = await getUserOrders();
      console.log("📦 Orders Data:", data);
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Error loading orders:', error);
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        icon: Clock,
        text: 'Menunggu',
        className: 'bg-yellow-100 text-yellow-700'
      },
      processing: {
        icon: Package,
        text: 'Diproses',
        className: 'bg-blue-100 text-blue-700'
      },
      completed: {
        icon: CheckCircle,
        text: 'Selesai',
        className: 'bg-green-100 text-green-700'
      },
      cancelled: {
        icon: XCircle,
        text: 'Dibatalkan',
        className: 'bg-red-100 text-red-700'
      }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${config.className}`}>
        <Icon size={16} />
        {config.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-accent-green border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-primary-dark mb-2">
            Pesanan Saya
          </h1>
          <p className="text-gray-600">
            Lihat dan lacak semua pesanan Anda
          </p>
        </motion.div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-lg p-12 text-center"
          >
            <Package size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Belum Ada Pesanan
            </h3>
            <p className="text-gray-500 mb-6">
              Anda belum melakukan pemesanan apapun
            </p>
            <button
              onClick={() => navigate('/products')}
              className="bg-accent-green text-white px-6 py-3 rounded-lg hover:bg-green-600 transition"
            >
              Mulai Belanja
            </button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, index) => {
              const productImage = order.product_image
                ? order.product_image.startsWith('http')
                  ? order.product_image
                  : `http://localhost:5000${order.product_image}`
                : 'https://via.placeholder.com/150';

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition"
                >
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Order ID: #{order.id}</p>
                        <p className="text-sm text-gray-500">{formatDate(order.created_at)}</p>
                      </div>
                      {getStatusBadge(order.status)}
                    </div>

                    <div className="grid md:grid-cols-4 gap-4 items-center">
                      <div className="md:col-span-1">
                        <img
                          src={productImage}
                          alt={order.product_name}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <h3 className="text-lg font-semibold text-primary-dark mb-2">
                          {order.product_name}
                        </h3>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p>Jumlah: {order.quantity} pcs</p>
                          <p className="text-lg font-bold text-accent-green">
                            {formatPrice(order.total_price)}
                          </p>
                        </div>
                      </div>

                      <div className="md:col-span-1 flex flex-col gap-2">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="bg-primary-dark text-white px-4 py-2 rounded-lg hover:bg-primary-light transition flex items-center justify-center gap-2"
                        >
                          <Eye size={18} />
                          Detail
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* ✅ MODAL DETAIL */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 relative"
            >
              <button
                onClick={() => setSelectedOrder(null)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>

              <h2 className="text-2xl font-bold mb-4 text-primary-dark">Detail Pesanan</h2>

              <div className="space-y-3 text-gray-700">
                <p><strong>Order ID:</strong> #{selectedOrder.id}</p>
                <p><strong>Email:</strong> {user?.email || 'Tidak tersedia'}</p>
                <p><strong>Produk:</strong> {selectedOrder.product_name}</p>
                <p><strong>Jumlah:</strong> {selectedOrder.quantity} pcs</p>
                <p><strong>Total:</strong> {formatPrice(selectedOrder.total_price)}</p>
                <p><strong>Status:</strong> {getStatusBadge(selectedOrder.status)}</p>
                {selectedOrder.notes && (
                  <p><strong>Catatan:</strong> {selectedOrder.notes}</p>
                )}
                <p><strong>Tanggal Pesanan:</strong> {formatDate(selectedOrder.created_at)}</p>
              </div>

              <div className="mt-4">
                <img
                  src={
                    selectedOrder.product_image
                      ? selectedOrder.product_image.startsWith('http')
                        ? selectedOrder.product_image
                        : `http://localhost:5000${selectedOrder.product_image}`
                      : 'https://via.placeholder.com/300'
                  }
                  alt={selectedOrder.product_name}
                  className="w-full h-64 object-cover rounded-lg mt-4"
                />
              </div>

              <div className="mt-6 text-right">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Orders;
