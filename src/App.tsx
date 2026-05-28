import { useEffect, useRef, useState } from 'react';
import './index.css';
import './styles/fonts.css';
import './styles/theme.css';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const VIDEO_URL = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_083109_283f3553-e28f-428b-a723-d639c617eb2b.mp4";

const WORK_CATEGORIES = [
  {
    id: 'automotive',
    title: 'Automotive',
    label: 'CANEPA AUTOMOTIVE',
    desc: 'Studio documentation of rare prototypes and historic vehicles.',
    thumbnail: 'thumbnails/automotive.jpg',
    images: [
      { url: 'photos/automotive/automotive.jpg', caption: 'Automotive — Original thumbnail' },
      { url: 'photos/automotive/automotive.jpg', caption: 'Automotive — Studio profile' },
      { url: 'photos/automotive/automotive.jpg', caption: 'Automotive — Detail study' },
    ]
  },
  {
    id: 'personal',
    title: 'Personal',
    label: 'INTIMATE WORK',
    desc: 'Quiet moments and personal explorations.',
    thumbnail: 'thumbnails/personal.jpg',
    images: [
      { url: 'photos/personal/personal.jpg', caption: 'Personal — Original thumbnail' },
      { url: 'photos/personal/personal.jpg', caption: 'Personal — Intimate moment' },
    ]
  },
  {
    id: 'military',
    title: 'Military & Documentary',
    label: 'DEFENSE POW/MIA & BLM',
    desc: 'Forensic documentation and environmental storytelling.',
    thumbnail: 'thumbnails/military.jpg',
    images: [
      { url: 'photos/military/military.jpg', caption: 'Military — Original thumbnail' },
      { url: 'photos/military/military.jpg', caption: 'Military — Field documentation' },
    ]
  },
  {
    id: 'graphic',
    title: 'Graphic & Conceptual',
    label: 'AI + DESIGN EXPLORATIONS',
    desc: 'Generative concept development and visual systems.',
    thumbnail: 'thumbnails/graphics.jpg',
    images: [
      { url: 'photos/graphic/graphics.jpg', caption: 'Graphic — Original thumbnail' },
      { url: 'photos/graphic/graphics.jpg', caption: 'Graphic — Conceptual study' },
    ]
  }
];

function PhotoViewer3D({ imageUrl, onClose }: { imageUrl: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col">
      <div className="flex justify-between items-center p-6 text-white border-b border-white/10">
        <div className="text-sm tracking-[2px] text-white/60">3D VIEWER — DRAG TO ORBIT</div>
        <button onClick={onClose} className="text-white/80 hover:text-white">Close</button>
      </div>
      <div className="flex-1">
        <Canvas camera={{ position: [0, 0, 6], fov: 48 }} className="w-full h-full">
          <ambientLight intensity={0.7} />
          <directionalLight position={[5, 8, 5]} intensity={1.3} />
          <directionalLight position={[-6, -2, -4]} intensity={0.4} color="#aaccff" />
          <PhotoPlane url={imageUrl} />
          <OrbitControls enableDamping dampingFactor={0.08} minDistance={2.2} maxDistance={15} />
        </Canvas>
      </div>
    </div>
  );
}

function PhotoPlane({ url }: { url: string }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load(url, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      setTexture(tex);
    });
  }, [url]);

  if (!texture) return null;
  const img = texture.image as HTMLImageElement | undefined;
  const aspect = img ? img.width / img.height : 1.5;

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[5.8 * aspect, 5.8]} />
      <meshPhongMaterial map={texture} shininess={10} specular="#222" side={THREE.DoubleSide} />
    </mesh>
  );
}

function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoOpacity, setVideoOpacity] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [show3DViewer, setShow3DViewer] = useState(false);
  const [current3DImage, setCurrent3DImage] = useState('');

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let rafId: number;
    let fadingOut = false;

    const monitor = () => {
      if (!video.duration || video.paused || video.ended) {
        rafId = requestAnimationFrame(monitor);
        return;
      }
      const left = video.duration - video.currentTime;

      if (video.currentTime < 0.5 && videoOpacity < 1) {
        setVideoOpacity(Math.min(video.currentTime / 0.5, 1));
      }
      if (left < 0.55 && !fadingOut) {
        fadingOut = true;
        const start = video.currentTime;
        const step = () => {
          const p = Math.min((video.currentTime - start) / 0.55, 1);
          setVideoOpacity(Math.max(1 - p, 0));
          if (videoOpacity > 0.04) rafId = requestAnimationFrame(step);
        };
        step();
      }
      rafId = requestAnimationFrame(monitor);
    };

    const ended = () => {
      setVideoOpacity(0);
      setTimeout(() => { if (video) { video.currentTime = 0; video.play().catch(()=>{}); fadingOut=false; } }, 100);
    };

    video.addEventListener('ended', ended);
    video.play().then(() => rafId = requestAnimationFrame(monitor)).catch(()=>{});

    return () => { cancelAnimationFrame(rafId); video.removeEventListener('ended', ended); };
  }, [videoOpacity]);

  const openGallery = (cat: any) => setSelectedCategory(cat);
  const closeGallery = () => setSelectedCategory(null);

  const open3D = (url: string) => {
    setCurrent3DImage(url);
    setShow3DViewer(true);
  };

  return (
    <div className="bg-[#0a0a0a] text-[#f5f5f5] min-h-screen">
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/95 backdrop-blur border-b border-white/10">
        <div className="max-w-7xl mx-auto px-8 py-5 flex justify-between items-center">
          <a href="#hero" className="text-3xl tracking-tight font-normal" style={{ fontFamily: 'Instrument Serif, Georgia, serif' }}>
            Seth Coulter<sup className="text-xs align-super ml-0.5">®</sup>
          </a>
          <div className="flex items-center gap-8 text-sm">
            <a href="#work" className="text-[#a8a8a8] hover:text-white transition">Work</a>
            <a href="#experiments" className="text-[#a8a8a8] hover:text-white transition">Experiments</a>
            <a href="#about" className="text-[#a8a8a8] hover:text-white transition">About</a>
            <a href="https://www.instagram.com/sethac.photo/" target="_blank" className="text-[#a8a8a8] hover:text-white">Instagram</a>
            <button onClick={() => document.getElementById('work')?.scrollIntoView({ behavior: 'smooth' })} 
                    className="rounded-full px-6 py-2.5 bg-white text-black text-sm font-medium hover:scale-[1.02]">
              Begin Journey
            </button>
          </div>
        </div>
      </nav>

      {/* DARK CINEMATIC HERO */}
      <header id="hero" className="relative min-h-[100dvh] flex items-center justify-center bg-[#0a0a0a] overflow-hidden">
        <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover z-0" style={{ top: '280px', opacity: videoOpacity }} src={VIDEO_URL} muted playsInline />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-transparent to-[#0a0a0a] z-10" />

        <div className="relative z-30 text-center px-6 max-w-5xl pt-16">
          <div className="uppercase tracking-[4px] text-xs mb-4 text-white/50">PHOTOGRAPHY & VISUAL DESIGN</div>
          <h1 className="text-[64px] md:text-[82px] leading-[0.9] tracking-[-3px] font-normal mb-8" style={{ fontFamily: 'Instrument Serif, Georgia, serif' }}>
            PHOTOGRAPHY & VISUAL DESIGN
          </h1>
          <p className="max-w-xl mx-auto text-lg text-white/70 mb-10">
            Documenting rare machines, forgotten stories, and the quiet spaces between light and time.
          </p>
          <a href="#work" className="inline-block rounded-full px-14 py-4 bg-white text-black font-medium hover:scale-[1.02]">View the Work</a>
        </div>
        <div className="absolute bottom-10 text-xs tracking-[3px] text-white/40">SCROLL TO EXPLORE</div>
      </header>

      {/* WORK - Original Bento Style */}
      <section id="work" className="max-w-7xl mx-auto px-8 py-20">
        <div className="text-center mb-12">
          <div className="text-[#00e5ff] tracking-[4px] text-xs mb-2">SELECTED WORK</div>
          <h2 className="text-6xl tracking-[-1.5px]" style={{ fontFamily: 'Instrument Serif, Georgia, serif' }}>Four bodies of work.<br />One perspective.</h2>
        </div>

        <div className="bento-grid">
          {WORK_CATEGORIES.map(cat => (
            <div 
              key={cat.id} 
              onClick={() => openGallery(cat)} 
              className="bento-item"
              style={{ backgroundImage: `url(${cat.thumbnail})` }}
            >
              <div className="bento-overlay">
                <span>{cat.title}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* EXPERIMENTS */}
      <section id="experiments" className="bg-[#111] py-20">
        <div className="max-w-5xl mx-auto px-8 text-center">
          <div className="text-[#00e5ff] tracking-[4px] text-xs mb-2">PLAYGROUND</div>
          <h2 className="text-6xl tracking-[-1.5px] mb-12" style={{ fontFamily: 'Instrument Serif, Georgia, serif' }}>Experiments in AI & Interaction</h2>

          <div className="grid md:grid-cols-2 gap-6 text-left">
            <a href="https://lazy-prompt-fixer.vercel.app/" target="_blank" className="p-9 bg-[#1a1a1a] rounded-3xl border border-white/10 hover:border-white/20 block">
              <div className="text-3xl tracking-tight mb-3">Midjourney Prompt Optimizer</div>
              <p className="text-white/70">Refine and elevate AI image prompts with intelligent structure.</p>
            </a>
            <a href="https://veo-prompt-opt.vercel.app/" target="_blank" className="p-9 bg-[#1a1a1a] rounded-3xl border border-white/10 hover:border-white/20 block">
              <div className="text-3xl tracking-tight mb-3">VEO 3 Prompt Optimizer</div>
              <p className="text-white/70">Craft precise cinematic prompts for Google’s VEO 3.</p>
            </a>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="max-w-5xl mx-auto px-8 py-24">
        <div className="grid md:grid-cols-5 gap-x-16">
          <div className="md:col-span-2">
            <div className="text-[#00e5ff] tracking-[3px] text-xs mb-3">CHAPTERS</div>
            <h2 className="text-[52px] leading-none tracking-[-1.8px]" style={{ fontFamily: 'Instrument Serif, Georgia, serif' }}>Photographer.<br />Visual designer.<br />Storyteller.</h2>
          </div>
          <div className="md:col-span-3 text-[17px] leading-relaxed text-white/80 space-y-6 pt-4">
            <p>I’m a photographer and visual designer with experience spanning commercial advertising, forensic documentation, and generative AI concept development.</p>
            <p>From studio-lit ad sets in Los Angeles to excavation sites across the Pacific — always with a camera and an eye for clarity.</p>
            <a href="documents/Updated Resume July2025.pdf" target="_blank" className="inline-block mt-4 rounded-full border border-white/30 px-8 py-3 text-sm hover:bg-white hover:text-black">Download Resume</a>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 py-10 text-center text-xs text-white/40 tracking-[2px]">
        © {new Date().getFullYear()} SETH COULTER — ALL RIGHTS RESERVED
      </footer>

      {/* Gallery Modal */}
      {selectedCategory && (
        <div className="fixed inset-0 bg-black/95 z-[90] flex items-center justify-center p-6" onClick={closeGallery}>
          <div className="max-w-4xl w-full bg-[#111] rounded-3xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-8 py-6 border-b border-white/10 flex justify-between">
              <div>
                <div className="text-[#00e5ff] text-xs tracking-widest">{selectedCategory.label}</div>
                <div className="text-3xl tracking-tight" style={{ fontFamily: 'Instrument Serif, Georgia, serif' }}>{selectedCategory.title}</div>
              </div>
              <button onClick={closeGallery} className="text-white/60 hover:text-white">Close</button>
            </div>
            <div className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {selectedCategory.images.map((img: any, i: number) => (
                <div key={i} className="relative">
                  <img src={img.url} className="rounded-2xl w-full" />
                  <button onClick={() => open3D(img.url)} className="absolute top-4 right-4 bg-black/70 text-xs px-4 py-1.5 rounded-full hover:bg-white hover:text-black">View in 3D</button>
                  <div className="absolute bottom-0 left-0 p-5 text-sm text-white/80 bg-black/70 rounded-b-2xl">{img.caption}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {show3DViewer && <PhotoViewer3D imageUrl={current3DImage} onClose={() => setShow3DViewer(false)} />}
    </div>
  );
}

export default App;
