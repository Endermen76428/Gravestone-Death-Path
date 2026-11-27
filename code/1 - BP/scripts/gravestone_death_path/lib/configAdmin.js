import { world } from "@minecraft/server";
const cacheAdminConfig = {
    teleport: true,
    needKey: true
};
export const apiConfigAdmin = new class ApiConfigAdmin {
    load() {
        cacheAdminConfig.teleport = (r => typeof r != "boolean" ? cacheAdminConfig.teleport : r)(world.getDynamicProperty("c:teleport"));
        cacheAdminConfig.needKey = (r => typeof r != "boolean" ? cacheAdminConfig.needKey : r)(world.getDynamicProperty("c:needKey"));
    }
    get(config) {
        return cacheAdminConfig[config];
    }
    getAll() { return cacheAdminConfig; }
    update(rawInfo) {
        const [teleport, needKey, _] = rawInfo;
        this.save({
            teleport: (r => typeof r == "boolean" ? r : cacheAdminConfig.teleport)(teleport),
            needKey: (r => typeof r == "boolean" ? r : cacheAdminConfig.needKey)(needKey)
        });
    }
    save(config) {
        cacheAdminConfig.teleport = config.teleport;
        cacheAdminConfig.needKey = config.needKey;
        world.setDynamicProperty("c:teleport", config.teleport);
        world.setDynamicProperty("c:needKey", config.needKey);
    }
};
