
import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Grid, Download, Plus, Play, Trash2, Undo2, Map as MapIcon, ChevronRight, Languages, Check, Folder as FolderIcon, FolderOpen, ArrowLeft, MoreHorizontal, FileOutput, Archive, Flame, RefreshCcw, AlertTriangle, Scan, Target, MousePointer2 } from 'lucide-react';
import { ProjectData, Folder } from '../types';
import { getAllProjects, deleteProject, saveProject, getAllFolders, saveFolder, deleteFolder } from '../utils/storage';

interface DashboardProps {
  onSelectProject: (p: ProjectData) => void;
  onCreateNew: (folderId?: string) => void;
}

// --- HERO SECTION COMPONENT ---
const HeroSection: React.FC<{ onCreateNew: () => void }> = ({ onCreateNew }) => {
  return (
    <section className="relative w-full mb-16 pt-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* LEFT COLUMN: Actions & Text */}
        <div className="flex flex-col items-start z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full bg-cyan-950/30 border border-cyan-500/30 text-[10px] font-bold tracking-widest text-cyan-400 uppercase shadow-[0_0_10px_rgba(6,182,212,0.2)]"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            Product-Led Design
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-black text-white leading-tight mb-4 tracking-tight"
          >
            Order from <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-400 to-slate-700">Chaos.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-slate-400 max-w-lg mb-10 leading-relaxed"
          >
            Transform raw map images into tactical, VTT-ready gridded overlays in seconds. Align, calibrate, and dominate your tabletop sessions.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap gap-4 w-full max-w-lg"
          >
            {/* Quick Action: UPLOAD */}
            <button 
              onClick={() => onCreateNew()}
              className="group flex-1 h-24 bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/50 rounded-xl flex flex-col items-center justify-center gap-3 transition-all duration-300 relative overflow-hidden"
            >
               <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
               <div className="p-2 rounded-lg bg-slate-800 group-hover:bg-cyan-950 text-slate-400 group-hover:text-cyan-400 transition-colors">
                  <Upload size={24} strokeWidth={1.5} />
               </div>
               <span className="text-xs font-bold tracking-wider text-slate-400 group-hover:text-white transition-colors">UPLOAD MAP</span>
            </button>

            {/* Quick Action: CALIBRATE */}
            <button 
               onClick={() => onCreateNew()} // Directs to new project for demo flow
               className="group flex-1 h-24 bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500/50 rounded-xl flex flex-col items-center justify-center gap-3 transition-all duration-300 relative overflow-hidden"
            >
               <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
               <div className="p-2 rounded-lg bg-slate-800 group-hover:bg-indigo-950 text-slate-400 group-hover:text-indigo-400 transition-colors">
                  <Target size={24} strokeWidth={1.5} />
               </div>
               <span className="text-xs font-bold tracking-wider text-slate-400 group-hover:text-white transition-colors">CALIBRATE</span>
            </button>

            {/* Quick Action: EXPORT */}
            <button 
               onClick={() => onCreateNew()} // Directs to new project for demo flow
               className="group flex-1 h-24 bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-purple-500/50 rounded-xl flex flex-col items-center justify-center gap-3 transition-all duration-300 relative overflow-hidden"
            >
               <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
               <div className="p-2 rounded-lg bg-slate-800 group-hover:bg-purple-950 text-slate-400 group-hover:text-purple-400 transition-colors">
                  <Download size={24} strokeWidth={1.5} />
               </div>
               <span className="text-xs font-bold tracking-wider text-slate-400 group-hover:text-white transition-colors">EXPORT PNG</span>
            </button>
          </motion.div>
        </div>

        {/* RIGHT COLUMN: The Scanner Animation */}
        <div className="relative h-80 lg:h-96 w-full z-0">
          {/* Glass Container */}
          <motion.div 
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ duration: 0.7, delay: 0.2 }}
             className="absolute inset-0 rounded-2xl bg-slate-900/40 backdrop-blur-md border border-white/10 overflow-hidden shadow-2xl shadow-cyan-900/20"
          >
             {/* Background Grid inside Scanner */}
             <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] opacity-30"></div>
             
             {/* Decorative UI Elements */}
             <div className="absolute top-4 left-4 flex gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500/50" />
                <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
                <div className="w-2 h-2 rounded-full bg-green-500/50" />
             </div>
             <div className="absolute bottom-4 right-6 text-[10px] font-mono text-cyan-700/60 tracking-widest">
                SYSTEM_READY // V.2.0.4
             </div>

             {/* Center Content Area */}
             <div className="absolute inset-0 flex items-center justify-center">
                
                {/* 1. Raw Data State (Base Layer) */}
                <div className="relative z-0 flex flex-col items-center gap-4 opacity-40 blur-[1px]">
                   <MapIcon size={64} className="text-slate-600" />
                   <div className="text-slate-500 font-mono text-sm tracking-[0.2em] font-bold">RAW IMAGE DATA</div>
                   <div className="flex gap-1 mt-2">
                      <div className="w-16 h-1 bg-slate-700 rounded-full" />
                      <div className="w-8 h-1 bg-slate-700 rounded-full" />
                   </div>
                </div>

                {/* 2. Calibrated State (Revealed Layer) */}
                <motion.div 
                   className="absolute inset-0 z-10 bg-slate-900/80 flex flex-col items-center justify-center gap-4"
                   animate={{ 
                      clipPath: ["inset(0 100% 0 0)", "inset(0 0% 0 0)", "inset(0 0% 0 0)", "inset(0 100% 0 0)"] 
                   }}
                   transition={{ 
                      duration: 4, 
                      ease: "easeInOut", 
                      repeat: Infinity,
                      repeatDelay: 1
                   }}
                >
                   {/* Grid Overlay Effect on Reveal */}
                   <div className="absolute inset-0 bg-[size:20px_20px] bg-[linear-gradient(rgba(6,182,212,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.1)_1px,transparent_1px)]"></div>
                   
                   <div className="relative">
                      <Grid size={64} className="text-cyan-400 drop-shadow-[0_0_15px_rgba(6,182,212,0.6)]" />
                      <motion.div 
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="absolute -top-2 -right-2 text-cyan-300"
                      >
                         <Target size={16} />
                      </motion.div>
                   </div>
                   
                   <div className="text-cyan-400 font-mono text-xl tracking-[0.2em] font-bold drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]">
                      CALIBRATED
                   </div>
                   
                   <div className="flex gap-1 mt-2">
                      <div className="w-16 h-1 bg-cyan-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
                      <div className="w-8 h-1 bg-cyan-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
                   </div>
                </motion.div>

                {/* 3. The Scanning Line */}
                <motion.div 
                   className="absolute top-0 bottom-0 w-[2px] bg-cyan-400 z-20 shadow-[0_0_40px_3px_rgba(6,182,212,0.6)]"
                   animate={{ left: ["0%", "100%", "100%", "0%"] }}
                   transition={{ 
                      duration: 4, 
                      ease: "easeInOut", 
                      repeat: Infinity,
                      repeatDelay: 1
                   }}
                >
                   <div className="absolute top-0 bottom-0 -left-12 w-24 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent"></div>
                </motion.div>

                {/* 4. Radar Ripples */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                   <motion.div 
                      className="w-32 h-32 rounded-full border border-cyan-500/30"
                      animate={{ scale: [0.8, 2], opacity: [0, 1, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                   />
                   <motion.div 
                      className="w-32 h-32 rounded-full border border-indigo-500/30 absolute"
                      animate={{ scale: [0.8, 2], opacity: [0, 1, 0] }}
                      transition={{ duration: 2, delay: 0.5, repeat: Infinity, ease: "easeOut" }}
                   />
                </div>

             </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};


export const Dashboard: React.FC<DashboardProps> = ({ onSelectProject, onCreateNew }) => {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null); // null = Root
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [viewMode, setViewMode] = useState<'active' | 'archive'>('active');

  const [pendingDeletions, setPendingDeletions] = useState<Record<string, number>>({});
  const [pendingFolderDeletions, setPendingFolderDeletions] = useState<Record<string, number>>({});
  
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  
  // New state for two-step deletion confirmation (replaces window.confirm)
  const [burnConfirmation, setBurnConfirmation] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pList, fList] = await Promise.all([getAllProjects(), getAllFolders()]);
      setProjects(pList);
      setFolders(fList);
    } catch (e) {
      console.error("Failed to load data", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    return () => {
        Object.values(pendingDeletions).forEach(window.clearTimeout);
        Object.values(pendingFolderDeletions).forEach(window.clearTimeout);
    };
  }, []);

  // --- Folder Logic ---

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    const newFolder: Folder = {
        id: crypto.randomUUID(),
        name: newFolderName,
        color: 'indigo',
        icon: 'folder',
        createdAt: Date.now(),
        isArchived: false
    };
    await saveFolder(newFolder);
    setFolders(prev => [newFolder, ...prev]);
    setNewFolderName("");
    setShowNewFolderInput(false);
  };

  const initiateFolderDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (pendingFolderDeletions[id]) window.clearTimeout(pendingFolderDeletions[id]);

    const timeoutId = window.setTimeout(async () => {
       // SOFT DELETE (Archive)
       const folder = folders.find(f => f.id === id);
       if (folder) {
           const updated = { ...folder, isArchived: true };
           await saveFolder(updated);
           setFolders(prev => prev.map(f => f.id === id ? updated : f));
       }
       setPendingFolderDeletions(prev => {
           const next = { ...prev };
           delete next[id];
           return next;
       });
    }, 4000); // 4 seconds

    setPendingFolderDeletions(prev => ({ ...prev, [id]: timeoutId }));
  };

  const undoFolderDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const timeoutId = pendingFolderDeletions[id];
    if (timeoutId) {
      window.clearTimeout(timeoutId);
      setPendingFolderDeletions(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };
  
  const restoreFolder = async (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      const folder = folders.find(f => f.id === id);
      if(folder) {
          const updated = { ...folder, isArchived: false };
          await saveFolder(updated);
          setFolders(prev => prev.map(f => f.id === id ? updated : f));
      }
  };
  
  const handlePermanentDeleteFolder = async (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      
      if (burnConfirmation === id) {
           // Confirmed
           // 1. Eject children
           const children = projects.filter(p => p.folderId === id);
           for (const child of children) {
               await saveProject({ ...child, folderId: undefined });
           }
           // 2. Delete Folder
           await deleteFolder(id);
           setFolders(prev => prev.filter(f => f.id !== id));
           // 3. Update state
           setProjects(prev => prev.map(p => p.folderId === id ? { ...p, folderId: undefined } : p));
           setBurnConfirmation(null);
      } else {
           // Request Confirmation
           setBurnConfirmation(id);
           setTimeout(() => setBurnConfirmation(prev => prev === id ? null : prev), 3000);
      }
  };

  const handleMoveProject = async (projectId: string, targetFolderId: string | undefined) => {
      const project = projects.find(p => p.id === projectId);
      if (project) {
          const updated = { ...project, folderId: targetFolderId };
          await saveProject(updated);
          setProjects(prev => prev.map(p => p.id === projectId ? updated : p));
          setMenuOpen(null);
      }
  };

  // --- Project Logic ---

  const initiateDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (pendingDeletions[id]) window.clearTimeout(pendingDeletions[id]);

    const timeoutId = window.setTimeout(async () => {
      // SOFT DELETE (Archive)
      const project = projects.find(p => p.id === id);
      if (project) {
          const updated = { ...project, isArchived: true };
          await saveProject(updated);
          setProjects(prev => prev.map(p => p.id === id ? updated : p));
      }
      
      setPendingDeletions(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }, 4000);

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

  const restoreProject = async (e: React.MouseEvent, id: string) => {
     e.stopPropagation();
     const project = projects.find(p => p.id === id);
     if (project) {
         const updated = { ...project, isArchived: false };
         await saveProject(updated);
         setProjects(prev => prev.map(p => p.id === id ? updated : p));
     }
  };

  const handlePermanentDeleteProject = async (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      
      if (burnConfirmation === id) {
          // Confirmed
          try {
              await deleteProject(id);
              setProjects(prev => prev.filter(p => p.id !== id));
              setBurnConfirmation(null);
          } catch (error) {
              console.error("Failed to delete project:", error);
          }
      } else {
          // Request Confirmation
          setBurnConfirmation(id);
          setTimeout(() => setBurnConfirmation(prev => prev === id ? null : prev), 3000);
      }
  };

  // --- Filtering ---
  
  const unarchivedProjects = projects.filter(p => !p.isArchived);
  const unarchivedFolders = folders.filter(f => !f.isArchived);
  
  const archivedProjects = projects.filter(p => p.isArchived);
  const archivedFolders = folders.filter(f => f.isArchived);
  
  const displayedProjects = activeFolderId 
    ? unarchivedProjects.filter(p => p.folderId === activeFolderId)
    : unarchivedProjects.filter(p => !p.folderId); 

  const currentFolder = folders.find(f => f.id === activeFolderId);

  return (
    <div className={`flex flex-col h-screen w-full hex-bg text-slate-200 overflow-y-auto scroll-smooth transition-colors duration-500 ${viewMode === 'archive' ? 'grayscale-[0.8] contrast-125' : ''}`}>
      
      {/* Top Navigation */}
      <nav className="w-full glass-panel border-b border-white/5 px-6 py-4 flex justify-between items-center sticky top-0 z-50 shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
                <div className={`${viewMode === 'active' ? 'bg-indigo-600 shadow-indigo-500/20' : 'bg-slate-700 shadow-slate-500/20'} p-1.5 rounded-lg shadow-lg transition-colors`}>
                    <Grid size={20} className="text-white" />
                </div>
                <span className="font-bold text-lg tracking-tight text-white hidden sm:block">Hex Calibrator</span>
            </div>
            
            {/* Breadcrumb */}
            {activeFolderId && viewMode === 'active' && (
                <div className="flex items-center gap-2 text-sm text-slate-400 animate-in fade-in slide-in-from-left-4">
                    <ChevronRight size={16} />
                    <button onClick={() => setActiveFolderId(null)} className="hover:text-white transition-colors">Root</button>
                    <ChevronRight size={16} />
                    <span className="text-white font-medium flex items-center gap-2">
                        <FolderIcon size={14} className="text-indigo-400" />
                        {currentFolder?.name}
                    </span>
                </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
              <button 
                onClick={() => { setViewMode(viewMode === 'active' ? 'archive' : 'active'); setActiveFolderId(null); }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    viewMode === 'archive' 
                    ? 'bg-red-900/40 text-red-200 border border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]' 
                    : 'bg-slate-800 text-slate-400 hover:text-white border border-white/5'
                }`}
              >
                  {viewMode === 'active' ? (
                      <>
                        <Archive size={14} /> The Vault
                      </>
                  ) : (
                      <>
                        <ArrowLeft size={14} /> Back to Dashboard
                      </>
                  )}
              </button>
          </div>
      </nav>

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-12">
        
        {viewMode === 'archive' ? (
            /* --- ARCHIVE VIEW --- */
            <div>
                 <div className="mb-12 text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight mb-2 text-slate-400">The Vault</h1>
                    <p className="text-sm text-slate-600">Where forgotten maps go to rest. Restore them or burn them forever.</p>
                </div>

                {archivedFolders.length === 0 && archivedProjects.length === 0 && (
                    <div className="text-center py-20 text-slate-700">
                        <Archive size={48} className="mx-auto mb-4 opacity-20" />
                        <p>The vault is empty.</p>
                    </div>
                )}
                
                {/* Archived Folders */}
                {archivedFolders.length > 0 && (
                     <div className="mb-8 opacity-75">
                         <h3 className="text-xs font-bold uppercase text-slate-600 mb-4 tracking-wider">Archived Campaigns</h3>
                         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                            {archivedFolders.map(f => (
                                <div key={f.id} className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <FolderIcon size={20} className="text-slate-600" />
                                        <span className="text-slate-400 font-medium">{f.name}</span>
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={(e) => restoreFolder(e, f.id)} title="Restore" className="p-1.5 hover:bg-indigo-500/20 hover:text-indigo-400 rounded"><RefreshCcw size={14}/></button>
                                        <button 
                                            onClick={(e) => handlePermanentDeleteFolder(e, f.id)} 
                                            title="Burn" 
                                            className={`p-1.5 rounded flex items-center gap-1 transition-all ${
                                                burnConfirmation === f.id ? 'bg-red-600 text-white w-auto px-2' : 'hover:bg-red-500/20 hover:text-red-400'
                                            }`}
                                        >
                                            <Flame size={14}/>
                                            {burnConfirmation === f.id && <span className="text-[10px] font-bold">Sure?</span>}
                                        </button>
                                    </div>
                                </div>
                            ))}
                         </div>
                     </div>
                )}
                
                {/* Archived Maps */}
                {archivedProjects.length > 0 && (
                    <div className="opacity-75">
                         <h3 className="text-xs font-bold uppercase text-slate-600 mb-4 tracking-wider">Archived Maps</h3>
                         <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {archivedProjects.map(p => (
                                <div key={p.id} className="relative h-48 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden group">
                                     {/* 1. Image (Bottom Layer) */}
                                     <div className="absolute inset-0 z-0">
                                        {p.imageBlob ? (
                                            <img src={URL.createObjectURL(p.imageBlob)} className="w-full h-full object-cover grayscale opacity-50" alt={p.name} />
                                        ) : (
                                            <div className="w-full h-full bg-slate-800/50 flex items-center justify-center"><MapIcon className="text-slate-700" size={32} /></div>
                                        )}
                                     </div>

                                     {/* 2. Overlay (Middle Layer) */}
                                     <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors z-10 pointer-events-none"></div>

                                     {/* 3. Content (Top Layer) */}
                                     <div className="absolute inset-0 z-20 p-4 flex flex-col justify-between">
                                          <div className="font-bold text-slate-300 drop-shadow-md">{p.name}</div>
                                          <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                             <button 
                                                onClick={(e) => restoreProject(e, p.id)} 
                                                className="px-3 py-1.5 bg-indigo-900/90 text-indigo-200 text-xs font-bold rounded flex items-center gap-1 hover:bg-indigo-800 border border-indigo-500/30 cursor-pointer shadow-lg"
                                             >
                                                <RefreshCcw size={12}/> Restore
                                             </button>
                                             
                                             <button 
                                                onClick={(e) => handlePermanentDeleteProject(e, p.id)} 
                                                className={`px-3 py-1.5 text-xs font-bold rounded flex items-center gap-1 border cursor-pointer shadow-lg transition-all ${
                                                    burnConfirmation === p.id 
                                                    ? 'bg-red-600 text-white border-red-500 hover:bg-red-700 scale-105' 
                                                    : 'bg-red-900/90 text-red-200 border-red-500/30 hover:bg-red-800'
                                                }`}
                                             >
                                                {burnConfirmation === p.id ? <AlertTriangle size={12} /> : <Flame size={12}/>} 
                                                {burnConfirmation === p.id ? 'Sure?' : 'Burn'}
                                             </button>
                                          </div>
                                     </div>
                                </div>
                            ))}
                         </div>
                    </div>
                )}
            </div>
        ) : (
            <>
                {/* --- HERO SECTION (Only on Root) --- */}
                {!activeFolderId && (
                   <HeroSection onCreateNew={() => onCreateNew()} />
                )}

                {/* --- HERO SECTION HEADER (Previous) --- */}
                {!activeFolderId && (
                    <div className="mb-8 border-b border-white/5 pb-4">
                        <h1 className="text-2xl font-bold tracking-tight mb-2 text-white">
                            Command Center
                        </h1>
                        <p className="text-sm text-slate-500 max-w-2xl">
                            Active campaigns and recent operations.
                        </p>
                    </div>
                )}

                {/* --- CAMPAIGN FOLDERS (Only on Root) --- */}
                {!activeFolderId && (
                    <section className="mb-12">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <FolderIcon size={20} className="text-indigo-400" />
                                Campaigns
                            </h2>
                            <button 
                                onClick={() => setShowNewFolderInput(true)}
                                className="text-sm text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
                            >
                                <Plus size={16} /> New Campaign
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {/* Create New Input */}
                            {showNewFolderInput && (
                                <div className="bg-slate-800 p-4 rounded-xl border border-indigo-500/50 shadow-lg animate-in zoom-in-95">
                                    <input 
                                        autoFocus
                                        type="text"
                                        placeholder="Campaign Name..."
                                        className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white mb-2 focus:outline-none focus:border-indigo-500"
                                        value={newFolderName}
                                        onChange={e => setNewFolderName(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleCreateFolder()}
                                    />
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => setShowNewFolderInput(false)} className="text-xs text-slate-400 hover:text-white">Cancel</button>
                                        <button onClick={handleCreateFolder} className="text-xs bg-indigo-600 px-2 py-1 rounded text-white">Create</button>
                                    </div>
                                </div>
                            )}

                            {unarchivedFolders.map(folder => {
                                const isDeleting = !!pendingFolderDeletions[folder.id];
                                return (
                                    <div 
                                        key={folder.id}
                                        onClick={() => !isDeleting && setActiveFolderId(folder.id)}
                                        className={`group relative bg-slate-800/40 hover:bg-slate-800/80 border border-white/5 hover:border-indigo-500/30 p-4 rounded-xl cursor-pointer transition-all duration-200 overflow-hidden min-h-[100px] flex flex-col justify-between
                                            ${isDeleting ? 'border-red-500/50 bg-red-950/20' : ''}
                                        `}
                                    >
                                        {isDeleting ? (
                                            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-900/95">
                                                <div className="w-full h-1 bg-slate-800 absolute bottom-0 left-0">
                                                    <div className="h-full bg-red-500 animate-[width_4s_linear_forwards] w-0"></div>
                                                </div>
                                                
                                                <Trash2 size={24} className="text-red-500 mb-2 animate-bounce" />
                                                <p className="text-xs font-bold text-red-400 mb-2">Archiving...</p>
                                                <button 
                                                    onClick={(e) => undoFolderDelete(e, folder.id)}
                                                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-xs text-white flex items-center gap-1 transition-colors"
                                                >
                                                    <Undo2 size={12} /> Undo
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400 group-hover:text-indigo-300 group-hover:bg-indigo-500/20 transition-colors">
                                                        <FolderIcon size={24} fill="currentColor" fillOpacity={0.2} />
                                                    </div>
                                                    <button 
                                                        onClick={(e) => initiateFolderDelete(e, folder.id)}
                                                        className="p-1 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-slate-200 truncate pr-2" title={folder.name}>{folder.name}</h3>
                                                    <p className="text-xs text-slate-500 mt-1">
                                                        {projects.filter(p => p.folderId === folder.id && !p.isArchived).length} Maps
                                                    </p>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* --- PROJECTS GRID --- */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            {activeFolderId ? (
                                <>
                                    <button onClick={() => setActiveFolderId(null)} className="hover:bg-slate-800 p-1 rounded-full"><ArrowLeft size={20} /></button>
                                    {currentFolder?.name}
                                </>
                            ) : (
                                <>
                                <MapIcon size={20} className="text-slate-400" />
                                Loose Maps
                                </>
                            )}
                        </h2>
                        <button 
                            onClick={() => onCreateNew(activeFolderId || undefined)}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition-all shadow-lg shadow-indigo-500/20"
                        >
                            <Plus size={16} /> New Map
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
                        {/* Empty State */}
                        {displayedProjects.length === 0 && !loading && (
                            <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-800 rounded-2xl bg-slate-900/20">
                                <MapIcon className="mx-auto h-12 w-12 text-slate-600 mb-4" />
                                <h3 className="text-lg font-medium text-slate-300">No maps found here</h3>
                                <p className="text-slate-500 text-sm mt-1">Create a new map to get started.</p>
                            </div>
                        )}

                        {/* Cards */}
                        <AnimatePresence>
                            {displayedProjects.map((p, index) => {
                                const isDeleting = !!pendingDeletions[p.id];
                                const isMenuOpen = menuOpen === p.id;
                                
                                return (
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ delay: index * 0.05 }}
                                        key={p.id}
                                        onClick={() => !isDeleting && onSelectProject(p)}
                                        className={`relative h-64 rounded-2xl glass-panel glass-card-hover transition-all duration-300 group cursor-pointer
                                            ${isDeleting ? 'border-red-500/50 bg-red-950/20' : ''}
                                            ${isMenuOpen ? 'z-50' : 'z-0'}
                                        `}
                                    >
                                        {isDeleting ? (
                                            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 bg-slate-950/90 text-center rounded-2xl overflow-hidden">
                                                {/* VISUAL LOADING BAR AS REQUESTED */}
                                                <div className="w-full h-1 bg-slate-800 absolute bottom-0 left-0">
                                                    <div className="h-full bg-red-500 animate-[width_4s_linear_forwards] w-0"></div>
                                                </div>

                                                <Trash2 size={32} className="text-red-500 mb-4 animate-bounce" />
                                                <p className="text-white font-bold mb-1">Archiving...</p>
                                                <button 
                                                    onClick={(e) => undoDelete(e, p.id)}
                                                    className="px-4 py-2 mt-4 bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold rounded-lg border border-slate-700 flex items-center gap-2 transition-colors"
                                                >
                                                    <Undo2 size={16} /> Undo
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                {/* Context Menu - Moved OUTSIDE overflow-hidden container to allow dropdown to overlay */}
                                                <div className="absolute top-2 right-2 z-50">
                                                    <div className="relative">
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); setMenuOpen(isMenuOpen ? null : p.id); }}
                                                            className="p-1.5 bg-black/50 hover:bg-black/80 text-white rounded-lg backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <MoreHorizontal size={16} />
                                                        </button>
                                                        
                                                        {isMenuOpen && (
                                                            <motion.div 
                                                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                                className="absolute right-0 top-full mt-2 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col origin-top-right" 
                                                                onClick={e => e.stopPropagation()}
                                                            >
                                                                <div className="px-3 py-2 text-[10px] text-slate-500 font-bold uppercase tracking-wider bg-slate-800/50 border-b border-white/5">
                                                                    Move to...
                                                                </div>
                                                                <div className="max-h-48 overflow-y-auto custom-scrollbar p-1">
                                                                    <button 
                                                                        onClick={() => handleMoveProject(p.id, undefined)}
                                                                        className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-indigo-600 hover:text-white rounded-lg flex items-center gap-2 mb-1 transition-colors"
                                                                    >
                                                                        <FileOutput size={14} className="shrink-0" /> 
                                                                        <span className="truncate">Root (Loose)</span>
                                                                    </button>
                                                                    
                                                                    {unarchivedFolders.length > 0 && (
                                                                        <div className="h-px bg-white/10 my-1 mx-2"></div>
                                                                    )}

                                                                    {unarchivedFolders.map(f => (
                                                                        <button 
                                                                            key={f.id}
                                                                            onClick={() => handleMoveProject(p.id, f.id)}
                                                                            className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-indigo-600 hover:text-white rounded-lg flex items-center gap-2 transition-colors"
                                                                        >
                                                                            <FolderIcon size={14} className="shrink-0" /> 
                                                                            <span className="truncate" title={f.name}>{f.name}</span>
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Image Area - Added rounded-t-2xl and overflow-hidden here specifically */}
                                                <div className="h-36 w-full relative bg-slate-900 overflow-hidden rounded-t-2xl">
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
                                                </div>

                                                {/* Content Area - Added rounded-b-2xl */}
                                                <div className="p-4 flex flex-col justify-between h-28 rounded-b-2xl">
                                                    <div>
                                                        <h3 className="font-bold text-base text-slate-100 truncate group-hover:text-indigo-300 transition-colors mb-1">{p.name}</h3>
                                                        <p className="text-xs text-slate-500 font-mono">
                                                            {new Date(p.lastModified).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    
                                                    <div className="flex justify-between items-center mt-2 border-t border-white/5 pt-3">
                                                        <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500 bg-slate-800/50 px-2 py-1 rounded">
                                                            {p.config.radius}px Hex
                                                        </span>
                                                        
                                                        <button 
                                                            onClick={(e) => initiateDelete(e, p.id)}
                                                            className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
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
                </section>
            </>
        )}
      </main>
      
      {/* Click outside to close menu */}
      {menuOpen && <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(null)}></div>}
    </div>
  );
};
