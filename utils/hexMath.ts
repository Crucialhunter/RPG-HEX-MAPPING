
import { AxialCoord, Point, Viewport, GridConfig } from '../types';

const SQRT_3 = Math.sqrt(3);

const rotatePoint = (x: number, y: number, angleDeg: number): Point => {
  if (angleDeg === 0) return { x, y };
  const rad = (Math.PI / 180) * angleDeg;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return {
    x: x * cos - y * sin,
    y: x * sin + y * cos
  };
};

// Inverse rotation
const unrotatePoint = (x: number, y: number, angleDeg: number): Point => {
  if (angleDeg === 0) return { x, y };
  const rad = (Math.PI / 180) * -angleDeg;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return {
    x: x * cos - y * sin,
    y: x * sin + y * cos
  };
};

export const hexToPixel = (q: number, r: number, config: GridConfig): Point => {
  // 1. Calculate Standard Axial Position
  const x = config.radius * (3 / 2 * q);
  const y = config.radius * (SQRT_3 / 2 * q + SQRT_3 * r);

  // 2. Rotate around (0,0)
  const rotated = rotatePoint(x, y, config.rotation);

  // 3. Apply Offset
  return { 
    x: rotated.x + config.offsetX, 
    y: rotated.y + config.offsetY 
  };
};

export const pixelToHex = (x: number, y: number, config: GridConfig): AxialCoord => {
  // 1. Remove Offset
  let localX = x - config.offsetX;
  let localY = y - config.offsetY;

  // 2. Un-Rotate
  const unrotated = unrotatePoint(localX, localY, config.rotation);
  localX = unrotated.x;
  localY = unrotated.y;

  // 3. Convert to Hex
  const q = (2 / 3) * localX / config.radius;
  const r = ((-1 / 3) * localX + (SQRT_3 / 3) * localY) / config.radius;
  
  return axialRound(q, r);
};

const axialRound = (q: number, r: number): AxialCoord => {
  const s = -q - r;
  
  let rq = Math.round(q);
  let rr = Math.round(r);
  let rs = Math.round(s);

  const qDiff = Math.abs(rq - q);
  const rDiff = Math.abs(rr - r);
  const sDiff = Math.abs(rs - s);

  if (qDiff > rDiff && qDiff > sDiff) {
    rq = -rr - rs;
  } else if (rDiff > sDiff) {
    rr = -rq - rs;
  }
  
  return { q: rq, r: rr };
};

export const getHexCorners = (center: Point, radius: number, rotation: number): Point[] => {
  const corners: Point[] = [];
  // Center is already the final pixel position.
  // We just need to calculate corners relative to center, applying global rotation.
  
  for (let i = 0; i < 6; i++) {
    const angle_deg = 60 * i + rotation; // Add the grid rotation to the corner angle
    const angle_rad = (Math.PI / 180) * angle_deg;
    corners.push({
      x: center.x + radius * Math.cos(angle_rad),
      y: center.y + radius * Math.sin(angle_rad),
    });
  }
  return corners;
};

// Screen to World Transformation
export const screenToWorld = (screenX: number, screenY: number, viewport: Viewport, canvasRect: DOMRect): Point => {
  const relX = screenX - canvasRect.left;
  const relY = screenY - canvasRect.top;

  return {
    x: (relX - viewport.x) / viewport.zoom,
    y: (relY - viewport.y) / viewport.zoom
  };
};

export const getHexDistance = (a: AxialCoord, b: AxialCoord): number => {
  return (Math.abs(a.q - b.q) + Math.abs(a.q + a.r - b.q - b.r) + Math.abs(a.r - b.r)) / 2;
};

// Get all hexes within N steps of center (Range 0 = center only)
export const getHexRange = (center: AxialCoord, range: number): AxialCoord[] => {
  const results: AxialCoord[] = [];
  for (let q = -range; q <= range; q++) {
    for (let r = Math.max(-range, -q - range); r <= Math.min(range, -q + range); r++) {
      results.push({ q: center.q + q, r: center.r + r });
    }
  }
  return results;
};
