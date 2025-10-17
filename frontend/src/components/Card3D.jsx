    // src/components/Card3D.jsx
    import { useEffect, useRef, useState } from "react";
    import * as THREE from "three";
    import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
    import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

    const Card3D = ({ modelUrl, color }) => {
    const canvasRef = useRef(null);
    const [scene, setScene] = useState(null);
    const [camera, setCamera] = useState(null);
    const [renderer, setRenderer] = useState(null);
    const [controls, setControls] = useState(null);
    const [model, setModel] = useState(null);

    // ✅ Setup scene
    useEffect(() => {
        if (!canvasRef.current) return;

        const newScene = new THREE.Scene();
        newScene.background = new THREE.Color(0xf8fafc);

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

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(5, 5, 5);
        newScene.add(ambientLight, dirLight);

        const newControls = new OrbitControls(newCamera, newRenderer.domElement);
        newControls.enableDamping = true;
        newControls.dampingFactor = 0.05;
        newControls.minDistance = 1;
        newControls.maxDistance = 10;

        const animate = () => {
        requestAnimationFrame(animate);
        newControls.update();
        newRenderer.render(newScene, newCamera);
        };
        animate();

        setScene(newScene);
        setCamera(newCamera);
        setRenderer(newRenderer);
        setControls(newControls);

        const handleResize = () => {
        if (!canvasRef.current) return;
        newCamera.aspect = canvasRef.current.clientWidth / canvasRef.current.clientHeight;
        newCamera.updateProjectionMatrix();
        newRenderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);
        };
        window.addEventListener("resize", handleResize);

        return () => {
        window.removeEventListener("resize", handleResize);
        newRenderer.dispose();
        };
    }, []);

    // ✅ Load model
    useEffect(() => {
        if (!scene || !modelUrl) return;

        if (model) scene.remove(model);

        const loader = new GLTFLoader();
        const fullUrl = modelUrl.startsWith("http")
        ? modelUrl
        : `http://localhost:5000${modelUrl}`;

        loader.load(
        fullUrl,
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
        },
        undefined,
        (error) => console.error("Gagal load model:", error)
        );
    }, [scene, modelUrl]);

    // ✅ Update warna model
    useEffect(() => {
        if (!model) return;
        model.traverse((child) => {
        if (child.isMesh) {
            child.material = new THREE.MeshStandardMaterial({
            color: new THREE.Color(color),
            roughness: 0.5,
            metalness: 0.1,
            });
        }
        });
    }, [model, color]);

    return (
        <div className="relative">
        <canvas
            ref={canvasRef}
            className="w-full h-[500px] rounded-lg border-2 border-gray-300"
        />
        <div className="mt-4 bg-blue-50 p-3 rounded-lg text-sm text-blue-800">
            💡 <strong>Tips:</strong> Drag untuk rotate, scroll untuk zoom, klik kanan untuk pan
        </div>
        </div>
    );
    };

    export default Card3D;
