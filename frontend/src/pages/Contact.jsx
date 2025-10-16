import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, MessageCircle } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    
    // Simulate sending
    setTimeout(() => {
      setSending(false);
      setSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      
      setTimeout(() => setSuccess(false), 5000);
    }, 1500);
  };

  const whatsappNumber = '6281234567890';
  const whatsappMessage = encodeURIComponent('Halo, saya ingin bertanya tentang layanan konveksi...');

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-primary-dark mb-4">
            Hubungi Kami
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Punya pertanyaan atau ingin konsultasi? Jangan ragu untuk menghubungi kami
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Info Cards */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-2xl font-semibold text-primary-dark mb-6">
                Informasi Kontak
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="bg-accent-green p-3 rounded-lg">
                    <MapPin className="text-white" size={24} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-primary-dark mb-1">Alamat</h4>
                    <p className="text-gray-600">
                      Jl. Konveksi No. 123<br />
                      Jakarta Selatan, DKI Jakarta 12345<br />
                      Indonesia
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-accent-green p-3 rounded-lg">
                    <Phone className="text-white" size={24} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-primary-dark mb-1">Telepon</h4>
                    <p className="text-gray-600">
                      +62 812-3456-7890<br />
                      +62 21-1234-5678
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-accent-green p-3 rounded-lg">
                    <Mail className="text-white" size={24} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-primary-dark mb-1">Email</h4>
                    <p className="text-gray-600">
                      info@konveksibaju.com<br />
                      sales@konveksibaju.com
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* WhatsApp Quick Contact */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center gap-3 mb-4">
                <MessageCircle size={32} />
                <h3 className="text-xl font-semibold">Chat via WhatsApp</h3>
              </div>
              <p className="mb-4">
                Butuh respon cepat? Hubungi kami langsung via WhatsApp untuk konsultasi gratis!
              </p>
              <a
                href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
              >
                Chat Sekarang
              </a>
            </div>

            {/* Business Hours */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-primary-dark mb-4">
                Jam Operasional
              </h3>
              <div className="space-y-2 text-gray-600">
                <div className="flex justify-between">
                  <span>Senin - Jumat</span>
                  <span className="font-semibold">08:00 - 17:00</span>
                </div>
                <div className="flex justify-between">
                  <span>Sabtu</span>
                  <span className="font-semibold">08:00 - 14:00</span>
                </div>
                <div className="flex justify-between">
                  <span>Minggu</span>
                  <span className="font-semibold text-red-600">Tutup</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-lg shadow-lg p-8"
          >
            <h3 className="text-2xl font-semibold text-primary-dark mb-6">
              Kirim Pesan
            </h3>

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
                Pesan berhasil dikirim! Kami akan segera menghubungi Anda.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Nama Anda"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-green"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="nama@email.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-green"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subjek *
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Topik pesan Anda"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-green"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pesan *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tulis pesan Anda di sini..."
                  rows="5"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-green"
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={sending}
                className="w-full bg-accent-green text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {sending ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Mengirim...
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    Kirim Pesan
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Contact;