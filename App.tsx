
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Controls } from './components/Controls';
import { HexCanvas } from './components/HexCanvas';
import { Dashboard } from './components/Dashboard';
import { GridConfig, HexState, EditorTool, Viewport, Marker, Asset, ProjectData, NavigationMode, Point, GridType } from './types';
import { saveProject } from './utils/storage';

const INITIAL_CONFIG: GridConfig = {
  type: GridType.HEX_FLAT,
  radius: 40,
  offsetX: 0,
  offsetY: 0,
  rotation: 0,
  lineColor: '#ffffff',
  lineWidth: 2,
  opacity: 0.5,
  showGrid: true,
  showBoundary: true,
  showCoordinates: false,
};

const INITIAL_VIEWPORT: Viewport = { x: 0, y: 0, zoom: 1 };
const INITIAL_IMAGE_ORIGIN: Point = { x: 0, y: 0 };

export default function App() {
  // Navigation State
  const [view, setView] = useState<'dashboard' | 'editor'>('dashboard');
  const [navMode, setNavMode] = useState<NavigationMode>(NavigationMode.VIEW);
  
  // Project State
  const [projectId, setProjectId] = useState<string | null>(null);
  const [folderId, setFolderId] = useState<string | undefined>(undefined);
  const [projectName, setProjectName] = useState("Untitled Project");
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [imageBlob, setImageBlob] = useState<Blob | null>(null); 
  const [imageOrigin, setImageOrigin] = useState<Point>(INITIAL_IMAGE_ORIGIN);
  
  // Tool State
  const [config, setConfig] = useState<GridConfig>(INITIAL_CONFIG);
  const [viewport, setViewport] = useState<Viewport>(INITIAL_VIEWPORT);
  
  // Phase 1: New Tool States
  const [activeTool, setActiveTool] = useState<EditorTool>(EditorTool.MOVE);
  const [activeTerrain, setActiveTerrain] = useState<HexState>(HexState.BLOCKED);
  const [brushSize, setBrushSize] = useState<number>(1);
  const [activeLabel, setActiveLabel] = useState<string>("P1");
  const [activeMarkerColor, setActiveMarkerColor] = useState<string>("#ffffff");
  const [activeAssetType, setActiveAssetType] = useState<string>('chest');
  
  // Data State with History
  const [hexData, setHexData] = useState<Map<string, HexState>>(new Map());
  const [markers, setMarkers] = useState<Map<string, Marker>>(new Map());
  const [assets, setAssets] = useState<Map<string, Asset>>(new Map());
  
  const [history, setHistory] = useState<Map<string, HexState>[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // UI State
  const [saveStatus, setSaveStatus] = useState("Saved");

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const triggerExportRef = useRef<{ exportGridOnly: () => void, exportComposite: () => void } | null>(null);
  const saveTimeoutRef = useRef<number | null>(null);

  // --- Undo/Redo Logic ---
  const pushHistory = useCallback((newData: Map<string, HexState>) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(new Map(newData));
    if (newHistory.length > 20) newHistory.shift();
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);
  
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
        const prevIndex = historyIndex - 1;
        setHexData(new Map(history[prevIndex]));
        setHistoryIndex(prevIndex);
    } else if (historyIndex === 0) {
        setHexData(new Map());
        setHistoryIndex(-1);
    }
  }, [history, historyIndex]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
        const nextIndex = historyIndex + 1;
        setHexData(new Map(history[nextIndex]));
        setHistoryIndex(nextIndex);
    }
  }, [history, historyIndex]);

  // --- Auto-Save Logic ---
  const saveData = useCallback(async () => {
    if (!projectId) return;
    setSaveStatus("Saving...");
    
    const project: ProjectData = {
        id: projectId,
        folderId: folderId,
        name: projectName,
        lastModified: Date.now(),
        imageBlob: imageBlob,
        imageOrigin: imageOrigin,
        config: config,
        hexData: Array.from(hexData.entries()),
        markers: Array.from(markers.entries()),
        assets: Array.from(assets.entries())
    };

    try {
        await saveProject(project);
        setTimeout(() => setSaveStatus("Saved"), 800);
    } catch (e) {
        console.error("Save failed", e);
        setSaveStatus("Error");
    }
  }, [projectId, folderId, projectName, imageBlob, imageOrigin, config, hexData, markers, assets]);

  useEffect(() => {
    if (view !== 'editor') return;
    setSaveStatus("Unsaved");
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = window.setTimeout(() => {
        saveData();
    }, 2000);
    return () => { if(saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current) };
  }, [config, hexData, markers, assets, imageOrigin, saveData, view, projectName]);


  // --- Event Handlers ---

  const handleCreateNew = (targetFolderId?: string) => {
      setProjectId(crypto.randomUUID());
      setFolderId(targetFolderId);
      setProjectName("New Battlemap " + new Date().toLocaleDateString());
      setImage(null);
      setImageBlob(null);
      setImageOrigin(INITIAL_IMAGE_ORIGIN);
      setConfig(INITIAL_CONFIG);
      setHexData(new Map());
      setMarkers(new Map());
      setAssets(new Map());
      setViewport(INITIAL_VIEWPORT);
      setHistory([]);
      setHistoryIndex(-1);
      setView('editor');
      setNavMode(NavigationMode.VIEW);
  };

  const handleSelectProject = (p: ProjectData) => {
      setProjectId(p.id);
      setFolderId(p.folderId);
      setProjectName(p.name);
      setConfig({ ...INITIAL_CONFIG, ...p.config }); // Merge with initial to ensure new properties exist
      setImageOrigin(p.imageOrigin || INITIAL_IMAGE_ORIGIN); // Fallback for old projects
      setHexData(new Map(p.hexData));
      setMarkers(new Map(p.markers));
      setAssets(new Map(p.assets));
      setHistory([new Map(p.hexData)]);
      setHistoryIndex(0);
      
      if (p.imageBlob) {
          setImageBlob(p.imageBlob);
          const img = new Image();
          img.src = URL.createObjectURL(p.imageBlob);
          img.onload = () => setImage(img);
      } else {
          setImage(null);
          setImageBlob(null);
      }
      setView('editor');
      setNavMode(NavigationMode.VIEW);
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageBlob(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          setImage(img);
          setImageOrigin({ x: 0, y: 0 }); // Reset origin on new image
          
          const margin = 0.9;
          const fitX = window.innerWidth / img.width;
          const fitY = window.innerHeight / img.height;
          const initialZoom = Math.min(fitX, fitY, 1) * margin; 
          
          const startX = (window.innerWidth - img.width * initialZoom) / 2;
          const startY = (window.innerHeight - img.height * initialZoom) / 2;
          
          setViewport({ x: startX, y: startY, zoom: initialZoom });
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownload = (gridOnly: boolean) => {
    if (!triggerExportRef.current) return;
    gridOnly ? triggerExportRef.current.exportGridOnly() : triggerExportRef.current.exportComposite();
  };

  if (view === 'dashboard') {
      return <Dashboard onSelectProject={handleSelectProject} onCreateNew={handleCreateNew} />;
  }

  return (
    <div className="fixed inset-0 overflow-hidden font-sans bg-slate-950 text-slate-200">
      
      <Controls 
          config={config} setConfig={setConfig} 
          viewport={viewport} setViewport={setViewport}
          navMode={navMode} setNavMode={setNavMode}
          onUpload={handleUpload}
          onDownload={handleDownload}
          onExit={() => { saveData().then(() => setView('dashboard')); }}
          hasImage={!!image}
          imageDimensions={image ? { width: image.width, height: image.height } : undefined}
          activeTool={activeTool} setActiveTool={setActiveTool}
          activeLabel={activeLabel} setActiveLabel={setActiveLabel}
          activeAssetType={activeAssetType} setActiveAssetType={setActiveAssetType}
          saveStatus={saveStatus}
          canUndo={historyIndex > -1}
          canRedo={historyIndex < history.length - 1}
          onUndo={handleUndo}
          onRedo={handleRedo}
          // New Props
          activeTerrain={activeTerrain} setActiveTerrain={setActiveTerrain}
          brushSize={brushSize} setBrushSize={setBrushSize}
          activeMarkerColor={activeMarkerColor} setActiveMarkerColor={setActiveMarkerColor}
          projectName={projectName} setProjectName={setProjectName}
        />

         <HexCanvas 
            image={image}
            config={config} setConfig={setConfig}
            viewport={viewport} setViewport={setViewport}
            imageOrigin={imageOrigin} setImageOrigin={setImageOrigin}
            hexData={hexData} setHexData={setHexData}
            markers={markers} setMarkers={setMarkers}
            assets={assets} setAssets={setAssets}
            canvasRef={canvasRef}
            activeTool={activeTool}
            navMode={navMode}
            activeLabel={activeLabel}
            activeAssetType={activeAssetType}
            exportRef={triggerExportRef}
            onDataChange={pushHistory} 
            // New Props
            activeTerrain={activeTerrain}
            brushSize={brushSize}
            activeMarkerColor={activeMarkerColor}
         />
    </div>
  );
}
