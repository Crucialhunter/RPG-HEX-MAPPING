
import { AxialCoord, Point, GridConfig, GridType } from '../types';

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

interface GridStrategy {
  getPixelCoordinates(q: number, r: number, config: GridConfig): Point;
  getGridCoordinates(x: number, y: number, config: GridConfig): AxialCoord;
  getCorners(center: Point, radius: number, rotation: number, coord: AxialCoord): Point[];
  getNeighbors(center: AxialCoord, range: number): AxialCoord[];
  getDistance(a: AxialCoord, b: AxialCoord): number;
}

// --- HEXAGON STRATEGY ---
const HexStrategy: GridStrategy = {
  getPixelCoordinates: (q, r, config) => {
    const x = config.radius * (3 / 2 * q);
    const y = config.radius * (SQRT_3 / 2 * q + SQRT_3 * r);
    const rotated = rotatePoint(x, y, config.rotation);
    return { 
      x: rotated.x + config.offsetX, 
      y: rotated.y + config.offsetY 
    };
  },

  getGridCoordinates: (x, y, config) => {
    let localX = x - config.offsetX;
    let localY = y - config.offsetY;
    const unrotated = unrotatePoint(localX, localY, config.rotation);
    localX = unrotated.x;
    localY = unrotated.y;

    const q = (2 / 3) * localX / config.radius;
    const r = ((-1 / 3) * localX + (SQRT_3 / 3) * localY) / config.radius;
    
    // Axial Round
    let rx = Math.round(q);
    let ry = Math.round(r);
    let rz = Math.round(-q - r);

    const xDiff = Math.abs(rx - q);
    const yDiff = Math.abs(ry - r);
    const zDiff = Math.abs(rz - (-q - r));

    if (xDiff > yDiff && xDiff > zDiff) rx = -ry - rz;
    else if (yDiff > zDiff) ry = -rx - rz;

    return { q: rx, r: ry };
  },

  getCorners: (center, radius, rotation) => {
    const corners: Point[] = [];
    for (let i = 0; i < 6; i++) {
      const angle_deg = 60 * i + rotation; 
      const angle_rad = (Math.PI / 180) * angle_deg;
      corners.push({
        x: center.x + radius * Math.cos(angle_rad),
        y: center.y + radius * Math.sin(angle_rad),
      });
    }
    return corners;
  },

  getNeighbors: (center, range) => {
    const results: AxialCoord[] = [];
    for (let q = -range; q <= range; q++) {
      for (let r = Math.max(-range, -q - range); r <= Math.min(range, -q + range); r++) {
        results.push({ q: center.q + q, r: center.r + r });
      }
    }
    return results;
  },

  getDistance: (a, b) => {
    return (Math.abs(a.q - b.q) + Math.abs(a.q + a.r - b.q - b.r) + Math.abs(a.r - b.r)) / 2;
  }
};

// --- SQUARE STRATEGY ---
const SquareStrategy: GridStrategy = {
  getPixelCoordinates: (q, r, config) => {
    // q = x, r = y
    // Use radius * 2 as side length to keep scale consistent with hexes
    const size = config.radius * 2;
    const x = q * size;
    const y = r * size;
    const rotated = rotatePoint(x, y, config.rotation);
    return {
      x: rotated.x + config.offsetX,
      y: rotated.y + config.offsetY
    };
  },

  getGridCoordinates: (x, y, config) => {
    let localX = x - config.offsetX;
    let localY = y - config.offsetY;
    const unrotated = unrotatePoint(localX, localY, config.rotation);
    
    const size = config.radius * 2;
    return {
      q: Math.round(unrotated.x / size),
      r: Math.round(unrotated.y / size)
    };
  },

  getCorners: (center, radius, rotation) => {
    // Draw a square centered at `center` with half-width `radius`
    const corners: Point[] = [];
    const angles = [45, 135, 225, 315]; // Diagonals
    // Distance to corner for a square of side 2*r is r * sqrt(2)
    const cornerDist = radius * Math.sqrt(2); 

    for (let i = 0; i < 4; i++) {
      const angle_deg = angles[i] + rotation;
      const angle_rad = (Math.PI / 180) * angle_deg;
      corners.push({
        x: center.x + cornerDist * Math.cos(angle_rad),
        y: center.y + cornerDist * Math.sin(angle_rad),
      });
    }
    return corners;
  },

  getNeighbors: (center, range) => {
    const results: AxialCoord[] = [];
    for (let x = -range; x <= range; x++) {
      for (let y = -range; y <= range; y++) {
        results.push({ q: center.q + x, r: center.r + y });
      }
    }
    return results;
  },

  getDistance: (a, b) => {
    // Chebyshev distance (assuming diagonals allowed in movement for D&D standard)
    return Math.max(Math.abs(a.q - b.q), Math.abs(a.r - b.r));
  }
};

// --- TRIANGLE STRATEGY ---
const TriangleStrategy: GridStrategy = {
    getPixelCoordinates: (q, r, config) => {
        // Equilateral Triangles.
        // Height = side * sqrt(3)/2. 
        // We use config.radius as side length.
        const side = config.radius * 2.5; // Scale up slightly to match hex visual size
        const height = side * (SQRT_3 / 2);
        
        // Offset odd rows
        const xOffset = (r % 2 !== 0) ? side / 2 : 0;
        
        const x = q * side + xOffset;
        const y = r * height;

        const rotated = rotatePoint(x, y, config.rotation);
        return {
            x: rotated.x + config.offsetX,
            y: rotated.y + config.offsetY
        };
    },
    
    getGridCoordinates: (x, y, config) => {
        let localX = x - config.offsetX;
        let localY = y - config.offsetY;
        const unrotated = unrotatePoint(localX, localY, config.rotation);

        const side = config.radius * 2.5;
        const height = side * (SQRT_3 / 2);

        const r = Math.round(unrotated.y / height);
        // Reverse offset logic
        const xOffset = (Math.abs(r) % 2 === 1) ? side / 2 : 0;
        const q = Math.round((unrotated.x - xOffset) / side);

        return { q, r };
    },

    getCorners: (center, radius, rotation, coord) => {
        // Triangles flip orientation based on coordinate parity to interlock?
        // Simplified non-interlocking grid for Phase 3 stability: All triangles point up
        // Improved: Interlocking rows
        // If r is even, triangles point up. If r is odd, they point down? 
        // Let's stick to standard pointing up for this simplified grid implementation
        
        const side = radius * 2.5;
        const height = side * (SQRT_3 / 2);
        const r = side / SQRT_3; // Circumradius

        const corners: Point[] = [];
        // Pointing Up Triangle: 90, 210, 330 degrees
        // But we need to rotate 90 deg to align with flat bottom? -90 = 270 (Top), 30 (Right), 150 (Left)
        const angles = [270, 30, 150]; 

        for (let i = 0; i < 3; i++) {
            const angle_deg = angles[i] + rotation;
            const angle_rad = (Math.PI / 180) * angle_deg;
            corners.push({
                x: center.x + r * Math.cos(angle_rad),
                y: center.y + r * Math.sin(angle_rad) + (height/6), // Visual center offset correction
            });
        }
        return corners;
    },

    getNeighbors: (center, range) => {
         // Simple box range for triangles
         const results: AxialCoord[] = [];
         for (let x = -range; x <= range; x++) {
           for (let y = -range; y <= range; y++) {
             results.push({ q: center.q + x, r: center.r + y });
           }
         }
         return results;
    },

    getDistance: (a, b) => {
        // Manhattan approximation
        return Math.abs(a.q - b.q) + Math.abs(a.r - b.r);
    }
}

// --- SYSTEM FACTORY ---

export const GridSystem = {
  getStrategy: (type: GridType): GridStrategy => {
    switch (type) {
      case GridType.SQUARE: return SquareStrategy;
      case GridType.TRIANGLE: return TriangleStrategy;
      case GridType.HEX_FLAT: 
      default: return HexStrategy;
    }
  },

  getPixelCoordinates: (q: number, r: number, config: GridConfig) => 
    GridSystem.getStrategy(config.type).getPixelCoordinates(q, r, config),

  getGridCoordinates: (x: number, y: number, config: GridConfig) => 
    GridSystem.getStrategy(config.type).getGridCoordinates(x, y, config),

  getCorners: (center: Point, radius: number, rotation: number, config: GridConfig, coord: AxialCoord) => 
    GridSystem.getStrategy(config.type).getCorners(center, radius, rotation, coord),

  getNeighbors: (center: AxialCoord, range: number, config: GridConfig) => 
    GridSystem.getStrategy(config.type).getNeighbors(center, range),

  getDistance: (a: AxialCoord, b: AxialCoord, config: GridConfig) =>
    GridSystem.getStrategy(config.type).getDistance(a, b)
};
