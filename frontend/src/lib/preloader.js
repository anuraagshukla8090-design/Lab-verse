/**
 * LabVerse Panorama Preloader — src/lib/preloader.js
 *
 * Preloads adjacent (directly connected) panorama images into the browser
 * cache so navigation feels instant, like Google Street View.
 *
 * Design decisions:
 *
 * 1. Module-level registry (not React state / component state)
 *    — Persists across scene navigations and component re-mounts for the
 *      full browser session. React state resets on remount; module-level
 *      variables do not. This is intentional: once a URL is cached, it
 *      stays cached and there is no reason to re-fetch it.
 *
 * 2. `new Image()` not `fetch()`
 *    — Pannellum loads panoramas internally as <img> elements. Preloading
 *      with Image() writes to the same browser image cache that Pannellum
 *      reads from, giving a true cache hit. Using fetch() writes to the
 *      fetch/service-worker cache instead, which is a separate store in
 *      most browsers and would not help Pannellum's img load.
 *
 * 3. Image reference kept alive in imageRegistry
 *    — A bare `new Image().src = url` creates an object with no owner;
 *      the GC is free to collect it before the network response arrives,
 *      which can cancel the in-flight request in some browser/OS combos.
 *      Storing the object in a Map guarantees it lives until load completes.
 *
 * 4. Failed URLs are evicted from the dedup set
 *    — If a panorama file doesn't exist yet, the request will 404.
 *      The URL is removed from preloadedUrls so a future retry is possible
 *      (e.g., the user adds the file and refreshes without a full reload).
 *
 * 5. Only direct neighbours are preloaded, never the full graph
 *    — Avoids wasted bandwidth for large labs. Depth-1 is enough:
 *      by the time the user navigates one hop, the next hop's neighbours
 *      will have been preloaded by the effect that fires on scene change.
 */

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

/**
 * Set of URLs that have already been requested (or are in-flight).
 * Prevents duplicate HTTP requests when the user revisits scenes.
 * @type {Set<string>}
 */
const preloadedUrls = new Set();

/**
 * Set of URLs whose Image onload has fired — meaning the browser has
 * confirmed the download and written it to the image cache.
 * Only URLs in THIS set are safe to pass directly to loadScene() without
 * a HEAD check, because we know with certainty the file exists and is cached.
 * @type {Set<string>}
 */
const cachedUrls = new Set();

/**
 * Keeps Image objects alive until their onload fires.
 * Maps absolute image URL → Image instance.
 * @type {Map<string, HTMLImageElement>}
 */
const imageRegistry = new Map();

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Preload panorama images for all directly connected neighbours of `sceneKey`.
 *
 * Safe to call multiple times for the same scene — duplicate URLs are
 * silently skipped via the module-level Set.
 *
 * @param {string} sceneKey   The key of the scene whose neighbours to preload
 * @param {object} labConfig  Full lab config object from GET /lab-config
 */
export function preloadAdjacentScenes(sceneKey, labConfig) {
  const scene = labConfig?.scenes?.[sceneKey];
  if (!scene?.navigation?.length) return;

  for (const nav of scene.navigation) {
    const targetScene = labConfig.scenes[nav.target];
    if (!targetScene?.image) continue;

    const imageUrl = targetScene.image.startsWith("http")
      ? targetScene.image
      : `${API_BASE}${targetScene.image}`;

    // ── Deduplication ──────────────────────────────────────────────────────
    // If this URL has already been requested (successful or in-flight),
    // skip it entirely. The browser already has it cached or is fetching it.
    if (preloadedUrls.has(imageUrl)) continue;
    preloadedUrls.add(imageUrl);
    // ───────────────────────────────────────────────────────────────────────

    const img = new Image();

    img.onload = () => {
      // onload fired — browser has confirmed the download and cached the image.
      // Mark as fully cached so PanoramaViewer can skip the HEAD check.
      cachedUrls.add(imageUrl);
      imageRegistry.delete(imageUrl);

      if (import.meta.env.DEV) {
        console.debug(`[Preloader] ✓ cached: ${imageUrl}`);
      }
    };

    img.onerror = () => {
      // 404 or network failure — panorama file not placed yet.
      // Evict from both registries so a future retry is possible.
      imageRegistry.delete(imageUrl);
      preloadedUrls.delete(imageUrl);
      // Note: do NOT add to cachedUrls — the file is not available.

      if (import.meta.env.DEV) {
        console.debug(`[Preloader] ✗ missing (will retry on next visit): ${imageUrl}`);
      }
    };

    // Assigning src triggers the browser's HTTP GET.
    // The Image object is stored in imageRegistry until onload fires,
    // preventing the GC from collecting it mid-request.
    img.src = imageUrl;
    imageRegistry.set(imageUrl, img);

    if (import.meta.env.DEV) {
      console.debug(`[Preloader] → preloading: ${imageUrl}`);
    }
  }
}

/**
 * Return the number of URLs currently cached or in-flight.
 * Useful for debug panels or status displays.
 * @returns {number}
 */
export function getPreloadedCount() {
  return preloadedUrls.size;
}

/**
 * Returns true if this image URL has been fully downloaded by the preloader
 * and is confirmed to be in the browser's image cache.
 *
 * Used by PanoramaViewer to skip the HEAD check before loadScene():
 * if isPreloaded() is true, the image is guaranteed to exist and be cached,
 * so we can call loadScene() immediately without any network round-trip.
 *
 * @param {string} url  Absolute image URL
 * @returns {boolean}
 */
export function isPreloaded(url) {
  return cachedUrls.has(url);
}

/**
 * Return a snapshot of all preloaded URLs.
 * Useful for debugging.
 * @returns {Set<string>}
 */
export function getPreloadedUrls() {
  return new Set(preloadedUrls);
}

/**
 * Clear the preload registry completely.
 * Call this if the lab config changes at runtime (e.g., hot reload in dev).
 * Not needed in normal production use.
 */
export function clearPreloadCache() {
  preloadedUrls.clear();
  cachedUrls.clear();
  imageRegistry.clear();
}
