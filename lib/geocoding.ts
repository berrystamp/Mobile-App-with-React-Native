/**
 * Geocoding service wrapping the MapTiler Geocoding API.
 * Returns an array of geocoded address records with validated lat/lng.
 */

const MAPTILER_KEY = 'PcoxmpM8tdMMRkwERdlq';
const MAPTILER_BASE = 'https://api.maptiler.com/geocoding';

export interface GeocodedAddress {
    /** Human-readable address name, e.g. "Ibadan, Oyo, Nigeria" */
    name: string;
    /** Latitude (northing) – GeoJSON center[1] */
    latitude: number;
    /** Longitude (easting) – GeoJSON center[0] */
    longitude: number;
}

/**
 * Fetch geocoded address suggestions for a query string.
 * Returns an empty array on network/server failures rather than throwing.
 */
export async function geocodeQuery(query: string): Promise<GeocodedAddress[]> {
    if (!query || query.trim().length < 3) return [];

    try {
        const encoded = encodeURIComponent(query.trim());
        const url = `${MAPTILER_BASE}/${encoded}.json?key=${MAPTILER_KEY}&country=NG`;

        const response = await fetch(url);
        if (!response.ok) return [];

        const data = await response.json();
        const features: any[] = Array.isArray(data?.features) ? data.features : [];

        return features
            .filter((f: any) => f?.place_name && Array.isArray(f?.center) && f.center.length >= 2)
            .map((f: any) => ({
                name: String(f.place_name),
                // GeoJSON center is [longitude, latitude]
                longitude: Number(f.center[0]),
                latitude: Number(f.center[1]),
            }));
    } catch {
        return [];
    }
}

/**
 * Returns a debounced version of `fn` that delays execution by `delay` ms.
 * The returned function is a plain function (not a hook) so it can be created
 * once at module level or inside useRef/useCallback.
 */
export function debounce<T extends (...args: any[]) => void>(
    fn: T,
    delay: number = 400,
): (...args: Parameters<T>) => void {
    let timer: ReturnType<typeof setTimeout> | null = null;
    return (...args: Parameters<T>) => {
        if (timer !== null) clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}
