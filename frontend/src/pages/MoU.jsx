import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Download, MessageCircle, Mail, Phone, CheckCircle } from 'lucide-react';

const MoU = () => {
  const location = useLocation();
  const { product, quantity } = location.state || {};

  const whatsappNumber = '6281234567890';
  const whatsappMessage = encodeURIComponent(
    `Halo, saya ingin melakukan pesanan besar:\n\nProduk: ${product?.name || 'N/A'}\nJumlah: ${quantity || 'N/A'} pcs\n\nMohon informasi lebih lanjut untuk kerja sama MoU.`
  );

  const handleDownloadMoU = () => {
    // Simulate download - dalam production, ini akan download file PDF/DOCX yang sebenarnya
    alert('Template MoU akan segera diunduh. Silakan isi dan kirimkan kembali kepada kami.');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-primary-dark mb-4">
            Pesanan Besar (MoU)
          </h1>
          <p className="text-gray-600">
            Untuk pesanan lebih dari 24 pcs, kami memerlukan Memorandum of Understanding (MoU)
          </p>
        </motion.div>

        {/* Order Info */}
        {product && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-lg p-6 mb-8"
          >
            <h3 className="text-xl font-semibold text-primary-dark mb-4">
              Detail Pesanan Anda
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">Produk:</p>
                <p className="font-semibold text-primary-dark">{product.name}</p>
              </div>
              <div>
                <p className="text-gray-600">Jumlah:</p>
                <p className="font-semibold text-primary-dark">{quantity} pcs</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* MoU Explanation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-lg p-8 mb-8"
        >
          <h2 className="text-2xl font-semibold text-primary-dark mb-6">
            Tentang MoU
          </h2>
          
          <p className="text-gray-600 mb-6">
            Memorandum of Understanding (MoU) adalah dokumen kesepakatan kerja sama antara kedua belah pihak 
            untuk pesanan dalam jumlah besar. Dokumen ini melindungi kepentingan Anda dan kami sebagai penyedia layanan.
          </p>

          <h3 className="text-xl font-semibold text-primary-dark mb-4">
            Yang Termasuk dalam MoU:
          </h3>
          
          <div className="space-y-3 mb-6">
            {[
              'Detail lengkap spesifikasi produk',
              'Jumlah pesanan dan estimasi harga',
              'Jadwal produksi dan pengiriman',
              'Sistem pembayaran dan termin',
              'Ketentuan revisi dan komplain',
              'Garansi kualitas produk',
              'Hak dan kewajiban kedua belah pihak'
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle className="text-accent-green flex-shrink-0 mt-1" size={20} />
                <span className="text-gray-700">{item}</span>
              </div>
            ))}
          </div>

          <h3 className="text-xl font-semibold text-primary-dark mb-4">
            Proses Kerja Sama:
          </h3>
          
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <div className="bg-accent-green w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-white font-bold text-xl">
                1
              </div>
              <h4 className="font-semibold text-primary-dark mb-2">Download Template</h4>
              <p className="text-sm text-gray-600">Unduh template MoU di bawah ini</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <div className="bg-accent-green w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-white font-bold text-xl">
                2
              </div>
              <h4 className="font-semibold text-primary-dark mb-2">Isi & Tanda Tangan</h4>
              <p className="text-sm text-gray-600">Lengkapi dokumen dengan data Anda</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <div className="bg-accent-green w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-white font-bold text-xl">
                3
              </div>
              <h4 className="font-semibold text-primary-dark mb-2">Kirim ke Kami</h4>
              <p className="text-sm text-gray-600">Kirim via email atau WhatsApp</p>
            </div>
          </div>

          {/* Download Button */}
          <div className="text-center">
            <button
              onClick={handleDownloadMoU}
              className="inline-flex items-center gap-2 bg-primary-dark text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary-light transition"
            >
              <Download size={24} />
              Download Template MoU (.PDF)
            </button>
            <p className="text-sm text-gray-500 mt-2">
              Format: PDF | Ukuran: ~200KB
            </p>
          </div>
        </motion.div>

        {/* Contact Methods */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-lg p-8"
        >
          <h2 className="text-2xl font-semibold text-primary-dark mb-6 text-center">
            Hubungi Kami untuk Konsultasi
          </h2>

          <div className="grid md:grid-cols-3 gap-4">
            {/* WhatsApp */}
            <a
              href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 hover:bg-green-600 text-white p-6 rounded-lg text-center transition group"
            >
              <MessageCircle size={40} className="mx-auto mb-3 group-hover:scale-110 transition" />
              <h3 className="font-semibold text-lg mb-2">WhatsApp</h3>
              <p className="text-sm opacity-90">Chat langsung dengan tim kami</p>
            </a>

            {/* Email */}
            <a
              href="mailto:sales@konveksibaju.com?subject=Pesanan Besar MoU"
              className="bg-blue-500 hover:bg-blue-600 text-white p-6 rounded-lg text-center transition group"
            >
              <Mail size={40} className="mx-auto mb-3 group-hover:scale-110 transition" />
              <h3 className="font-semibold text-lg mb-2">Email</h3>
              <p className="text-sm opacity-90">sales@konveksibaju.com</p>
            </a>

            {/* Phone */}
            <a
              href="tel:+6281234567890"
              className="bg-orange-500 hover:bg-orange-600 text-white p-6 rounded-lg text-center transition group"
            >
              <Phone size={40} className="mx-auto mb-3 group-hover:scale-110 transition" />
              <h3 className="font-semibold text-lg mb-2">Telepon</h3>
              <p className="text-sm opacity-90">+62 812-3456-7890</p>
            </a>
          </div>
        </motion.div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8"
        >
          <div className="flex items-start gap-3">
            <FileText className="text-blue-600 flex-shrink-0 mt-1" size={24} />
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">Catatan Penting:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• MoU diperlukan untuk menjamin komitmen kedua belah pihak</li>
                <li>• Harga dan jadwal akan disesuaikan berdasarkan jumlah dan kompleksitas pesanan</li>
                <li>• Proses review MoU membutuhkan waktu 1-2 hari kerja</li>
                <li>• Produksi dimulai setelah MoU ditandatangani dan DP dibayarkan</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MoU;