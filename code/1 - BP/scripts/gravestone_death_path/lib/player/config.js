const cachePlayerConfig = new Map();
export const apiConfig = new class ApiConfig {
    load(player) {
        const rawInfo = (r => typeof r != "string" ? undefined : JSON.parse(r))(player.getDynamicProperty("config"));
        if (rawInfo == undefined)
            return this.save(player, defaultConfig);
        cachePlayerConfig.set(player.id, {
            dropGrave: (r => typeof r == "boolean" ? r : defaultConfig.dropGrave)(rawInfo.dropGrave),
            pathType: (r => typeof r == "number" ? r : defaultConfig.pathType)(rawInfo.pathType),
            pathCheck: (r => typeof r == "number" ? r : defaultConfig.pathCheck)(rawInfo.pathCheck)
        });
    }
    get(player, config) {
        const cache = cachePlayerConfig.get(player.id) ?? defaultConfig;
        return cache[config];
    }
    getAll(player) {
        return cachePlayerConfig.get(player.id) ?? defaultConfig;
    }
    update(player, rawInfo) {
        const [dropGrave, pathType, pathCheck] = rawInfo;
        this.save(player, {
            dropGrave: (r => typeof r == "boolean" ? r : defaultConfig.dropGrave)(dropGrave),
            pathType: (r => typeof r == "number" ? r : defaultConfig.pathType)(pathType),
            pathCheck: (r => typeof r == "number" ? r : defaultConfig.pathCheck)(pathCheck)
        });
    }
    save(player, config) {
        cachePlayerConfig.set(player.id, config);
        player.setDynamicProperty("config", JSON.stringify(config));
    }
};
const defaultConfig = {
    dropGrave: true,
    pathType: 1,
    pathCheck: 10
};
