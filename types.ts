export enum HexState {
  EMPTY = 0,
  BLOCKED = 1,   // Red
  DIFFICULT = 2, // Yellow/Orange
  WATER = 3,     // Blue
  HIDDEN = 4,    // Erased
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

// --- NEW ASSET SYSTEM ---

export type AssetCategory = 'structure' | 'hazard' | 'entity' | 'loot' | 'nature';

export interface AssetDefinition {
  id: string;
  icon: string; // Emoji char
  label: string;
  color: string; // Hex color for glow/shadow
  category: AssetCategory;
}

export const ASSET_LIBRARY: Record<string, AssetDefinition> = {
  // Structures
  'door': { id: 'door', icon: '🚪', label: 'Puerta', color: '#a16207', category: 'structure' },
  'barricade': { id: 'barricade', icon: '🚧', label: 'Barricada', color: '#f59e0b', category: 'structure' },
  'wall': { id: 'wall', icon: '🧱', label: 'Muro', color: '#78716c', category: 'structure' },
  'pillar': { id: 'pillar', icon: '🏛️', label: 'Pilar', color: '#d6d3d1', category: 'structure' },
  'stairs_up': { id: 'stairs_up', icon: '🔼', label: 'Escalera Subir', color: '#fff', category: 'structure' },
  'stairs_down': { id: 'stairs_down', icon: '🔽', label: 'Escalera Bajar', color: '#fff', category: 'structure' },
  'torch': { id: 'torch', icon: '🔦', label: 'Antorcha', color: '#fbbf24', category: 'structure' },

  // Hazards (Traps & Dangers)
  'trap_bear': { id: 'trap_bear', icon: '⚙️', label: 'Cepo', color: '#dc2626', category: 'hazard' },
  'mine': { id: 'mine', icon: '💣', label: 'Mina', color: '#ef4444', category: 'hazard' },
  'spikes': { id: 'spikes', icon: '📌', label: 'Pinchos', color: '#991b1b', category: 'hazard' },
  'fire': { id: 'fire', icon: '🔥', label: 'Fuego', color: '#f97316', category: 'hazard' },
  'poison': { id: 'poison', icon: '☠️', label: 'Veneno', color: '#84cc16', category: 'hazard' },
  'web': { id: 'web', icon: '🕸️', label: 'Telaraña', color: '#e5e7eb', category: 'hazard' },

  // Loot & Items
  'chest': { id: 'chest', icon: '💎', label: 'Cofre', color: '#06b6d4', category: 'loot' },
  'key': { id: 'key', icon: '🔑', label: 'Llave', color: '#facc15', category: 'loot' },
  'scroll': { id: 'scroll', icon: '📜', label: 'Pergamino', color: '#fde047', category: 'loot' },
  'potion': { id: 'potion', icon: '🧪', label: 'Poción', color: '#d946ef', category: 'loot' },
  'weapon': { id: 'weapon', icon: '⚔️', label: 'Arma', color: '#94a3b8', category: 'loot' },
  'food': { id: 'food', icon: '🍖', label: 'Comida', color: '#f87171', category: 'loot' },

  // Entities
  'enemy_melee': { id: 'enemy_melee', icon: '👹', label: 'Enemigo', color: '#b91c1c', category: 'entity' },
  'enemy_ranged': { id: 'enemy_ranged', icon: '🏹', label: 'Arquero', color: '#ea580c', category: 'entity' },
  'boss': { id: 'boss', icon: '👑', label: 'Jefe', color: '#7e22ce', category: 'entity' },
  'npc': { id: 'npc', icon: '👤', label: 'NPC', color: '#3b82f6', category: 'entity' },
  'corpse': { id: 'corpse', icon: '💀', label: 'Cadáver', color: '#475569', category: 'entity' },

  // Nature
  'tree': { id: 'tree', icon: '🌲', label: 'Árbol', color: '#166534', category: 'nature' },
  'rock': { id: 'rock', icon: '🪨', label: 'Roca', color: '#57534e', category: 'nature' },
  'bush': { id: 'bush', icon: '🌿', label: 'Arbusto', color: '#22c55e', category: 'nature' },
  'campfire': { id: 'campfire', icon: '⛺', label: 'Campamento', color: '#fb923c', category: 'nature' },
};

export interface Asset {
  type: string; // Now keys of ASSET_LIBRARY
  id: string;
}

export interface ProjectData {
  id: string;
  name: string;
  lastModified: number;
  imageBlob: Blob | null; 
  imageOrigin: Point; 
  config: GridConfig;
  hexData: [string, HexState][]; 
  markers: [string, Marker][];   
  assets: [string, Asset][];     
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