import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Grid, Download, Plus, Play, Trash2, Undo2, Map as MapIcon, ChevronRight, Languages, Check } from 'lucide-react';
import { ProjectData, GridConfig } from '../types';
import { getAllProjects, deleteProject, saveProject } from '../utils/storage';

interface DashboardProps {
  onSelectProject: (p: ProjectData) => void;
  onCreateNew: () => void;
}

type Language = 'en' | 'es' | 'de';

const TRANSLATIONS = {
  en: {
    brand: "Hex Calibrator",
    productTag: "Product-Led Design",
    titleStart: "Order from",
    titleChaos: "Chaos.",
    subtitle: "Transform raw map images into tactical, VTT-ready gridded overlays in seconds. Align, calibrate, and dominate your tabletop sessions.",
    stepUpload: "Upload Map",
    stepCalibrate: "Calibrate",
    stepExport: "Export PNG",
    rawData: "Raw Image Data",
    calibrated: "CALIBRATED",
    yourCampaigns: "Your Campaigns",
    newProjectBtn: "New Project",
    readyTitle: "Ready to Calibrate?",
    readyText: "You haven't created any projects yet. Upload a map to get started or try our demo to see how it works.",
    createNewAction: "Create New Project",
    tryDemoAction: "Try Demo Map",
    createNewCard: "Create New",
    lastEdit: "Last edit:",
    openEditor: "Open Editor",
    delete: "Delete",
    deletingTitle: "Deleting...",
    deletingDesc: "File deletion in progress.",
    undo: "Undo"
  },
  es: {
    brand: "Calibrador Hex",
    productTag: "Diseño de Producto",
    titleStart: "Orden desde el",
    titleChaos: "Caos.",
    subtitle: "Transforma imágenes de mapas en cuadrículas tácticas listas para VTT en segundos. Alinea, calibra y domina tus sesiones de juego.",
    stepUpload: "Subir Mapa",
    stepCalibrate: "Calibrar",
    stepExport: "Exportar PNG",
    rawData: "Datos Crudos",
    calibrated: "CALIBRADO",
    yourCampaigns: "Tus Campañas",
    newProjectBtn: "Nuevo Proyecto",
    readyTitle: "¿Listo para Calibrar?",
    readyText: "Aún no has creado proyectos. Sube un mapa para comenzar o prueba nuestra demo para ver cómo funciona.",
    createNewAction: "Crear Proyecto",
    tryDemoAction: "Probar Demo",
    createNewCard: "Crear Nuevo",
    lastEdit: "Editado:",
    openEditor: "Abrir Editor",
    delete: "Eliminar",
    deletingTitle: "Eliminando...",
    deletingDesc: "Eliminación en curso.",
    undo: "Deshacer"
  },
  de: {
    brand: "Hex Kalibrierer",
    productTag: "Produktorientiertes Design",
    titleStart: "Ordnung aus dem",
    titleChaos: "Chaos.",
    subtitle: "Verwandeln Sie rohe Kartenbilder in Sekundenschnelle in taktische Gitter. Ausrichten, kalibrieren und beherrschen Sie Ihre Tabletop-Sessions.",
    stepUpload: "Karte laden",
    stepCalibrate: "Kalibrieren",
    stepExport: "Export PNG",
    rawData: "Rohdaten",
    calibrated: "KALIBRIERT",
    yourCampaigns: "Ihre Kampagnen",
    newProjectBtn: "Neues Projekt",
    readyTitle: "Bereit?",
    readyText: "Sie haben noch keine Projekte erstellt. Laden Sie eine Karte hoch oder testen Sie unsere Demo.",
    createNewAction: "Neues Projekt",
    tryDemoAction: "Demo testen",
    createNewCard: "Neu erstellen",
    lastEdit: "Bearbeitet:",
    openEditor: "Editor öffnen",
    delete: "Löschen",
    deletingTitle: "Löschen...",
    deletingDesc: "Löschvorgang läuft.",
    undo: "Rückgängig"
  }
};

// --- SUB-COMPONENT: The Hero Scanner Animation ---
const ScannerHero = ({ t }: { t: typeof TRANSLATIONS['en'] }) => {
  return (
    <div className="relative w-full max-w-md h-48 md:h-56 rounded-xl overflow-hidden border border-slate-700/50 shadow-2xl bg-slate-900 mx-auto md:mx-0">
      {/* Layer 1: Raw Map (Concept) */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950 flex items-center justify-center">
        <div className="opacity-20 text-slate-500 font-mono text-xs tracking-widest uppercase rotate-12">{t.rawData}</div>
        {/* Synthetic Map Shapes */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-slate-700 rounded-full blur-xl opacity-40"></div>
        <div className="absolute bottom-5 right-10 w-32 h-32 bg-slate-600 rounded-full blur-2xl opacity-30"></div>
      </div>

      {/* Layer 2: Calibrated Grid (Revealed by scan) */}
      <motion.div 
        className="absolute inset-0 bg-indigo-950/80 border-r-2 border-cyan-400 box-content z-10 overflow-hidden"
        initial={{ width: "0%" }}
        animate={{ width: ["0%", "100%", "0%"] }}
        transition={{ duration: 8, ease: "linear", repeat: Infinity, repeatDelay: 1 }}
      >
        <div className="absolute inset-0 w-[450px] h-full" style={{ 
          backgroundImage: 'radial-gradient(circle, rgba(94,234,212,0.2) 1px, transparent 1px)', 
          backgroundSize: '20px 20px' 
        }}>
           <div className="absolute top-10 left-10 w-20 h-20 border-2 border-indigo-400/50 rounded-full"></div>
           <div className="absolute bottom-5 right-10 w-32 h-32 border-2 border-indigo-400/50 rounded-full"></div>
           <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-cyan-300 font-bold tracking-wider text-sm shadow-black drop-shadow-md">
             {t.calibrated}
           </div>
        </div>
        {/* Scan Line Glow */}
        <div className="absolute top-0 right-0 w-8 h-full bg-gradient-to-l from-cyan-500/50 to-transparent"></div>
      </motion.div>
    </div>
  );
};

export const Dashboard: React.FC<DashboardProps> = ({ onSelectProject, onCreateNew }) => {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingDeletions, setPendingDeletions] = useState<Record<string, number>>({});
  
  // Language State Initialization
  // Priority: 1. LocalStorage, 2. Browser Language, 3. Default (Spanish)
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('hex_app_lang');
    if (saved === 'en' || saved === 'es' || saved === 'de') return saved as Language;

    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('en')) return 'en';
    if (browserLang.startsWith('de')) return 'de';
    
    // Default fallback is Spanish
    return 'es';
  });

  const [isLangMenuOpen, setLangMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  const handleSetLanguage = (l: Language) => {
    setLang(l);
    setLangMenuOpen(false);
    localStorage.setItem('hex_app_lang', l);
  };

  // Click outside to close lang menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setLangMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const t = TRANSLATIONS[lang];

  const loadProjects = async () => {
    if (projects.length === 0) setLoading(true);
    try {
      const list = await getAllProjects();
      setProjects(list);
    } catch (e) {
      console.error("Failed to load projects", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
    return () => Object.values(pendingDeletions).forEach(window.clearTimeout);
  }, []);

  // --- Actions ---

  const initiateDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (pendingDeletions[id]) window.clearTimeout(pendingDeletions[id]);

    const timeoutId = window.setTimeout(async () => {
      await deleteProject(id);
      setProjects(prev => prev.filter(p => p.id !== id));
      setPendingDeletions(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }, 6000);

    setPendingDeletions(prev => ({ ...prev, [id]: timeoutId }));
  };

  const undoDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const timeoutId = pendingDeletions[id];
    if (timeoutId) {
      window.clearTimeout(timeoutId);
      setPendingDeletions(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

  const createDemoProject = async () => {
    setLoading(true);
    // Create a generic placeholder blob
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    if (ctx) {
        // Draw a fake map
        const grad = ctx.createLinearGradient(0,0,800,600);
        grad.addColorStop(0, '#1e293b');
        grad.addColorStop(1, '#0f172a');
        ctx.fillStyle = grad;
        ctx.fillRect(0,0,800,600);
        ctx.fillStyle = '#334155';
        ctx.beginPath();
        ctx.arc(400, 300, 150, 0, Math.PI*2);
        ctx.fill();
        ctx.fillStyle = '#475569';
        ctx.fillRect(100, 100, 200, 150);
    }
    
    canvas.toBlob(async (blob) => {
        const demoProject: ProjectData = {
            id: crypto.randomUUID(),
            name: "Demo Dungeon (Example)",
            lastModified: Date.now(),
            imageBlob: blob,
            imageOrigin: { x: 0, y: 0 },
            config: {
                radius: 40,
                offsetX: 0,
                offsetY: 0,
                rotation: 0,
                lineColor: '#ffffff',
                lineWidth: 2,
                opacity: 0.5,
                showGrid: true,
                showBoundary: true,
                showCoordinates: true,
            },
            hexData: [],
            markers: [],
            assets: []
        };
        await saveProject(demoProject);
        await loadProjects();
    });
  };

  return (
    // Fixed: changed min-h-screen to h-screen and added overflow-y-auto to allow internal scrolling on fixed-body layouts
    <div className="flex flex-col h-screen w-full hex-bg text-slate-200 overflow-y-auto scroll-smooth">
      
      {/* Top Navigation Bar */}
      <nav className="w-full glass-panel border-b border-white/5 px-6 py-4 flex justify-between items-center sticky top-0 z-50 shrink-0">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg shadow-lg shadow-indigo-500/20">
                <Grid size={20} className="text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight text-white">{t.brand}</span>
          </div>

          <div className="flex items-center gap-6">
             {/* Language Selector */}
             <div className="relative" ref={langMenuRef}>
                <button 
                  onClick={() => setLangMenuOpen(!isLangMenuOpen)} 
                  className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors uppercase"
                >
                    <Languages size={14} />
                    <span>{lang}</span>
                </button>
                <AnimatePresence>
                  {isLangMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-32 bg-slate-900 border border-slate-700 rounded-lg shadow-xl overflow-hidden z-50"
                    >
                      {(['en', 'es', 'de'] as Language[]).map((l) => (
                        <button
                          key={l}
                          onClick={() => handleSetLanguage(l)}
                          className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-indigo-600 hover:text-white transition-colors flex justify-between items-center"
                        >
                          {l === 'en' ? 'English' : l === 'es' ? 'Español' : 'Deutsch'}
                          {lang === l && <Check size={12} />}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
             </div>
             <a href="#" className="text-xs font-medium text-slate-400 hover:text-white transition-colors">v1.2.0 Beta</a>
          </div>
      </nav>

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-12">
        
        {/* --- HERO SECTION --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold uppercase tracking-wider">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                    </span>
                    {t.productTag}
                </div>
                <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.1]">
                    {t.titleStart} <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 animate-gradient-x">
                        {t.titleChaos}
                    </span>
                </h1>
                <p className="text-lg text-slate-400 max-w-lg leading-relaxed">
                    {t.subtitle}
                </p>

                {/* Feature Steps / Action Buttons (Interactive Now) */}
                <div className="flex flex-wrap gap-4 sm:gap-6 pt-6">
                    {[
                        { icon: Upload, label: t.stepUpload },
                        { icon: Grid, label: t.stepCalibrate },
                        { icon: Download, label: t.stepExport }
                    ].map((step, i) => (
                        <motion.button 
                            key={i} 
                            onClick={onCreateNew}
                            whileHover={{ y: -5, scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex flex-col items-center gap-2 group cursor-pointer focus:outline-none"
                        >
                            <div className="p-4 rounded-2xl bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 text-slate-400 group-hover:text-white group-hover:bg-indigo-600 group-hover:border-indigo-500 group-hover:shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all duration-300">
                                <step.icon size={24} />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 group-hover:text-indigo-300 transition-colors">
                                {step.label}
                            </span>
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Visual Hook */}
            <div className="hidden lg:flex justify-center lg:justify-end">
                <ScannerHero t={t} />
            </div>
        </div>

        {/* --- PROJECTS SECTION --- */}
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <MapIcon size={24} className="text-indigo-400" />
                    {t.yourCampaigns}
                </h2>
                {projects.length > 0 && (
                     <button onClick={onCreateNew} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition-all shadow-lg shadow-indigo-500/20">
                        <Plus size={16} /> {t.newProjectBtn}
                     </button>
                )}
            </div>

            {loading ? (
                <div className="w-full h-64 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : projects.length === 0 ? (
                // --- EMPTY STATE ---
                <div className="glass-panel rounded-2xl p-12 text-center border-dashed border-2 border-slate-700">
                    <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Grid size={40} className="text-slate-500" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{t.readyTitle}</h3>
                    <p className="text-slate-400 max-w-md mx-auto mb-8">
                        {t.readyText}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button 
                            onClick={onCreateNew} 
                            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/25 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                        >
                            <Upload size={18} /> {t.createNewAction}
                        </button>
                        <button 
                            onClick={createDemoProject}
                            className="px-6 py-3 bg-transparent border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                        >
                            <Play size={18} /> {t.tryDemoAction}
                        </button>
                    </div>
                </div>
            ) : (
                // --- PROJECT GRID ---
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
                    {/* Inline Create Card */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={onCreateNew}
                        className="glass-panel h-72 rounded-2xl border-2 border-dashed border-slate-700 hover:border-indigo-500/50 hover:bg-slate-800/40 cursor-pointer flex flex-col items-center justify-center group transition-all duration-300"
                    >
                        <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-indigo-600 transition-all shadow-xl">
                            <Plus size={32} className="text-slate-400 group-hover:text-white" />
                        </div>
                        <span className="font-semibold text-slate-400 group-hover:text-white transition-colors">{t.createNewCard}</span>
                    </motion.div>

                    {/* Project Cards */}
                    <AnimatePresence>
                        {projects.map((p, index) => {
                             const isDeleting = !!pendingDeletions[p.id];
                             
                             return (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ delay: index * 0.05 }}
                                    key={p.id}
                                    onClick={() => !isDeleting && onSelectProject(p)}
                                    className={`relative h-72 rounded-2xl glass-panel glass-card-hover overflow-hidden transition-all duration-300 group cursor-pointer
                                        ${isDeleting ? 'border-red-500/50 bg-red-950/10' : ''}
                                    `}
                                >
                                    {isDeleting ? (
                                        // Deleting State
                                        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 bg-slate-950/90 text-center">
                                            <Trash2 size={32} className="text-red-500 mb-4 animate-bounce" />
                                            <p className="text-white font-bold mb-1">{t.deletingTitle}</p>
                                            <p className="text-slate-400 text-xs mb-6">{t.deletingDesc}</p>
                                            <div className="w-full h-1 bg-slate-800 rounded-full mb-6 overflow-hidden">
                                                <div className="h-full bg-red-500 animate-[shrink_6s_linear_forwards] w-full origin-left"></div>
                                            </div>
                                            <button 
                                                onClick={(e) => undoDelete(e, p.id)}
                                                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold rounded-lg border border-slate-700 flex items-center gap-2 transition-colors"
                                            >
                                                <Undo2 size={16} /> {t.undo}
                                            </button>
                                        </div>
                                    ) : (
                                        // Normal State
                                        <>
                                            {/* Image Area */}
                                            <div className="h-40 w-full relative bg-slate-900 overflow-hidden">
                                                {p.imageBlob ? (
                                                    <img 
                                                        src={URL.createObjectURL(p.imageBlob)} 
                                                        alt={p.name} 
                                                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ease-out" 
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-slate-900">
                                                        <MapIcon size={32} className="text-slate-700" />
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-90"></div>
                                                
                                                {/* Edit Button Hover Overlay */}
                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                    <div className="bg-indigo-600/90 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform">
                                                        {t.openEditor}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Content Area */}
                                            <div className="p-5 flex flex-col justify-between h-32 relative">
                                                <div>
                                                    <h3 className="font-bold text-lg text-slate-100 truncate group-hover:text-indigo-300 transition-colors mb-1">{p.name}</h3>
                                                    <p className="text-xs text-slate-500 font-mono">
                                                        {t.lastEdit} {new Date(p.lastModified).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                
                                                <div className="flex justify-between items-center mt-2 border-t border-white/5 pt-3">
                                                    <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500 bg-slate-800/50 px-2 py-1 rounded">
                                                        {p.config.radius}px Hex
                                                    </span>
                                                    
                                                    <button 
                                                        onClick={(e) => initiateDelete(e, p.id)}
                                                        className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                        title={t.delete}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </motion.div>
                             );
                        })}
                    </AnimatePresence>
                </div>
            )}
        </div>
      </main>

      {/* Global CSS for Animations */}
      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
        @keyframes gradient-x {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
        }
        .animate-gradient-x {
            background-size: 200% 200%;
            animation: gradient-x 15s ease infinite;
        }
      `}</style>
    </div>
  );
};