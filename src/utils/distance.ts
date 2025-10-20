/**
 * Utility functions for calculating distance between geographic coordinates
 */

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param lat1 Latitude of point 1 (in decimal degrees)
 * @param lon1 Longitude of point 1 (in decimal degrees)
 * @param lat2 Latitude of point 2 (in decimal degrees)
 * @param lon2 Longitude of point 2 (in decimal degrees)
 * @returns Distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
    Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

/**
 * Convert degrees to radians
 * @param degrees Angle in degrees
 * @returns Angle in radians
 */
function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Calculate distance and return in miles instead of kilometers
 * @param lat1 Latitude of point 1
 * @param lon1 Longitude of point 1
 * @param lat2 Latitude of point 2
 * @param lon2 Longitude of point 2
 * @returns Distance in miles
 */
export function calculateDistanceInMiles(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const distanceKm = calculateDistance(lat1, lon1, lat2, lon2);
  const distanceMiles = distanceKm * 0.621371; // Convert km to miles
  return Math.round(distanceMiles * 10) / 10; // Round to 1 decimal place
}

/**
 * Filter providers by distance from a given location
 * @param providers Array of providers with coordinates
 * @param userLat User's latitude
 * @param userLon User's longitude
 * @param maxDistanceKm Maximum distance in kilometers (default: 50km)
 * @returns Filtered providers with distance field, sorted by distance
 */
export function filterProvidersByDistance<T extends { coordinates?: { lat: number; lng: number } }>(
  providers: T[],
  userLat: number,
  userLon: number,
  maxDistanceKm: number = 50
): Array<T & { distance: number }> {
  return providers
    .map(provider => {
      // Skip providers without coordinates
      if (!provider.coordinates?.lat || !provider.coordinates?.lng) {
        return null;
      }
      
      const distance = calculateDistance(
        userLat,
        userLon,
        provider.coordinates.lat,
        provider.coordinates.lng
      );
      
      return {
        ...provider,
        distance
      };
    })
    .filter((p): p is T & { distance: number } => p !== null && p.distance <= maxDistanceKm)
    .sort((a, b) => a.distance - b.distance);
}

/**
 * Check if a point is within a certain radius of another point
 * @param lat1 Latitude of center point
 * @param lon1 Longitude of center point
 * @param lat2 Latitude of point to check
 * @param lon2 Longitude of point to check
 * @param radiusKm Radius in kilometers
 * @returns true if point is within radius, false otherwise
 */
export function isWithinRadius(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  radiusKm: number
): boolean {
  const distance = calculateDistance(lat1, lon1, lat2, lon2);
  return distance <= radiusKm;
}

