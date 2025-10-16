import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-primary-dark text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-accent-green">JAHIT.IN</h3>
            <p className="text-gray-300 mb-4">
              Layanan konveksi profesional untuk berbagai kebutuhan pakaian Anda dengan kualitas terbaik.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Menu Cepat</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-accent-green transition">
                  Beranda
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-gray-300 hover:text-accent-green transition">
                  Produk
                </Link>
              </li>
              <li>
                <Link to="/design" className="text-gray-300 hover:text-accent-green transition">
                  Desain Baju
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-accent-green transition">
                  Kontak
                </Link>
              </li>
              <li>
                <Link to="/mou" className="text-gray-300 hover:text-accent-green transition">
                  MoU Pesanan Besar
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Kontak Kami</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-gray-300">
                <MapPin size={18} className="mt-1 flex-shrink-0" />
                <span>Jl. Konveksi No. 123, Jakarta Selatan, Indonesia</span>
              </li>
              <li className="flex items-center gap-2 text-gray-300">
                <Phone size={18} />
                <span>+62 812-3456-7890</span>
              </li>
              <li className="flex items-center gap-2 text-gray-300">
                <Mail size={18} />
                <span>info@konveksibaju.com</span>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Ikuti Kami</h4>
            <div className="flex gap-4">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-accent-green p-2 rounded-full hover:bg-green-600 transition"
              >
                <Facebook size={20} />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-accent-green p-2 rounded-full hover:bg-green-600 transition"
              >
                <Instagram size={20} />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-accent-green p-2 rounded-full hover:bg-green-600 transition"
              >
                <Twitter size={20} />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Konveksi Baju. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;