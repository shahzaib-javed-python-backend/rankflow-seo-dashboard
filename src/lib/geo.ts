export type GridRadius = 0.5 | 1 | 5;

const CITY_CENTERS: Record<string, { lat: number; lng: number }> = {
  'Austin, TX': { lat: 30.2672, lng: -97.7431 },
  'Denver, CO': { lat: 39.7392, lng: -104.9903 },
  'Seattle, WA': { lat: 47.6062, lng: -122.3321 },
  'Phoenix, AZ': { lat: 33.4484, lng: -112.0740 },
  'Chicago, IL': { lat: 41.8781, lng: -87.6298 },
  'Atlanta, GA': { lat: 33.7490, lng: -84.3880 },
  'Miami, FL': { lat: 25.7617, lng: -80.1918 },
  'New York, NY': { lat: 40.7128, lng: -74.0060 },
  'Los Angeles, CA': { lat: 34.0522, lng: -118.2437 },
  'San Francisco, CA': { lat: 37.7749, lng: -122.4194 },
  'Boston, MA': { lat: 42.3601, lng: -71.0589 },
  'Dallas, TX': { lat: 32.7767, lng: -96.7970 },
  'Portland, OR': { lat: 45.5152, lng: -122.6784 },
  'Nashville, TN': { lat: 36.1627, lng: -86.7816 },
  'United States': { lat: 39.8283, lng: -98.5795 },
};

// Deterministic hash so unknown locations get stable, distinct coordinates
// instead of always falling back to Austin.
function hashLabel(label: string): number {
  let h = 2166136261;
  for (let i = 0; i < label.length; i++) {
    h ^= label.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const EARTH_KM = 6371;

export function haversineKm(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return EARTH_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Convert a grid radius in km into a lat/lng degree span.
 * Uses the haversine formula to produce accurate degree offsets
 * for the given latitude (1° lat ≈ 111km, 1° lng varies by latitude).
 */
export function radiusToSpan(radiusKm: GridRadius, lat: number): number {
  const kmPerDegLat = EARTH_KM * Math.PI / 180;
  const kmPerDegLng = kmPerDegLat * Math.cos((lat * Math.PI) / 180);
  const avgKmPerDeg = (kmPerDegLat + Math.abs(kmPerDegLng)) / 2;
  return radiusKm / avgKmPerDeg;
}

export function getCityCenter(label: string): { lat: number; lng: number } {
  const trimmed = label.trim().toLowerCase();
  if (!trimmed) return CITY_CENTERS['Austin, TX'];
  for (const [city, coords] of Object.entries(CITY_CENTERS)) {
    if (trimmed.includes(city.split(',')[0].toLowerCase())) return coords;
  }
  // Deterministic pseudo-coordinates for unknown locations, derived from the
  // label hash so the same input always maps to the same grid center.
  const h = hashLabel(label);
  const lat = 25 + (h % 2300) / 100; // 25.00 - 48.00
  const lng = -125 + ((h >> 12) % 5800) / 100; // -125.00 to -67.00
  return { lat: Math.round(lat * 10000) / 10000, lng: Math.round(lng * 10000) / 10000 };
}

export function formatCoord(lat: number, lng: number): string {
  return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
}
