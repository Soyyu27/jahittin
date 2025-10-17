import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Type, Upload, Save, Download, Palette, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { saveDesign } from '../utils/api';

const Design = () => {
  const canvasRef = useRef(null);
  const [scene, setScene] = useState(null);
  const [camera, setCamera] = useState(null);
  const [renderer, setRenderer] = useState(null);
  const [controls, setControls] = useState(null);
  const [model, setModel] = useState(null);

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

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

  // 🔹 Ambil kategori dari backend
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/categories');
        const data = await res.json();
        if (data.success) {
          setCategories(data.categories);
          setSelectedCategory(data.categories[0]); // default: kategori pertama
        }
      } catch (err) {
        console.error('Error loading categories:', err);
      } finally {
        setLoading(false);
      }
    };
    loadCategories();
  }, []);

  // 🔹 Setup Three.js scene
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
      antialias: true,
    });
    newRenderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);
    newRenderer.setPixelRatio(window.devicePixelRatio);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    newScene.add(ambientLight);
    newScene.add(directionalLight);

    const newControls = new OrbitControls(newCamera, newRenderer.domElement);
    newControls.enableDamping = true;

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
      if (!canvasRef.current) return;
      newCamera.aspect = canvasRef.current.clientWidth / canvasRef.current.clientHeight;
      newCamera.updateProjectionMatrix();
      newRenderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      newRenderer.dispose();
    };
  }, []);

  // 🔹 Load model saat kategori dipilih
  useEffect(() => {
    if (!scene || !selectedCategory?.model_3d_url) return;

    // hapus model lama
    if (model) scene.remove(model);

    const loader = new GLTFLoader();
    const modelPath = selectedCategory.model_3d_url.startsWith('http')
      ? selectedCategory.model_3d_url
      : `http://localhost:5000${selectedCategory.model_3d_url}`;

    loader.load(
      modelPath,
      (gltf) => {
        const newModel = gltf.scene;
        const box = new THREE.Box3().setFromObject(newModel);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 2 / maxDim;

        newModel.scale.setScalar(scale);
        newModel.position.sub(center.multiplyScalar(scale));

        scene.add(newModel);
        setModel(newModel);
        applyColorToModel(newModel, selectedColor);
      },
      undefined,
      (error) => {
        console.error('Error loading model:', error);
        alert('Gagal memuat model 3D. Pastikan file GLB tersedia.');
      }
    );
  }, [scene, selectedCategory]);

  // 🔹 Ganti warna model
  useEffect(() => {
    if (model) applyColorToModel(model, selectedColor);
  }, [selectedColor]);

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

    context.fillStyle = '#FFF';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#000';
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
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(event.target.result, (texture) => {
          const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
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
    if (!isAuthenticated) return navigate('/login');
    if (!renderer || !scene || !camera) return;

    setSaving(true);
    try {
      renderer.render(scene, camera);
      const screenshot = renderer.domElement.toDataURL('image/png');

      const designData = {
        categoryId: selectedCategory.id,
        categoryName: selectedCategory.name,
        color: selectedColor,
        textures: textures.map((t) => ({
          position: t.position,
          scale: t.scale,
        })),
      };

      await saveDesign({
        product_type: selectedCategory.name,
        design_data: designData,
        preview_image: screenshot,
      });

      alert('Desain berhasil disimpan!');
    } catch (err) {
      alert('Gagal menyimpan desain: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
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
            <Palette size={36} className="text-green-500" />
            Custom 3D Design Studio
          </h1>
          <p className="text-gray-600">
            Pilih kategori dan desain pakaianmu secara interaktif 🎨
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Left Panel */}
          <div className="bg-white rounded-lg shadow-lg p-6 lg:col-span-1">
            <h3 className="text-lg font-semibold mb-4">Pilih Kategori</h3>
            <select
              value={selectedCategory?.id || ''}
              onChange={(e) =>
                setSelectedCategory(
                  categories.find((cat) => cat.id === Number(e.target.value))
                )
              }
              className="w-full border rounded-lg p-2 mb-4"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            <h3 className="text-lg font-semibold mb-3">Warna</h3>
            <div className="grid grid-cols-4 gap-2">
              {colors.map((color) => (
                <button
                  key={color.hex}
                  onClick={() => setSelectedColor(color.hex)}
                  className={`w-full aspect-square rounded-lg border-2 ${
                    selectedColor === color.hex
                      ? 'border-green-500 scale-110'
                      : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color.hex }}
                />
              ))}
            </div>

            <div className="mt-6 space-y-2">
              <button
                onClick={addTextToModel}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <Type size={18} /> Tambah Teks
              </button>
              <button
                onClick={addImageToModel}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <Upload size={18} /> Upload Logo
              </button>
              <button
                onClick={resetView}
                className="w-full bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 flex items-center justify-center gap-2"
              >
                <RotateCcw size={18} /> Reset View
              </button>
            </div>
          </div>

          {/* 3D Preview */}
          <div className="bg-white rounded-lg shadow-lg p-6 lg:col-span-2">
            <h3 className="text-xl font-semibold mb-4">3D Preview</h3>
            <canvas ref={canvasRef} className="w-full h-[500px] border rounded-lg" />
            <div className="mt-4 flex gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Save size={20} />
                {saving ? 'Menyimpan...' : 'Simpan Desain'}
              </button>
              <button
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = renderer.domElement.toDataURL('image/png');
                  link.download = `design-${selectedCategory?.name}-${Date.now()}.png`;
                  link.click();
                }}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
              >
                <Download size={20} /> Download
              </button>
            </div>
          </div>

          {/* Right Panel */}
          <div className="bg-white rounded-lg shadow-lg p-6 lg:col-span-1">
            <h3 className="text-lg font-semibold mb-4">Panduan</h3>
            <ul className="text-sm text-gray-700 space-y-2">
              <li>🎯 Pilih kategori produk</li>
              <li>🎨 Ubah warna dasar model</li>
              <li>🖋️ Tambah teks atau logo</li>
              <li>🖱️ Gunakan mouse untuk rotasi & zoom</li>
              <li>💾 Simpan atau download hasil desain</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Design;
