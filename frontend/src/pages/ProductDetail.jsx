import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingCart, ArrowLeft, AlertCircle, Palette } from "lucide-react";
import { getProductById, createOrder } from "../utils/api";
import { useAuth } from "../context/AuthContext";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [ordering, setOrdering] = useState(false);
  const [error, setError] = useState("");

  // === Load Product Detail ===
  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await getProductById(id);

        if (data?.product) {
          setProduct(data.product);
        } else {
          setError("Produk tidak ditemukan");
        }
      } catch (err) {
        console.error("Error loading product:", err);
        setError("Gagal memuat data produk");
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  // === Handle Order ===
  const handleOrder = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/products/${id}` } });
      return;
    }

    if (quantity < 1) {
      setError("Jumlah pesanan minimal 1");
      return;
    }

    if (quantity > product.stock) {
      setError("Jumlah pesanan melebihi stok yang tersedia");
      return;
    }

    if (quantity > 24) {
      navigate("/mou", {
        state: { product, quantity },
      });
      return;
    }

    setOrdering(true);
    setError("");

    try {
      await createOrder({
        product_id: String(product.id), // ✅ aman untuk API
        quantity,
        notes,
      });

      alert("Pesanan berhasil dibuat!");
      navigate("/orders");
    } catch (err) {
      console.error("Order error:", err);
      setError(err.response?.data?.message || "Gagal membuat pesanan");
    } finally {
      setOrdering(false);
    }
  };

  // === Format Harga ===
  const formatPrice = (price) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);

  // === Loading State ===
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-accent-green border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // === Error State ===
  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-xl text-red-600 mb-4">{error || "Produk tidak ditemukan"}</p>
        <Link to="/products" className="text-accent-green hover:underline">
          ← Kembali ke Daftar Produk
        </Link>
      </div>
    );
  }

  // === Cek URL Gambar ===
  const imageSrc = product.image_url?.startsWith("http")
    ? product.image_url
    : `http://localhost:5000${product.image_url || "/uploads/default.jpg"}`;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Tombol Kembali */}
        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-primary-dark hover:text-accent-green mb-6 transition"
        >
          <ArrowLeft size={20} />
          Kembali ke Produk
        </Link>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Gambar Produk */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-lg shadow-lg overflow-hidden"
          >
            <img
              src={imageSrc}
              alt={product.name}
              className="w-full h-96 object-cover"
              onError={(e) => (e.target.src = "https://via.placeholder.com/600x600?text=No+Image")}
            />
            {Boolean(product.is_customizable) && (
              <div className="bg-accent-green text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Palette size={20} />
                  <span className="font-semibold">Bisa Custom Design</span>
                </div>
                <Link 
                  to="/design"
                  className="bg-white text-accent-green px-4 py-2 rounded-lg hover:bg-gray-100 transition text-sm"
                >
                  Desain Sekarang
                </Link>
              </div>  
            )}
          </motion.div>

          {/* Detail Produk & Form Pemesanan */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-lg shadow-lg p-6"
          >
            {/* Kategori */}
            <div className="mb-4">
              <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded">
                {product.category_name || "Tanpa Kategori"}
              </span>
            </div>

            {/* Nama Produk */}
            <h1 className="text-3xl font-bold text-primary-dark mb-3">{product.name}</h1>

            {/* Harga */}
            <div className="flex items-baseline gap-4 mb-6">
              <span className="text-4xl font-bold text-accent-green">{formatPrice(product.price)}</span>
              <span className="text-gray-500">/ pcs</span>
            </div>

            {/* Stok */}
            <div className="mb-6">
              <span
                className={`text-sm font-semibold px-3 py-1 rounded ${
                  product.stock > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}
              >
                {product.stock > 0 ? `Stok: ${product.stock}` : "Stok Habis"}
              </span>
            </div>

            {/* Deskripsi */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-primary-dark mb-2">Deskripsi Produk</h3>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                {product.description || "Tidak ada deskripsi."}
              </p>
            </div>

            {/* Form Pemesanan */}
            {product.stock > 0 && (
              <form onSubmit={handleOrder} className="space-y-4">
                {/* Jumlah */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Jumlah Pesanan</label>
                  <input
                    type="number"
                    min="1"
                    max={product.stock}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-green"
                    required
                  />
                  {quantity > 24 && (
                    <div className="mt-2 flex items-start gap-2 text-orange-600 text-sm">
                      <AlertCircle size={16} className="mt-0.5" />
                      <span>Pesanan lebih dari 24 pcs akan diarahkan ke halaman MoU</span>
                    </div>
                  )}
                </div>

                {/* Catatan */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Catatan Tambahan (Opsional)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows="3"
                    placeholder="Contoh: Ukuran L, warna biru, logo di dada kiri"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-green"
                  ></textarea>
                </div>

                {/* Total Harga */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Harga:</span>
                    <span className="text-2xl font-bold text-primary-dark">
                      {formatPrice(product.price * quantity)}
                    </span>
                  </div>
                </div>

                {/* Pesan Error */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>
                )}

                {/* Tombol Submit */}
                <button
                  type="submit"
                  disabled={ordering}
                  className="w-full bg-accent-green text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {ordering ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Memproses...
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={20} />
                      {quantity > 24 ? "Lanjut ke MoU" : "Pesan Sekarang"}
                    </>
                  )}
                </button>

                {!isAuthenticated && (
                  <p className="text-center text-sm text-gray-600">Anda akan diarahkan ke halaman login</p>
                )}
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
