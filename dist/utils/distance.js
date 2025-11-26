"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateDistance = calculateDistance;
exports.calculateDistanceInMiles = calculateDistanceInMiles;
exports.filterProvidersByDistance = filterProvidersByDistance;
exports.isWithinRadius = isWithinRadius;
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) *
            Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return Math.round(distance * 10) / 10;
}
function toRad(degrees) {
    return degrees * (Math.PI / 180);
}
function calculateDistanceInMiles(lat1, lon1, lat2, lon2) {
    const distanceKm = calculateDistance(lat1, lon1, lat2, lon2);
    const distanceMiles = distanceKm * 0.621371;
    return Math.round(distanceMiles * 10) / 10;
}
function filterProvidersByDistance(providers, userLat, userLon, maxDistanceKm = 50) {
    return providers
        .map(provider => {
        var _a, _b;
        if (!((_a = provider.coordinates) === null || _a === void 0 ? void 0 : _a.lat) || !((_b = provider.coordinates) === null || _b === void 0 ? void 0 : _b.lng)) {
            return null;
        }
        const distance = calculateDistance(userLat, userLon, provider.coordinates.lat, provider.coordinates.lng);
        return Object.assign(Object.assign({}, provider), { distance });
    })
        .filter((p) => p !== null && p.distance <= maxDistanceKm)
        .sort((a, b) => a.distance - b.distance);
}
function isWithinRadius(lat1, lon1, lat2, lon2, radiusKm) {
    const distance = calculateDistance(lat1, lon1, lat2, lon2);
    return distance <= radiusKm;
}
//# sourceMappingURL=distance.js.map