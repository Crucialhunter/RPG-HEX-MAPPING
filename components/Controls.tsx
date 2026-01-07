import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Move, Paintbrush, Eraser, MapPin, Box, Ruler, 
  Settings, Download, Upload, ArrowLeft, CheckCircle2, 
  RotateCcw, RotateCw, Loader2, Eye, EyeOff, X, Palette,
  Grid as GridIcon, Image as ImageIcon, Hand, Crosshair,
  ShieldAlert, Tent, Swords, Gem, Castle
} from 'lucide-react';
import { GridConfig, EditorTool, Viewport, Asset, NavigationMode, ASSET_LIBRARY, AssetCategory } from '../types';

interface ControlsProps {
  config: GridConfig;
  setConfig: React.Dispatch<React.SetStateAction<GridConfig>>;
  viewport: Viewport;
  setViewport: React.Dispatch<React.SetStateAction<Viewport>>;
  navMode: NavigationMode;
  setNavMode: React.Dispatch<React.SetStateAction<NavigationMode>>;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDownload: (gridOnly: boolean) => void;
  onExit: () => void;
  hasImage: boolean;
  imageDimensions?: { width: number, height: number };
  activeTool: EditorTool;
  setActiveTool: React.Dispatch<React.SetStateAction<EditorTool>>;
  activeLabel: string;
  setActiveLabel: React.Dispatch<React.SetStateAction<string>>;
  activeAssetType: string;
  setActiveAssetType: React.Dispatch<React.SetStateAction<string>>;
  saveStatus: string;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

// --- SUB-COMPONENTS ---

interface ToolButtonProps {
  icon: React.ElementType;
  isActive: boolean;
  onClick: () => void;
  label: string;
}

const ToolButton: React.FC<ToolButtonProps> = ({ 
  icon: Icon, 
  isActive, 
  onClick, 
  label 
}) => (
  <motion.button
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`group relative p-3 rounded-xl transition-all duration-200 ${
      isActive 
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/40 ring-1 ring-white/20' 
        : 'bg-transparent text-slate-400 hover:bg-slate-800 hover:text-white'
    }`}
  >
    <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
    {/* Tooltip */}
    <span className="absolute left-full ml-4 top-1/2 -translate-y-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl border border-white/10 hidden md:block">
      {label}
    </span>
  </motion.button>
);

const FloatingPanel = ({ children, className = "" }: { children?: React.ReactNode, className?: string }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className={`bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-4 ${className}`}
  >
    {children}
  </motion.div>
);

// --- MAIN LAYOUT ---

export const Controls: React.FC<ControlsProps> = ({
  config, setConfig,
  viewport, setViewport,
  navMode, setNavMode,
  onUpload, onDownload, onExit,
  hasImage, imageDimensions,
  activeTool, setActiveTool,
  activeLabel, setActiveLabel,
  activeAssetType, setActiveAssetType,
  saveStatus, canUndo, canRedo, onUndo, onRedo
}) => {
  const [zenMode, setZenMode] = useState(false);
  const [showGridSettings, setShowGridSettings] = useState(false);
  const [assetCategory, setAssetCategory] = useState<AssetCategory>('structure');

  // Tools list
  const tools = [
    { id: EditorTool.PAINT, icon: Paintbrush, label: "Paint Terrain" },
    { id: EditorTool.ERASE, icon: Eraser, label: "Erase Hex" },
    { id: EditorTool.LABEL, icon: MapPin, label: "Markers" },
    { id: EditorTool.ASSET, icon: Box, label: "Assets" },
    { id: EditorTool.RULER, icon: Ruler, label: "Measure Distance" },
  ];

  const handleChange = <K extends keyof GridConfig>(key: K, value: GridConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  // Filter assets by category
  const filteredAssets = useMemo(() => {
    return Object.values(ASSET_LIBRARY).filter(a => a.category === assetCategory);
  }, [assetCategory]);

  // Mini-map calculations
  const minimapSize = 120;
  const mapAspect = imageDimensions ? imageDimensions.width / imageDimensions.height : 1;
  const mmW = mapAspect >= 1 ? minimapSize : minimapSize * mapAspect;
  const mmH = mapAspect >= 1 ? minimapSize / mapAspect : minimapSize;

  const vpRectW = imageDimensions ? (window.innerWidth / viewport.zoom) / imageDimensions.width * mmW : 0;
  const vpRectH = imageDimensions ? (window.innerHeight / viewport.zoom) / imageDimensions.height * mmH : 0;
  const vpRectX = imageDimensions ? (-viewport.x / viewport.zoom) / imageDimensions.width * mmW : 0;
  const vpRectY = imageDimensions ? (-viewport.y / viewport.zoom) / imageDimensions.height * mmH : 0;

  return (
    <>
      <AnimatePresence>
        {!zenMode && (
          <>
            {/* --- TOP BAR --- */}
            <motion.div 
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              className="fixed top-0 left-0 right-0 h-16 px-6 flex items-center justify-between pointer-events-none z-50"
            >
              <div className="flex items-center gap-4 pointer-events-auto">
                <button 
                  onClick={onExit}
                  className="p-2 rounded-full bg-slate-900/50 backdrop-blur border border-white/10 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <ArrowLeft size={20} />
                </button>
                <div className="flex items-center gap-2 bg-slate-900/50 backdrop-blur border border-white/10 px-3 py-1.5 rounded-full">
                  {saveStatus === "Saved" ? (
                    <CheckCircle2 size={16} className="text-emerald-400" />
                  ) : saveStatus === "Saving..." ? (
                    <Loader2 size={16} className="text-indigo-400 animate-spin" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-amber-400" />
                  )}
                  <span className="text-xs font-medium text-slate-300">{saveStatus}</span>
                </div>
              </div>

              {/* CENTER: Navigation Mode Selector */}
              <div className="pointer-events-auto absolute left-1/2 top-4 -translate-x-1/2">
                <div className="flex bg-slate-900/80 backdrop-blur-md border border-white/10 p-1 rounded-xl shadow-2xl">
                    <button 
                        onClick={() => { setNavMode(NavigationMode.VIEW); setActiveTool(EditorTool.MOVE); }}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all ${navMode === NavigationMode.VIEW ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                        <Hand size={16} /> <span className="hidden sm:inline">View</span>
                    </button>
                    <button 
                        onClick={() => setNavMode(NavigationMode.GRID)}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all ${navMode === NavigationMode.GRID ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                        <GridIcon size={16} /> <span className="hidden sm:inline">Grid</span>
                    </button>
                    <button 
                        onClick={() => setNavMode(NavigationMode.IMAGE)}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all ${navMode === NavigationMode.IMAGE ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                        <ImageIcon size={16} /> <span className="hidden sm:inline">Image</span>
                    </button>
                </div>
                {/* Instruction Tag */}
                <div className="text-center mt-2">
                    <span className="inline-block px-2 py-0.5 bg-black/60 rounded text-[10px] text-indigo-300 font-mono">
                        {navMode === NavigationMode.VIEW && "Drag to Pan • Scroll to Zoom"}
                        {navMode === NavigationMode.GRID && "Drag to Move Grid • Scroll to Rotate"}
                        {navMode === NavigationMode.IMAGE && "Drag to Move Image • Scroll to Zoom"}
                    </span>
                </div>
              </div>

              <div className="flex items-center gap-2 pointer-events-auto">
                <div className="flex gap-1 bg-slate-900/50 backdrop-blur border border-white/10 p-1 rounded-xl mr-4">
                  <button onClick={onUndo} disabled={!canUndo} className="p-2 text-slate-400 hover:text-white disabled:opacity-30 transition-colors">
                    <RotateCcw size={18} />
                  </button>
                  <button onClick={onRedo} disabled={!canRedo} className="p-2 text-slate-400 hover:text-white disabled:opacity-30 transition-colors">
                    <RotateCw size={18} />
                  </button>
                </div>

                <button 
                  onClick={() => setZenMode(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-lg shadow-indigo-500/20 font-medium text-sm transition-all"
                >
                  <EyeOff size={16} /> Zen Mode
                </button>
              </div>
            </motion.div>

            {/* --- LEFT TOOLBAR (Desktop) --- */}
            <motion.div 
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              className="hidden md:flex fixed left-6 top-1/2 -translate-y-1/2 flex-col gap-3 z-40 pointer-events-auto"
            >
              <FloatingPanel className="flex flex-col gap-2 p-2">
                {tools.map(tool => (
                  <ToolButton 
                    key={tool.id} 
                    icon={tool.icon} 
                    isActive={activeTool === tool.id && navMode === NavigationMode.VIEW}
                    onClick={() => {
                        setActiveTool(tool.id);
                        setNavMode(NavigationMode.VIEW);
                    }}
                    label={tool.label}
                  />
                ))}
              </FloatingPanel>

              {/* View Controls */}
              <FloatingPanel className="flex flex-col gap-2 p-2 mt-2">
                 <button onClick={() => setViewport(prev => ({...prev, zoom: Math.min(prev.zoom + 0.1, 5)}))} className="p-2 text-slate-400 hover:text-white text-xs font-mono">+</button>
                 <button onClick={() => setViewport({x:0, y:0, zoom: 1})} className="p-2 text-slate-400 hover:text-white text-xs font-mono">1:1</button>
                 <button onClick={() => setViewport(prev => ({...prev, zoom: Math.max(prev.zoom - 0.1, 0.1)}))} className="p-2 text-slate-400 hover:text-white text-xs font-mono">-</button>
              </FloatingPanel>
            </motion.div>

            {/* --- RIGHT PROPERTIES PANEL --- */}
            <motion.div 
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 50, opacity: 0 }}
              className="fixed right-6 top-24 bottom-24 w-72 flex flex-col gap-4 pointer-events-none z-40"
            >
              <div className="pointer-events-auto space-y-4">
                 {/* Manipulation Mode Context Panel */}
                 {(navMode === NavigationMode.GRID || navMode === NavigationMode.IMAGE) && (
                     <FloatingPanel className="border-indigo-500/50">
                        <div className="flex items-center gap-2 mb-4 text-indigo-400">
                             {navMode === NavigationMode.GRID ? <GridIcon size={18} /> : <ImageIcon size={18} />}
                             <h3 className="text-sm font-bold uppercase tracking-wider">
                                {navMode === NavigationMode.GRID ? "Grid Calibration" : "Image Alignment"}
                             </h3>
                        </div>
                        
                        {navMode === NavigationMode.GRID && (
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-xs mb-1 text-slate-400"><span>Rotation</span> <span>{config.rotation.toFixed(1)}°</span></div>
                                    <input 
                                        type="range" min="-180" max="180" step="0.5"
                                        value={config.rotation} 
                                        onChange={(e) => handleChange('rotation', Number(e.target.value))} 
                                        className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500" 
                                    />
                                    <div className="flex justify-between mt-1">
                                        <button onClick={() => handleChange('rotation', 0)} className="text-[10px] text-slate-500 hover:text-white">Reset 0°</button>
                                        <button onClick={() => handleChange('rotation', config.rotation + 90)} className="text-[10px] text-slate-500 hover:text-white">+90°</button>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs mb-1 text-slate-400"><span>Grid Size</span> <span>{config.radius}px</span></div>
                                    <input 
                                        type="range" min="10" max="150" 
                                        value={config.radius} 
                                        onChange={(e) => handleChange('radius', Number(e.target.value))} 
                                        className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500" 
                                    />
                                </div>
                            </div>
                        )}
                        {navMode === NavigationMode.IMAGE && (
                            <div className="text-xs text-slate-400 bg-slate-800 p-2 rounded">
                                Dragging moves the background image. 
                            </div>
                        )}
                     </FloatingPanel>
                 )}

                 <FloatingPanel>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          {navMode === NavigationMode.VIEW 
                             ? (tools.find(t => t.id === activeTool)?.label || "View Mode") 
                             : "Editor Settings"}
                        </h3>
                        {navMode === NavigationMode.VIEW && (
                            <button 
                                onClick={() => setShowGridSettings(!showGridSettings)}
                                className={`p-1.5 rounded transition-colors ${showGridSettings ? 'bg-indigo-500 text-white' : 'hover:bg-slate-800 text-slate-400'}`}
                            >
                            <Settings size={14} />
                            </button>
                        )}
                    </div>

                    {/* Tool Specific Controls */}
                    {navMode === NavigationMode.VIEW && (
                        <div className="space-y-4">
                        {(activeTool === EditorTool.PAINT || activeTool === EditorTool.ERASE) && (
                            <div>
                                <div className="flex gap-2 mb-2">
                                <div className="h-8 w-8 bg-red-500/50 rounded ring-1 ring-white/10 cursor-pointer hover:scale-110 transition-transform" onClick={() => {}} title="Blocked"></div>
                                <div className="h-8 w-8 bg-yellow-500/50 rounded ring-1 ring-white/10 cursor-pointer hover:scale-110 transition-transform" title="Difficult"></div>
                                <div className="h-8 w-8 bg-blue-500/50 rounded ring-1 ring-white/10 cursor-pointer hover:scale-110 transition-transform" title="Water"></div>
                                </div>
                            </div>
                        )}

                        {activeTool === EditorTool.LABEL && (
                            <div>
                            <label className="text-xs text-slate-400 mb-1 block">Marker Label</label>
                            <input 
                                type="text" 
                                value={activeLabel} 
                                onChange={(e) => setActiveLabel(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none transition-colors"
                                maxLength={3}
                            />
                            </div>
                        )}

                        {activeTool === EditorTool.ASSET && (
                            <div className="flex flex-col gap-2">
                                <label className="text-xs text-slate-400 mb-1 block">Asset Type</label>
                                
                                {/* Category Tabs */}
                                <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-none">
                                    <button onClick={() => setAssetCategory('structure')} className={`p-1.5 rounded ${assetCategory === 'structure' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`} title="Structures"><Castle size={14} /></button>
                                    <button onClick={() => setAssetCategory('hazard')} className={`p-1.5 rounded ${assetCategory === 'hazard' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`} title="Hazards"><ShieldAlert size={14} /></button>
                                    <button onClick={() => setAssetCategory('loot')} className={`p-1.5 rounded ${assetCategory === 'loot' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`} title="Loot"><Gem size={14} /></button>
                                    <button onClick={() => setAssetCategory('entity')} className={`p-1.5 rounded ${assetCategory === 'entity' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`} title="Entities"><Swords size={14} /></button>
                                    <button onClick={() => setAssetCategory('nature')} className={`p-1.5 rounded ${assetCategory === 'nature' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`} title="Nature"><Tent size={14} /></button>
                                </div>

                                {/* Asset Grid */}
                                <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1 pr-2">
                                {filteredAssets.map(def => (
                                    <button
                                    key={def.id}
                                    onClick={() => setActiveAssetType(def.id)}
                                    title={def.label}
                                    className={`aspect-square rounded flex items-center justify-center text-xl border transition-all relative group
                                        ${activeAssetType === def.id 
                                            ? 'bg-indigo-500/20 border-indigo-500 scale-105 shadow-[0_0_10px_rgba(99,102,241,0.3)]' 
                                            : 'bg-slate-800 border-transparent hover:border-slate-600 hover:scale-105'
                                        }`}
                                    >
                                        <span style={{ textShadow: `0 0 10px ${def.color}` }}>{def.icon}</span>
                                    </button>
                                ))}
                                </div>
                                <div className="text-xs text-center text-slate-500 mt-1 italic">
                                   {filteredAssets.length} items
                                </div>
                            </div>
                        )}
                        </div>
                    )}
                 </FloatingPanel>
                 
                 {/* Advanced Grid Settings Popover */}
                 <AnimatePresence>
                    {(showGridSettings || navMode === NavigationMode.GRID) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                         <FloatingPanel className="mt-2 space-y-4 border-indigo-500/30">
                            {navMode === NavigationMode.VIEW && <h4 className="text-xs font-bold text-indigo-400 uppercase">Appearance</h4>}
                             <div className="flex gap-2">
                                <div className="flex-1">
                                   <label className="text-xs text-slate-400 block mb-1">Color</label>
                                   <div className="flex items-center gap-2 bg-slate-950 p-1 rounded border border-slate-700">
                                      <input type="color" value={config.lineColor} onChange={(e) => handleChange('lineColor', e.target.value)} className="w-6 h-6 rounded cursor-pointer bg-transparent border-none" />
                                   </div>
                                </div>
                                <div className="flex-1">
                                   <label className="text-xs text-slate-400 block mb-1">Opacity</label>
                                   <input type="range" min="0" max="1" step="0.1" value={config.opacity} onChange={(e) => handleChange('opacity', Number(e.target.value))} className="w-full h-6 bg-transparent cursor-pointer accent-indigo-500" />
                                </div>
                             </div>
                             <div className="grid grid-cols-2 gap-2 text-xs">
                                <button onClick={() => handleChange('showGrid', !config.showGrid)} className={`p-2 rounded border ${config.showGrid ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300' : 'border-slate-700 text-slate-500'}`}>Show Grid</button>
                                <button onClick={() => handleChange('showCoordinates', !config.showCoordinates)} className={`p-2 rounded border ${config.showCoordinates ? 'bg-pink-500/20 border-pink-500 text-pink-300' : 'border-slate-700 text-slate-500'}`}>Coords</button>
                             </div>
                         </FloatingPanel>
                      </motion.div>
                    )}
                 </AnimatePresence>
              </div>

              <div className="flex-1"></div>

              {/* Navigator */}
              <div className="pointer-events-auto hidden md:block self-end">
                {hasImage && imageDimensions && (
                   <FloatingPanel className="p-2 w-max">
                      <div className="relative bg-slate-800 border border-slate-700 shadow-inner overflow-hidden" style={{ width: mmW, height: mmH }}>
                          <div className="absolute inset-0 opacity-30 bg-cover bg-center" style={{ backgroundColor: '#334155' }}></div>
                          <div 
                             className="absolute border-2 border-indigo-400 bg-indigo-500/10 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                             style={{
                                width: vpRectW,
                                height: vpRectH,
                                left: vpRectX,
                                top: vpRectY
                             }}
                          />
                      </div>
                   </FloatingPanel>
                )}
              </div>

              {/* Export Actions */}
              <FloatingPanel className="pointer-events-auto">
                 <div className="flex gap-2">
                    <button onClick={() => onDownload(false)} className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-1">
                       <Download size={14} /> Full Export
                    </button>
                    <button onClick={() => onDownload(true)} className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1">
                       <GridIcon size={14} /> Grid Only
                    </button>
                 </div>
                 {!hasImage && (
                    <label className="mt-2 block w-full py-2 border border-dashed border-slate-600 text-slate-400 text-xs text-center rounded-lg hover:border-indigo-500 hover:text-indigo-400 cursor-pointer transition-colors">
                       <Upload size={14} className="inline mr-1" /> Change Map
                       <input type="file" className="hidden" accept="image/*" onChange={onUpload} />
                    </label>
                 )}
              </FloatingPanel>
            </motion.div>
          </>
        )}

        {zenMode && (
          <motion.button 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            onClick={() => setZenMode(false)}
            className="fixed top-4 right-4 z-50 p-3 bg-slate-900/50 backdrop-blur rounded-full text-slate-500 hover:text-white border border-white/10"
          >
             <Eye size={20} />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
};