import { useState, useEffect } from "react";
import { Search, Filter } from "lucide-react";
import { motion } from "framer-motion";
import { getProducts, getCategories } from "../utils/api";
import ProductCard from "../components/ProductCard";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    loadCategories();
    loadProducts();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [selectedCategory, searchQuery]);

  const loadCategories = async () => {
    try {
      const data = await getCategories();
      if (data.categories) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const params = { limit: 12, page: 1 };

      if (selectedCategory) params.category = selectedCategory;
      if (searchQuery) params.search = searchQuery;

      const data = await getProducts(params);
      setProducts(data.products || []);
      setPagination(data.pagination || {});
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadProducts();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-primary-dark mb-2">
            Katalog Produk
          </h1>
          <p className="text-gray-600">
            Jelajahi berbagai produk konveksi berkualitas kami
          </p>
        </motion.div>

        {/* Search & Filter */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Cari produk..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-green"
              />
              <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
            </form>

            {/* Category Filter */}
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-green appearance-none"
              >
                <option value="">Semua Kategori</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <Filter className="absolute left-3 top-3.5 text-gray-400" size={20} />
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block w-16 h-16 border-4 border-accent-green border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Memuat produk...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-gray-600">Tidak ada produk ditemukan</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination Info */}
            {pagination.total > 0 && (
              <div className="text-center text-gray-600">
                Menampilkan {products.length} dari {pagination.total} produk
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Products;
