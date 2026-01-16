

export enum HexState {
  EMPTY = 0,
  BLOCKED = 1,   // Red
  DIFFICULT = 2, // Yellow/Orange
  WATER = 3,     // Blue
  HIDDEN = 4,    // Erased
}

export enum GridType {
  HEX_FLAT = 'hex_flat', // Flat top hex
  SQUARE = 'square',
  TRIANGLE = 'triangle'
}

export enum EditorTool {
  MOVE = 'move',      
  PAINT = 'paint',    
  ERASE = 'erase',    
  LABEL = 'label',    
  ASSET = 'asset',
  RULER = 'ruler',    
}

export enum NavigationMode {
  VIEW = 'view',   // Pan/Zoom Camera
  GRID = 'grid',   // Move/Rotate Grid
  IMAGE = 'image', // Move Image
}

export interface GridConfig {
  type: GridType; // Phase 3: Shape selector
  radius: number;
  offsetX: number;
  offsetY: number;
  rotation: number;
  lineColor: string;
  lineWidth: number;
  opacity: number;
  showGrid: boolean;
  showBoundary: boolean;
  showCoordinates: boolean; 
}

export interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

export interface Marker {
  text: string;
  color: string;
}

// --- NEW CAMPAIGN SYSTEM ---

export interface Folder {
  id: string;
  name: string;
  color: string; // e.g., 'indigo', 'red', 'slate'
  icon: string; // Lucide icon name placeholder
  createdAt: number;
  isArchived?: boolean; // Phase 2.5: Soft Delete
}

// --- NEW ASSET SYSTEM ---

export type AssetCategory = 'structure' | 'hazard' | 'entity' | 'loot' | 'nature';

export interface AssetDefinition {
  id: string;
  path: string; // SVG Path Data (d attribute)
  label: string;
  color: string; // Hex color for glow/shadow
  category: AssetCategory;
  viewBox?: string; // Default '0 0 24 24'
  scale?: number; // Adjustment for canvas rendering
}

// Simplified SVG Paths for Canvas Rendering (24x24 base)
export const ASSET_LIBRARY: Record<string, AssetDefinition> = {
  // Structures
  'door': { 
    id: 'door', 
    path: 'M3 21h18M5 21V7l8-4 8 4v14M13 11v2', 
    label: 'Door', 
    color: '#a16207', 
    category: 'structure' 
  },
  'barricade': { 
    id: 'barricade', 
    path: 'M4 10L20 10M4 14L20 14M4 18L20 18M7 7L17 18M17 7L7 18', 
    label: 'Barricade', 
    color: '#f59e0b', 
    category: 'structure' 
  },
  'wall': { 
    id: 'wall', 
    path: 'M3 21h18M5 21V7h14v14M9 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4', 
    label: 'Wall', 
    color: '#78716c', 
    category: 'structure' 
  },
  'pillar': { 
    id: 'pillar', 
    path: 'M6 5h12M6 19h12M8 5v14M16 5v14M6 9h12M6 15h12', 
    label: 'Pillar', 
    color: '#d6d3d1', 
    category: 'structure' 
  },
  'stairs_up': { 
    id: 'stairs_up', 
    path: 'M3 19h4v-4h4v-4h4V7h4', 
    label: 'Stairs Up', 
    color: '#fff', 
    category: 'structure' 
  },
  'stairs_down': { 
    id: 'stairs_down', 
    path: 'M21 19h-4v-4h-4v-4H9V7H5', 
    label: 'Stairs Down', 
    color: '#fff', 
    category: 'structure' 
  },
  'torch': { 
    id: 'torch', 
    path: 'M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V10h-2V5.73C10.4 5.39 10 4.74 10 4a2 2 0 0 1 2-2M11 10l-2 10h6l-2-10', 
    label: 'Torch', 
    color: '#fbbf24', 
    category: 'structure',
    scale: 0.8
  },

  // Hazards
  'trap_bear': { 
    id: 'trap_bear', 
    path: 'M12 2l3 6h6l-5 4 2 6-6-4-6 4 2-6-5-4h6z', // Rough star/spiked shape
    label: 'Bear Trap', 
    color: '#dc2626', 
    category: 'hazard' 
  },
  'mine': { 
    id: 'mine', 
    path: 'M12 2v20M2 12h20M4.93 4.93l14.14 14.14M4.93 19.07l14.14-14.14M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10', 
    label: 'Mine', 
    color: '#ef4444', 
    category: 'hazard',
    scale: 0.8
  },
  'spikes': { 
    id: 'spikes', 
    path: 'M4 21L7 6L10 21M14 21L17 6L20 21', 
    label: 'Spikes', 
    color: '#991b1b', 
    category: 'hazard' 
  },
  'fire': { 
    id: 'fire', 
    path: 'M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z', 
    label: 'Fire', 
    color: '#f97316', 
    category: 'hazard' 
  },
  'poison': { 
    id: 'poison', 
    path: 'M9 12h6m-3-3v6m-7 6a9 9 0 1 1 14 0H5z', // Simplified Skull/Potion
    label: 'Poison', 
    color: '#84cc16', 
    category: 'hazard' 
  },
  'web': { 
    id: 'web', 
    path: 'M12 2v20M2 12h20m-2.5-7.5l-15 15m0-15l15 15', 
    label: 'Web', 
    color: '#e5e7eb', 
    category: 'hazard' 
  },

  // Loot
  'chest': { 
    id: 'chest', 
    path: 'M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8m0 4h18M12 12v3', 
    label: 'Chest', 
    color: '#06b6d4', 
    category: 'loot' 
  },
  'key': { 
    id: 'key', 
    path: 'M2 12h8m4 0a4 4 0 1 0 8 0 4 4 0 0 0-8 0m-8 3v-6', 
    label: 'Key', 
    color: '#facc15', 
    category: 'loot' 
  },
  'scroll': { 
    id: 'scroll', 
    path: 'M19 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2m0 0l-2 2', 
    label: 'Scroll', 
    color: '#fde047', 
    category: 'loot' 
  },
  'potion': { 
    id: 'potion', 
    path: 'M10 2v2h4V2M9 10h6m-7 4h8l-1 8H8l-1-8m1-8h6v6H9V6', // Bottle shape
    label: 'Potion', 
    color: '#d946ef', 
    category: 'loot' 
  },
  'weapon': { 
    id: 'weapon', 
    path: 'M14.5 17.5L3 6V3h3l11.5 11.5M13 19l6-6M19 13l2 2-4 4-2-2', // Sword
    label: 'Weapon', 
    color: '#94a3b8', 
    category: 'loot' 
  },
  'food': { 
    id: 'food', 
    path: 'M10 10a4 4 0 1 1-3.6 6.4M16 8a4 4 0 1 0-2-6', // Rough apple/meat shape
    label: 'Food', 
    color: '#f87171', 
    category: 'loot' 
  },

  // Entities
  'enemy_melee': { 
    id: 'enemy_melee', 
    path: 'M4 4h16v16H4z M9 9h6v6H9z', // Square shield
    label: 'Melee', 
    color: '#b91c1c', 
    category: 'entity' 
  },
  'enemy_ranged': { 
    id: 'enemy_ranged', 
    path: 'M12 2l10 20H2L12 2', // Triangle
    label: 'Ranged', 
    color: '#ea580c', 
    category: 'entity' 
  },
  'boss': { 
    id: 'boss', 
    path: 'M12 2l3 6 5 2-4 4 1 6-5-3-5 3 1-6-4-4 5-2z', // Star
    label: 'Boss', 
    color: '#7e22ce', 
    category: 'entity' 
  },
  'npc': { 
    id: 'npc', 
    path: 'M12 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10M12 14c-5 0-9 3-9 8h18c0-5-4-8-9-8', // Person
    label: 'NPC', 
    color: '#3b82f6', 
    category: 'entity' 
  },
  'corpse': { 
    id: 'corpse', 
    path: 'M9 9h6v6H9z M4 20h16', // Tombstone shape
    label: 'Corpse', 
    color: '#475569', 
    category: 'entity' 
  },

  // Nature
  'tree': { 
    id: 'tree', 
    path: 'M12 2L4 14h16L12 2m-2 12v8h4v-8', 
    label: 'Tree', 
    color: '#166534', 
    category: 'nature' 
  },
  'rock': { 
    id: 'rock', 
    path: 'M4 14l4-8 4 2 6-4 2 12H4z', 
    label: 'Rock', 
    color: '#57534e', 
    category: 'nature' 
  },
  'bush': { 
    id: 'bush', 
    path: 'M12 10a4 4 0 0 0-4 4 4 4 0 0 0 4 4 4 4 0 0 0 4-4 4 4 0 0 0-4-4', 
    label: 'Bush', 
    color: '#22c55e', 
    category: 'nature' 
  },
  'campfire': { 
    id: 'campfire', 
    path: 'M12 14l-4 8h8l-4-8M12 2l2 4-2 4-2-4 2-4', 
    label: 'Campfire', 
    color: '#fb923c', 
    category: 'nature' 
  },
};

export interface Asset {
  type: string; // keyof ASSET_LIBRARY
  id: string;
}

export interface ProjectData {
  id: string;
  folderId?: string; 
  name: string;
  lastModified: number;
  imageBlob: Blob | null; 
  imageOrigin: Point; 
  config: GridConfig;
  hexData: [string, HexState][]; 
  markers: [string, Marker][];   
  assets: [string, Asset][];
  isArchived?: boolean; // Phase 2.5: Soft Delete   
}

export interface Point {
  x: number;
  y: number;
}

export interface AxialCoord {
  q: number;
  r: number;
}

export const getHexKey = (q: number, r: number) => `${q},${r}`;
export const parseHexKey = (key: string): AxialCoord => {
  const [q, r] = key.split(',').map(Number);
  return { q, r };
};
