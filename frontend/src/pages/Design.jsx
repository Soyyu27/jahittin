import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Type, Upload, Save, Download, Palette, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { saveDesign, getProducts } from '../utils/api';

const Design = () => {
  const canvasRef = useRef(null);
  const [scene, setScene] = useState(null);
  const [camera, setCamera] = useState(null);
  const [renderer, setRenderer] = useState(null);
  const [controls, setControls] = useState(null);
  const [model, setModel] = useState(null);
  
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedColor, setSelectedColor] = useState('#FFFFFF');
  const [textures, setTextures] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const colors = [
    { name: 'Putih', hex: '#FFFFFF' },
    { name: 'Hitam', hex: '#000000' },
    { name: 'Merah', hex: '#EF4444' },
    { name: 'Biru', hex: '#3B82F6' },
    { name: 'Hijau', hex: '#10B981' },
    { name: 'Kuning', hex: '#F59E0B' },
    { name: 'Abu-abu', hex: '#6B7280' },
    { name: 'Navy', hex: '#1E3A8A' },
  ];

  // Load products from database
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await getProducts({ limit: 50 });
      const customizableProducts = data.products.filter(p => p.is_customizable && p.model_3d_url);
      setProducts(customizableProducts);
      if (customizableProducts.length > 0) {
        setSelectedProduct(customizableProducts[0]);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initialize Three.js scene
  useEffect(() => {
    if (!canvasRef.current) return;

    const newScene = new THREE.Scene();
    newScene.background = new THREE.Color(0xf0f0f0);

    const newCamera = new THREE.PerspectiveCamera(
      45,
      canvasRef.current.clientWidth / canvasRef.current.clientHeight,
      0.1,
      1000
    );
    newCamera.position.set(0, 0, 3);

    const newRenderer = new THREE.WebGLRenderer({ 
      canvas: canvasRef.current,
      antialias: true 
    });
    newRenderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);
    newRenderer.setPixelRatio(window.devicePixelRatio);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    newScene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    newScene.add(directionalLight);

    const newControls = new OrbitControls(newCamera, newRenderer.domElement);
    newControls.enableDamping = true;
    newControls.dampingFactor = 0.05;
    newControls.minDistance = 1;
    newControls.maxDistance = 10;

    setScene(newScene);
    setCamera(newCamera);
    setRenderer(newRenderer);
    setControls(newControls);

    const animate = () => {
      requestAnimationFrame(animate);
      newControls.update();
      newRenderer.render(newScene, newCamera);
    };
    animate();

    const handleResize = () => {
      if (canvasRef.current) {
        newCamera.aspect = canvasRef.current.clientWidth / canvasRef.current.clientHeight;
        newCamera.updateProjectionMatrix();
        newRenderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      newRenderer.dispose();
    };
  }, []);

  // Load 3D model when product changes
  useEffect(() => {
    if (!scene || !selectedProduct?.model_3d_url) return;

    // Remove old model
    if (model) {
      scene.remove(model);
    }

const modelPath = selectedProduct.model_3d_url.startsWith('http')
  ? selectedProduct.model_3d_url
  : `http://localhost:5000${selectedProduct.model_3d_url}`;

loader.load(modelPath, (gltf) => {
        const newModel = gltf.scene;
        
        // Center and scale model
        const box = new THREE.Box3().setFromObject(newModel);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 2 / maxDim;
        
        newModel.scale.setScalar(scale);
        newModel.position.sub(center.multiplyScalar(scale));
        
        scene.add(newModel);
        setModel(newModel);
        
        // Apply initial color
        applyColorToModel(newModel, selectedColor);
      },
      undefined,
      (error) => {
        console.error('Error loading model:', error);
        alert('Gagal memuat model 3D. Pastikan file GLB tersedia.');
      }
    );
  }, [scene, selectedProduct]);

  // Apply color to model
  useEffect(() => {
    if (model) {
      applyColorToModel(model, selectedColor);
    }
  }, [selectedColor, model]);

  const applyColorToModel = (model, color) => {
    model.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial({
          color: new THREE.Color(color),
          roughness: 0.5,
          metalness: 0.1,
        });
      }
    });
  };

  const addTextToModel = () => {
    const text = prompt('Masukkan teks:');
    if (!text || !scene) return;

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 512;
    canvas.height = 256;
    
    context.fillStyle = '#FFFFFF';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#000000';
    context.font = 'bold 48px Arial';
    context.textAlign = 'center';
    context.fillText(text, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
    const geometry = new THREE.PlaneGeometry(1, 0.5);
    const textMesh = new THREE.Mesh(geometry, material);
    
    textMesh.position.set(0, 0.5, 0.3);
    scene.add(textMesh);
    
    setTextures([...textures, textMesh]);
  };

  const addImageToModel = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file || !scene) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(event.target.result, (texture) => {
          const material = new THREE.MeshBasicMaterial({ 
            map: texture, 
            transparent: true 
          });
          const geometry = new THREE.PlaneGeometry(0.5, 0.5);
          const imageMesh = new THREE.Mesh(geometry, material);
          
          imageMesh.position.set(0, 0, 0.3);
          scene.add(imageMesh);
          
          setTextures([...textures, imageMesh]);
        });
      };
      reader.readAsDataURL(file);
    };
    
    input.click();
  };

  const resetView = () => {
    if (camera && controls) {
      camera.position.set(0, 0, 3);
      controls.reset();
    }
  };

  const handleSave = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!renderer || !scene || !camera) return;

    setSaving(true);
    try {
      renderer.render(scene, camera);
      const screenshot = renderer.domElement.toDataURL('image/png');
      
      const designData = {
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        color: selectedColor,
        textures: textures.map(t => ({
          position: t.position,
          scale: t.scale,
        })),
      };

      await saveDesign({
        product_type: selectedProduct.name,
        design_data: designData,
        preview_image: screenshot
      });

      alert('Desain berhasil disimpan!');
    } catch (error) {
      alert('Gagal menyimpan desain: ' + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = () => {
    if (!renderer) return;
    
    const link = document.createElement('a');
    link.href = renderer.domElement.toDataURL('image/png');
    link.download = `design-${selectedProduct?.name}-${Date.now()}.png`;
    link.click();
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
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-primary-dark mb-2 flex items-center justify-center gap-3">
            <Palette size={36} className="text-accent-green" />
            Custom 3D Design Studio
          </h1>
          <p className="text-gray-600">
            Desain baju Anda dengan teknologi 3D interaktif
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Left Panel - Product Selection */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-lg shadow-lg p-6 lg:col-span-1"
          >
            <h3 className="text-xl font-semibold text-primary-dark mb-4">
              Pilih Produk
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {products.map((product) => (
                <button
                  key={product.id}
                  onClick={() => setSelectedProduct(product)}
                  className={`w-full text-left p-3 rounded-lg border-2 transition ${
                    selectedProduct?.id === product.id
                      ? 'border-accent-green bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img 
                  src={`http://localhost:5000${product.image_url}`} 
                  alt={product.name}
                    className="w-full h-24 object-cover rounded mb-2"
                  />
                  <p className="font-semibold text-sm">{product.name}</p>
                  <p className="text-xs text-gray-500">Rp {product.price.toLocaleString()}</p>
                </button>
              ))}
            </div>

            {/* Color Selection */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-primary-dark mb-3">
                Warna
              </h3>
              <div className="grid grid-cols-4 gap-2">
                {colors.map((color) => (
                  <button
                    key={color.hex}
                    onClick={() => setSelectedColor(color.hex)}
                    className={`w-full aspect-square rounded-lg border-2 transition ${
                      selectedColor === color.hex
                        ? 'border-accent-green scale-110'
                        : 'border-gray-300 hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            {/* Tools */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-primary-dark mb-3">
                Tools
              </h3>
              <div className="space-y-2">
                <button
                  onClick={addTextToModel}
                  className="w-full bg-primary-dark text-white py-2 rounded-lg hover:bg-primary-light transition flex items-center justify-center gap-2"
                >
                  <Type size={18} />
                  Tambah Teks
                </button>
                <button
                  onClick={addImageToModel}
                  className="w-full bg-primary-dark text-white py-2 rounded-lg hover:bg-primary-light transition flex items-center justify-center gap-2"
                >
                  <Upload size={18} />
                  Upload Logo
                </button>
                <button
                  onClick={resetView}
                  className="w-full bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition flex items-center justify-center gap-2"
                >
                  <RotateCcw size={18} />
                  Reset View
                </button>
              </div>
            </div>
          </motion.div>

          {/* Center - 3D Canvas */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-lg p-6 lg:col-span-2"
          >
            <h3 className="text-xl font-semibold text-primary-dark mb-4">
              3D Preview
            </h3>
            <div className="relative">
              <canvas 
                ref={canvasRef} 
                className="w-full h-[500px] rounded-lg border-2 border-gray-300"
              />
              <div className="mt-4 bg-blue-50 p-3 rounded-lg text-sm text-blue-800">
                💡 <strong>Tips:</strong> Drag untuk rotate, scroll untuk zoom, klik kanan untuk pan
              </div>
            </div>
            
            <div className="mt-6 flex gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-accent-green text-white py-3 rounded-lg hover:bg-green-600 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Save size={20} />
                {saving ? 'Menyimpan...' : 'Simpan Desain'}
              </button>
              <button
                onClick={handleDownload}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
              >
                <Download size={20} />
                Download
              </button>
            </div>
          </motion.div>

          {/* Right Panel - Instructions */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-lg shadow-lg p-6 lg:col-span-1"
          >
            <h3 className="text-xl font-semibold text-primary-dark mb-4">
              Panduan
            </h3>
            <div className="space-y-4 text-sm text-gray-600">
              <div>
                <h4 className="font-semibold text-primary-dark mb-1">🎯 Pilih Produk</h4>
                <p>Klik produk yang ingin Anda custom dari daftar</p>
              </div>
              <div>
                <h4 className="font-semibold text-primary-dark mb-1">🎨 Ubah Warna</h4>
                <p>Pilih warna untuk mengubah warna dasar produk</p>
              </div>
              <div>
                <h4 className="font-semibold text-primary-dark mb-1">📝 Tambah Desain</h4>
                <p>Tambahkan teks atau logo pada produk 3D</p>
              </div>
              <div>
                <h4 className="font-semibold text-primary-dark mb-1">🖱️ Kontrol 3D</h4>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  <li>Drag: Putar model</li>
                  <li>Scroll: Zoom in/out</li>
                  <li>Klik kanan: Pan/geser</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-primary-dark mb-1">💾 Simpan</h4>
                <p>Simpan desain Anda atau download sebagai gambar</p>
              </div>
            </div>

            {/* Product Info */}
            {selectedProduct && (
              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">
                  Produk Terpilih
                </h4>
                <p className="text-sm text-green-800">
                  <strong>{selectedProduct.name}</strong>
                </p>
                <p className="text-sm text-green-700">
                  Harga: Rp {selectedProduct.price.toLocaleString()}
                </p>
                <p className="text-xs text-green-600 mt-2">
                  Stok: {selectedProduct.stock} pcs
                </p>
              </div>
            )}  
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Design;