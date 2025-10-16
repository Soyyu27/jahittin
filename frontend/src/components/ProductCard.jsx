import { Link } from 'react-router-dom';
import { ShoppingCart, Palette } from 'lucide-react';
import { motion } from 'framer-motion';

const ProductCard = ({ product }) => {
  if (!product) return null;

  // Format harga dalam Rupiah
  const formatPrice = (price) => {
    if (!price) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Pastikan path image benar
  const imageSrc = product.image_url
    ? product.image_url.startsWith('http')
      ? product.image_url
      : `http://localhost:5000/${product.image_url.replace(/^\/+/, '')}`
    : '/images/no-image.png';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
    >
      {/* Product Image */}
      <div className="relative h-64 overflow-hidden">
        <img
          src={imageSrc}
          alt={product.name}
          className="w-full h-full object-cover"
          onError={(e) => (e.target.src = '/images/no-image.png')}
        />

        {/* Label Custom */}
        {product.is_customizable && (
          <div className="absolute top-2 right-2 bg-accent-green text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
            <Palette size={14} />
            Custom
          </div>
        )}

        {/* Label Stok Habis */}
        {Number(product.stock) === 1 && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold">
              Stok Habis
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        {product.category_name && (
          <div className="mb-2">
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {product.category_name}
            </span>
          </div>
        )}

        <h3 className="text-lg font-semibold text-gray-800 mb-2 truncate">
          {product.name || 'Produk Tanpa Nama'}
        </h3>

        {product.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {product.description}
          </p>
        )}

        <div className="flex items-center justify-between mb-4">
          <span className="text-2xl font-bold text-primary-dark">
            {formatPrice(product.price)}
          </span>
          <span className="text-sm text-gray-500">
            Stok: {product.stock ?? 0}
          </span>
        </div>

        {/* Tombol Aksi */}
        <div className="flex gap-2">
          <Link
            to={`/products/${product.slug || product.id}`}
            className="flex-1 bg-primary-dark text-white py-2 px-4 rounded-lg hover:bg-primary-light transition text-center flex items-center justify-center gap-2"
          >
            <ShoppingCart size={18} />
            Pesan Sekarang
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
