import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, Users, Clock, Star, Palette } from 'lucide-react';
import { getProducts } from '../utils/api';
import ProductCard from '../components/ProductCard';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeaturedProducts();
  }, []);

  const loadFeaturedProducts = async () => {
    try {
      const data = await getProducts({ limit: 4 });
      setFeaturedProducts(data.products);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-dark to-primary-light text-white py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl font-bold mb-6">
                Quality?
                <br/>
                <span className="text-accent-green"> It's Priority</span>
              </h1>
              <p className="text-xl mb-8 text-gray-200">
                jahitt. in hadir sebagai mitra kamu untuk memenuhi kebutuhan dalam bidang pakaian.
              </p>
              <div className="flex gap-4">
                <Link 
                  to="/products"
                  className="bg-accent-green px-8 py-3 rounded-lg font-semibold hover:bg-green-600 transition flex items-center gap-2"
                >
                  Lihat Produk
                  <ArrowRight size={20} />
                </Link>
                <Link 
                  to="/design"
                  className="bg-white text-primary-dark px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition flex items-center gap-2"
                >
                  <Palette size={20} />
                  Desain Sekarang
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="hidden md:block"
            >
              <img 
                src="/Banner1.jpg" 
                alt="Konveksi"
                className="rounded-lg shadow-2xl"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Tentang Kami */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-primary-dark mb-4">
              Tentang Kami
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Kami adalah perusahaan konveksi terpercaya dengan pengalaman lebih dari 10 tahun dalam industri garment. 
              Komitmen kami adalah memberikan produk berkualitas tinggi dengan harga yang kompetitif.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: CheckCircle,
                title: 'Kualitas Terjamin',
                description: 'Material berkualitas dan jahitan rapi'
              },
              {
                icon: Clock,
                title: 'Pengerjaan Cepat',
                description: 'Proses produksi efisien dan tepat waktu'
              },
              {
                icon: Users,
                title: 'Tim Profesional',
                description: 'Didukung oleh tenaga ahli berpengalaman'
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="text-center p-6 bg-gray-50 rounded-lg hover:shadow-lg transition"
              >
                <div className="bg-accent-green w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <item.icon size={32} className="text-white" />
                </div>
                <h3 className="text-xl font-semibold text-primary-dark mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Produk Unggulan */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-primary-dark mb-4">
              Produk Unggulan
            </h2>
            <p className="text-gray-600">
              Beberapa produk terbaik kami yang paling diminati
            </p>
          </motion.div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-12 h-12 border-4 border-accent-green border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <div className="text-center mt-8">
            <Link 
              to="/products"
              className="inline-block bg-primary-dark text-white px-8 py-3 rounded-lg hover:bg-primary-light transition"
            >
              Lihat Semua Produk
            </Link>
          </div>
        </div>
      </section>

      {/* Testimoni */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-primary-dark mb-4">
              Testimoni Pelanggan
            </h2>
            <p className="text-gray-600">
              Apa kata mereka tentang layanan kami
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Budi Santoso',
                company: 'PT. Maju Jaya',
                text: 'Kualitas produk sangat memuaskan, pengerjaan cepat dan rapi. Sangat rekomended!',
                rating: 5
              },
              {
                name: 'Siti Nurhaliza',
                company: 'Sekolah ABC',
                text: 'Sudah beberapa kali pesan seragam sekolah disini, hasilnya selalu bagus dan tepat waktu.',
                rating: 5
              },
              {
                name: 'Ahmad Fadli',
                company: 'Komunitas XYZ',
                text: 'Pelayanan ramah, harga bersaing. Cocok untuk pesanan komunitas atau organisasi.',
                rating: 5
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="bg-gray-50 p-6 rounded-lg shadow-md"
              >
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={20} className="text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.text}"</p>
                <div>
                  <p className="font-semibold text-primary-dark">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.company}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary-dark to-accent-green text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Siap Memesan Konveksi Anda?
          </h2>
          <p className="text-xl mb-8">
            Hubungi kami sekarang untuk konsultasi gratis dan penawaran terbaik
          </p>
          <div className="flex gap-4 justify-center">
            <Link 
              to="/contact"
              className="bg-white text-primary-dark px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Hubungi Kami
            </Link>
            <Link 
              to="/mou"
              className="bg-transparent border-2 border-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-dark transition"
            >
              Pesanan Besar (MoU)
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;