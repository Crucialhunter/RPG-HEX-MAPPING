
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { GridConfig, HexState, EditorTool, getHexKey, parseHexKey, Viewport, Marker, Asset, NavigationMode, Point, ASSET_LIBRARY } from '../types';
import { screenToWorld } from '../utils/hexMath'; // Still used for screenToWorld projection
import { GridSystem } from '../utils/gridSystem';

interface HexCanvasProps {
  image: HTMLImageElement | null;
  config: GridConfig;
  setConfig: React.Dispatch<React.SetStateAction<GridConfig>>;
  viewport: Viewport;
  setViewport: React.Dispatch<React.SetStateAction<Viewport>>;
  imageOrigin: Point;
  setImageOrigin: React.Dispatch<React.SetStateAction<Point>>;
  hexData: Map<string, HexState>;
  setHexData: React.Dispatch<React.SetStateAction<Map<string, HexState>>>;
  markers: Map<string, Marker>;
  setMarkers: React.Dispatch<React.SetStateAction<Map<string, Marker>>>;
  assets: Map<string, Asset>;
  setAssets: React.Dispatch<React.SetStateAction<Map<string, Asset>>>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  activeTool: EditorTool;
  navMode: NavigationMode;
  activeLabel: string;
  activeAssetType: string;
  exportRef: React.MutableRefObject<{ exportGridOnly: () => void, exportComposite: () => void } | null>;
  onDataChange?: (data: Map<string, HexState>) => void;
  // Phase 1 New Props
  activeTerrain: HexState;
  brushSize: number;
  activeMarkerColor: string;
}

export const HexCanvas: React.FC<HexCanvasProps> = ({
  image,
  config,
  setConfig,
  viewport,
  setViewport,
  imageOrigin,
  setImageOrigin,
  hexData,
  setHexData,
  markers,
  setMarkers,
  assets,
  setAssets,
  canvasRef: externalGridRef,
  activeTool,
  navMode,
  activeLabel,
  activeAssetType,
  exportRef,
  onDataChange,
  activeTerrain,
  brushSize,
  activeMarkerColor
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapCanvasRef = useRef<HTMLCanvasElement>(null);
  
  const [hoverHex, setHoverHex] = useState<string | null>(null);
  
  // Interaction State
  const dragRef = useRef<{ startX: number; startY: number; type: 'pan' | 'grid' | 'image' | 'tool' } | null>(null);
  
  const [rulerStart, setRulerStart] = useState<{q: number, r: number} | null>(null);
  const [rulerCurrent, setRulerCurrent] = useState<{q: number, r: number} | null>(null);

  // --- 1. Static Layer: Map Image ---
  useEffect(() => {
    const canvas = mapCanvasRef.current;
    if (!canvas) return;

    if (image) {
        canvas.width = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(image, 0, 0);
        }
    } else {
        canvas.width = 1;
        canvas.height = 1;
    }
  }, [image]);

  // --- 2. Dynamic Layer: Grid & UI ---
  const drawPolyPath = (ctx: CanvasRenderingContext2D, center: Point, coord: {q: number, r: number}) => {
    const corners = GridSystem.getCorners(center, config.radius, config.rotation, config, coord); 
    ctx.beginPath();
    ctx.moveTo(corners[0].x, corners[0].y);
    for (let i = 1; i < corners.length; i++) {
      ctx.lineTo(corners[i].x, corners[i].y);
    }
    ctx.closePath();
  };

  // Phase 2: SVG Path Rendering
  const drawAsset = (ctx: CanvasRenderingContext2D, x: number, y: number, typeId: string, radius: number) => {
      const assetDef = ASSET_LIBRARY[typeId];
      if (!assetDef) return;

      const size = radius * 1.5; 
      const scale = (size / 24) * (assetDef.scale || 1); // Base SVG is 24x24
      
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);
      ctx.translate(-12, -12); // Center the 24x24 icon

      // Glow / Shadow
      ctx.shadowColor = assetDef.color;
      ctx.shadowBlur = 10;
      ctx.strokeStyle = assetDef.color;
      ctx.lineWidth = 2;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      
      const p = new Path2D(assetDef.path);
      ctx.stroke(p);

      // Highlighting inner
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(255,255,255,0.8)';
      ctx.stroke(p);
      
      ctx.restore();
  };

  const drawGridLayer = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, isExport = false) => {
    // Clear
    if (!isExport) {
        ctx.setTransform(1, 0, 0, 1, 0, 0); 
        ctx.clearRect(0, 0, width, height);
        
        // Apply Camera Transform
        ctx.setTransform(viewport.zoom, 0, 0, viewport.zoom, viewport.x, viewport.y);
    }

    if (!config.showGrid && !isExport) return;

    const { radius, lineColor, lineWidth, opacity } = config;
    
    // Bounds Calculation
    if (image || hexData.size > 0) {
        ctx.globalAlpha = opacity;
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = lineWidth;
        ctx.lineJoin = 'round';
        
        const refWidth = image ? image.width : width / viewport.zoom;
        const refHeight = image ? image.height : height / viewport.zoom;
        const centerX = image ? (imageOrigin.x + refWidth/2) : (width/2 - viewport.x)/viewport.zoom;
        const centerY = image ? (imageOrigin.y + refHeight/2) : (height/2 - viewport.y)/viewport.zoom;

        const centerCell = GridSystem.getGridCoordinates(centerX, centerY, config);
        // Approximate range based on size. Hex/Square/Tri have different densities.
        const range = Math.ceil(Math.max(refWidth, refHeight) / radius) + 5;
        
        ctx.beginPath();
        
        // Generic Loop that works for all grids (bounding box iteration)
        const rangeList = GridSystem.getNeighbors(centerCell, range, config);

        rangeList.forEach(cell => {
            const key = getHexKey(cell.q, cell.r);
            if (hexData.get(key) === HexState.HIDDEN) return;

            const center = GridSystem.getPixelCoordinates(cell.q, cell.r, config);
            const corners = GridSystem.getCorners(center, radius, config.rotation, config, cell);
            
            ctx.moveTo(corners[0].x, corners[0].y);
            for(let i=1; i<corners.length; i++) ctx.lineTo(corners[i].x, corners[i].y);
            ctx.lineTo(corners[0].x, corners[0].y);
        });
        
        ctx.stroke();
    }
    ctx.globalAlpha = 1.0;

    // B. Terrain Fills
    hexData.forEach((state, key) => {
        if (state === HexState.HIDDEN || state === HexState.EMPTY) return;
        const { q, r } = parseHexKey(key);
        const center = GridSystem.getPixelCoordinates(q, r, config);
        
        drawPolyPath(ctx, center, {q,r});
        
        if (state === HexState.BLOCKED) {
            ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
            ctx.fill();
        } else if (state === HexState.DIFFICULT) {
            ctx.fillStyle = 'rgba(234, 179, 8, 0.4)';
            ctx.fill();
        } else if (state === HexState.WATER) {
            ctx.fillStyle = 'rgba(59, 130, 246, 0.4)';
            ctx.fill();
        }
    });

    // C. Coordinates
    if (config.showCoordinates) {
        const refWidth = image ? image.width : width / viewport.zoom;
        const refHeight = image ? image.height : height / viewport.zoom;
        const centerX = image ? (imageOrigin.x + refWidth/2) : (width/2 - viewport.x)/viewport.zoom;
        const centerY = image ? (imageOrigin.y + refHeight/2) : (height/2 - viewport.y)/viewport.zoom;
        const centerCell = GridSystem.getGridCoordinates(centerX, centerY, config);
        
        // Limit coordinates drawing to a smaller view area for performance
        const range = 15; 
        const visibleCells = GridSystem.getNeighbors(centerCell, range, config);

        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.font = `${radius * 0.4}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        visibleCells.forEach(cell => {
             const key = getHexKey(cell.q, cell.r);
             if (hexData.get(key) === HexState.HIDDEN) return;
             const center = GridSystem.getPixelCoordinates(cell.q, cell.r, config);
             ctx.fillText(`${cell.q},${cell.r}`, center.x, center.y);
        });
    }

    // D. Assets & Markers
    assets.forEach((asset, key) => {
        if (hexData.get(key) === HexState.HIDDEN) return;
        const { q, r } = parseHexKey(key);
        const center = GridSystem.getPixelCoordinates(q, r, config);
        drawAsset(ctx, center.x, center.y, asset.type, radius);
    });

    markers.forEach((marker, key) => {
        if (hexData.get(key) === HexState.HIDDEN) return;
        const { q, r } = parseHexKey(key);
        const center = GridSystem.getPixelCoordinates(q, r, config);
        
        ctx.fillStyle = "rgba(0,0,0,0.8)";
        ctx.beginPath();
        ctx.arc(center.x, center.y - radius/2, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#fff";
        ctx.stroke();

        ctx.fillStyle = marker.color || '#fff';
        ctx.font = 'bold 16px "MedievalSharp", cursive';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(marker.text, center.x, center.y - radius/2 + 2); 
    });

    // E. Tool Previews
    if (!isExport && hoverHex) {
         const isToolMode = navMode === NavigationMode.VIEW;
         
         if (isToolMode) {
            const centerCell = parseHexKey(hoverHex);
            
            // Phase 1: Brush Size Logic for Preview - Now uses GridSystem
            let targets = [centerCell];
            if ((activeTool === EditorTool.PAINT || activeTool === EditorTool.ERASE) && brushSize > 1) {
                targets = GridSystem.getNeighbors(centerCell, brushSize - 1, config);
            }
            
            ctx.lineWidth = 3;
            if (activeTool === EditorTool.ERASE) ctx.strokeStyle = '#ef4444';
            else if (activeTool === EditorTool.LABEL) ctx.strokeStyle = '#22c55e';
            else if (activeTool === EditorTool.ASSET) ctx.strokeStyle = '#d97706';
            else if (activeTool === EditorTool.PAINT) {
                // Color match preview
                 if (activeTerrain === HexState.BLOCKED) ctx.strokeStyle = '#ef4444';
                 else if (activeTerrain === HexState.DIFFICULT) ctx.strokeStyle = '#eab308';
                 else if (activeTerrain === HexState.WATER) ctx.strokeStyle = '#3b82f6';
                 else ctx.strokeStyle = '#64748b'; // Clear
            }
            else if (activeTool === EditorTool.RULER) ctx.strokeStyle = '#ec4899';
            else ctx.strokeStyle = '#fff';

            // Draw all target cells in the brush
            targets.forEach(cell => {
                const center = GridSystem.getPixelCoordinates(cell.q, cell.r, config);
                drawPolyPath(ctx, center, cell);
                ctx.stroke();
            });
         }
    }

    // F. Ruler
    if (!isExport && rulerStart && rulerCurrent) {
       const startPx = GridSystem.getPixelCoordinates(rulerStart.q, rulerStart.r, config);
       const endPx = GridSystem.getPixelCoordinates(rulerCurrent.q, rulerCurrent.r, config);
       
       ctx.beginPath();
       ctx.moveTo(startPx.x, startPx.y);
       ctx.lineTo(endPx.x, endPx.y);
       ctx.lineWidth = 4;
       ctx.strokeStyle = '#ec4899';
       ctx.setLineDash([10, 5]);
       ctx.stroke();
       ctx.setLineDash([]);

       ctx.fillStyle = '#ec4899';
       ctx.beginPath();
       ctx.arc(startPx.x, startPx.y, 6, 0, Math.PI*2);
       ctx.arc(endPx.x, endPx.y, 6, 0, Math.PI*2);
       ctx.fill();

       const distUnits = GridSystem.getDistance(rulerStart, rulerCurrent, config);
       const distFeet = distUnits * 5; 
       
       const midX = (startPx.x + endPx.x) / 2;
       const midY = (startPx.y + endPx.y) / 2;
       
       ctx.save();
       ctx.translate(midX, midY - 20);
       const inverseScale = 1 / viewport.zoom;
       ctx.scale(inverseScale, inverseScale); 
       
       ctx.fillStyle = 'rgba(0,0,0,0.8)';
       ctx.beginPath();
       ctx.roundRect(-60, -18, 120, 36, 8);
       ctx.fill();
       
       ctx.fillStyle = 'white';
       ctx.font = 'bold 14px sans-serif';
       ctx.textAlign = 'center';
       ctx.textBaseline = 'middle';
       ctx.fillText(`${distUnits.toFixed(1)} Units / ${distFeet.toFixed(1)}ft`, 0, 0);
       ctx.restore();
    }

  }, [image, config, hexData, assets, markers, hoverHex, activeTool, rulerStart, rulerCurrent, viewport, imageOrigin, navMode, activeTerrain, brushSize]);

  // --- Animation Loop ---
  useEffect(() => {
    let animId: number;
    const render = () => {
      const canvas = externalGridRef.current;
      if (canvas && containerRef.current) {
         const width = containerRef.current.clientWidth;
         const height = containerRef.current.clientHeight;
         if (canvas.width !== width || canvas.height !== height) {
            canvas.width = width;
            canvas.height = height;
         }
         const ctx = canvas.getContext('2d');
         if (ctx) {
            drawGridLayer(ctx, width, height, false);
         }
      }
      animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
  }, [drawGridLayer, externalGridRef]);


  // --- Exports ---
  useEffect(() => {
      exportRef.current = {
          exportGridOnly: () => {
            if (!image) return;
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = image.width;
            tempCanvas.height = image.height;
            const ctx = tempCanvas.getContext('2d');
            if (ctx) {
                // Translate so that ImageOrigin is at 0,0 of this canvas
                ctx.translate(-imageOrigin.x, -imageOrigin.y);
                drawGridLayer(ctx, image.width, image.height, true);
                
                const link = document.createElement('a');
                link.download = 'map-grid-overlay.png';
                link.href = tempCanvas.toDataURL('image/png');
                link.click();
            }
          },
          exportComposite: () => {
              if (!image) return;
              const tempCanvas = document.createElement('canvas');
              tempCanvas.width = image.width;
              tempCanvas.height = image.height;
              const ctx = tempCanvas.getContext('2d');
              if (ctx) {
                  ctx.drawImage(image, 0, 0); // Image at 0,0 of file
                  
                  // Grid layer needs to be drawn with offset compensated
                  ctx.translate(-imageOrigin.x, -imageOrigin.y);
                  
                  drawGridLayer(ctx, image.width, image.height, true);
                  
                  const link = document.createElement('a');
                  link.download = 'map-composite.png';
                  link.href = tempCanvas.toDataURL('image/png');
                  link.click();
              }
          }
      };
  }, [image, drawGridLayer, exportRef, imageOrigin]);

  // --- Interaction Logic ---
  const handleWheel = (e: React.WheelEvent) => {
     e.preventDefault();
     
     // 1. Grid Rotation (If in Grid Mode and Scrolling)
     if (navMode === NavigationMode.GRID) {
        const delta = e.deltaY > 0 ? 1 : -1;
        setConfig(prev => ({ ...prev, rotation: prev.rotation + delta }));
        return;
     }

     // 2. Zoom (View Mode or Image Mode)
     if (!containerRef.current) return;
     const rect = containerRef.current.getBoundingClientRect();

     const scaleFactor = 1.1;
     const direction = e.deltaY > 0 ? 1/scaleFactor : scaleFactor;
     const newZoom = Math.min(Math.max(viewport.zoom * direction, 0.1), 10);
     
     const mouseX = e.clientX - rect.left;
     const mouseY = e.clientY - rect.top;
     
     const worldX = (mouseX - viewport.x) / viewport.zoom;
     const worldY = (mouseY - viewport.y) / viewport.zoom;

     const newX = mouseX - worldX * newZoom;
     const newY = mouseY - worldY * newZoom;

     setViewport({ x: newX, y: newY, zoom: newZoom });
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    
    // Middle Mouse is always Pan
    if (e.button === 1) {
        dragRef.current = { startX: e.clientX, startY: e.clientY, type: 'pan' };
        return;
    }
    
    if (e.button === 0) {
        if (navMode === NavigationMode.VIEW && activeTool === EditorTool.MOVE) {
            dragRef.current = { startX: e.clientX, startY: e.clientY, type: 'pan' };
        } 
        else if (navMode === NavigationMode.GRID) {
            dragRef.current = { startX: e.clientX, startY: e.clientY, type: 'grid' };
        }
        else if (navMode === NavigationMode.IMAGE) {
            dragRef.current = { startX: e.clientX, startY: e.clientY, type: 'image' };
        }
        else if (navMode === NavigationMode.VIEW) {
            // Tool usage
            dragRef.current = { startX: e.clientX, startY: e.clientY, type: 'tool' };
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                const world = screenToWorld(e.clientX, e.clientY, viewport, rect);
                const cell = GridSystem.getGridCoordinates(world.x, world.y, config);
                
                if (activeTool === EditorTool.RULER) {
                    setRulerStart(cell);
                    setRulerCurrent(cell);
                } else {
                    applyTool(e);
                }
            }
        }
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
      e.currentTarget.releasePointerCapture(e.pointerId);
      if (dragRef.current?.type === 'tool' && (activeTool === EditorTool.PAINT || activeTool === EditorTool.ERASE || activeTool === EditorTool.LABEL || activeTool === EditorTool.ASSET)) {
           if (onDataChange) onDataChange(hexData);
      }
      dragRef.current = null;
      if (activeTool === EditorTool.RULER) {
          setRulerStart(null);
          setRulerCurrent(null);
      }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
      if (!dragRef.current) {
          // Hover Logic
          if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const world = screenToWorld(e.clientX, e.clientY, viewport, rect);
            const { q, r } = GridSystem.getGridCoordinates(world.x, world.y, config);
            const key = getHexKey(q, r);
            if (hoverHex !== key) setHoverHex(key);
          }
          return;
      }

      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      
      // Update start for next frame (delta movement)
      dragRef.current.startX = e.clientX;
      dragRef.current.startY = e.clientY;

      if (dragRef.current.type === 'pan') {
          setViewport(prev => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
      }
      else if (dragRef.current.type === 'grid') {
          // Move grid offset. Must be divided by zoom to track with mouse correctly in world space
          setConfig(prev => ({ 
              ...prev, 
              offsetX: prev.offsetX + dx / viewport.zoom, 
              offsetY: prev.offsetY + dy / viewport.zoom 
          }));
      }
      else if (dragRef.current.type === 'image') {
          // Move image origin
          setImageOrigin(prev => ({
              x: prev.x + dx / viewport.zoom,
              y: prev.y + dy / viewport.zoom
          }));
      }
      else if (dragRef.current.type === 'tool') {
          // FIX FOR HOVER BUG: Update hover hex while dragging tool
          if (containerRef.current) {
               const rect = containerRef.current.getBoundingClientRect();
               const world = screenToWorld(e.clientX, e.clientY, viewport, rect);
               const { q, r } = GridSystem.getGridCoordinates(world.x, world.y, config);
               const key = getHexKey(q, r);
               if (hoverHex !== key) setHoverHex(key);
               
               if (activeTool === EditorTool.RULER && rulerStart) {
                   setRulerCurrent({q, r});
               }
               else if (activeTool === EditorTool.PAINT || activeTool === EditorTool.ERASE) {
                   applyTool(e);
               }
          }
      }
  };

  const applyTool = (e: React.PointerEvent<HTMLDivElement>) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const world = screenToWorld(e.clientX, e.clientY, viewport, rect);
      const centerCell = GridSystem.getGridCoordinates(world.x, world.y, config);
      
      // Phase 1: AoE Calculation - Now via GridSystem
      let targetCells = [centerCell];
      if ((activeTool === EditorTool.PAINT || activeTool === EditorTool.ERASE) && brushSize > 1) {
          targetCells = GridSystem.getNeighbors(centerCell, brushSize - 1, config);
      }

      if (activeTool === EditorTool.PAINT) {
          setHexData(prev => {
              const next = new Map(prev);
              targetCells.forEach(cell => {
                  const key = getHexKey(cell.q, cell.r);
                  if (activeTerrain === HexState.EMPTY) {
                      // "Clear" means reset terrain but keep grid visible (remove from map if map stores terrain)
                      if (next.has(key)) next.delete(key);
                  } else {
                      next.set(key, activeTerrain);
                  }
              });
              return next;
          });
      } else if (activeTool === EditorTool.ERASE) {
          setHexData(prev => {
              const next = new Map(prev);
              targetCells.forEach(cell => {
                  const key = getHexKey(cell.q, cell.r);
                  next.set(key, HexState.HIDDEN);
              });
              return next;
          });
      } else if (activeTool === EditorTool.LABEL) {
           const key = getHexKey(centerCell.q, centerCell.r);
           setMarkers(prev => {
              const next = new Map(prev);
              if (next.has(key)) next.delete(key);
              else next.set(key, { text: activeLabel, color: activeMarkerColor });
              return next;
          });
      } else if (activeTool === EditorTool.ASSET) {
           const key = getHexKey(centerCell.q, centerCell.r);
           setAssets(prev => {
              const next = new Map(prev);
              if (next.has(key)) next.delete(key);
              else next.set(key, { type: activeAssetType, id: Date.now().toString() });
              return next;
          });
      }
  };

  // Cursor style based on mode
  const cursorClass = 
    dragRef.current?.type === 'pan' ? 'cursor-grabbing' : 
    navMode === NavigationMode.VIEW && activeTool === EditorTool.MOVE ? 'cursor-grab' :
    navMode === NavigationMode.GRID ? 'cursor-move' :
    navMode === NavigationMode.IMAGE ? 'cursor-move' :
    'cursor-crosshair';

  return (
    <div 
        ref={containerRef}
        className={`flex-1 relative w-full h-full bg-slate-950 overflow-hidden touch-none select-none ${cursorClass}`}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onPointerMove={handlePointerMove}
        onWheel={handleWheel}
    >
        {!image && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                <div className="text-6xl font-black text-slate-800 tracking-tighter">NO SIGNAL</div>
            </div>
        )}

        {/* Layer 1: Static Map Image with Dynamic Origin */}
        <canvas
          ref={mapCanvasRef}
          className="absolute left-0 top-0 pointer-events-none will-change-transform z-0"
          style={{
             // We apply imageOrigin offset here in the transform
             transform: `translate3d(${viewport.x + imageOrigin.x * viewport.zoom}px, ${viewport.y + imageOrigin.y * viewport.zoom}px, 0) scale(${viewport.zoom})`,
             transformOrigin: '0 0'
          }}
        />

        {/* Layer 2: Dynamic Grid */}
        <canvas
          ref={externalGridRef}
          className="absolute inset-0 pointer-events-none z-10 block"
        />
        
        {/* Debug / Info Overlay */}
        <div className="absolute bottom-6 left-6 pointer-events-none text-[10px] text-slate-500 bg-black/50 p-2 rounded backdrop-blur-sm hidden md:block z-50">
             Pos: {viewport.x.toFixed(0)}, {viewport.y.toFixed(0)} | Zoom: {viewport.zoom.toFixed(2)}x
        </div>
    </div>
  );
}
