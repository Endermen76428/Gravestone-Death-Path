export const cacheTrackingLocations = new Map();
const apiLocation = new class {
    load(player) {
        const cache = (() => {
            const map = cacheTrackingLocations.get(player.id);
            if (map)
                return map;
            const newCache = new Map();
            cacheTrackingLocations.set(player.id, newCache);
            return newCache;
        })();
        for (const id of player.getDynamicPropertyIds() ?? []) {
            let pos = 0;
            let dimension = 0;
            if (id.startsWith("p:") && !id.endsWith(".5")) {
                pos = (r => typeof r == "object" ? r : 0)(player.getDynamicProperty(id));
                dimension = (r => typeof r == "string" ? r : 0)(player.getDynamicProperty(`${id}.5`));
            }
            pos && dimension && cache.set(Number(id.replace("p:", "")), { pos, dimension });
        }
    }
    get(player) {
        return cacheTrackingLocations.get(player.id) ?? new Map();
    }
};
