export const cacheTrackingLocations = new Map();
export const apiTracking = new class ApiTracking {
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
    savePoint(player, index) {
        const pos = { x: Math.floor(player.location.x), y: Math.floor(player.location.y), z: Math.floor(player.location.z) };
        const dimension = player.dimension.id.replace("minecraft:", "");
        const cache = this.get(player);
        cache.set(index, { pos, dimension });
        player.setDynamicProperty("count", index);
        player.setDynamicProperty(`p:${index}`, pos);
        player.setDynamicProperty(`p:${index}.5`, dimension);
    }
    deletePoint(player, index) {
        const cache = this.get(player);
        cache.delete(index);
        player.setDynamicProperty(`p:${index}`, undefined);
        player.setDynamicProperty(`p:${index}.5`, undefined);
    }
};
