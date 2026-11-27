import { world, system } from "@minecraft/server";
const allLastPos = new Map();
const maxLimit = 300 - 1;
const maxDistance = 4 * 4;
system.runInterval(() => {
    for (const player of world.getPlayers({ excludeTags: ["gravestone_death_path:no_tracking"] })) {
        const lastpos = allLastPos.get(player.id) ?? defaultPos;
        const { x, y, z } = player.location;
        const disX = lastpos.x - x, disY = lastpos.y - y, disZ = lastpos.z - z;
        if (disX * disX + disY * disY + disZ * disZ < maxDistance)
            continue;
        allLastPos.set(player.id, player.location);
        const count = (r => typeof r != "number" ? 0 : r)(player.getDynamicProperty("count"));
        player.setDynamicProperty("count", count + 1);
        player.setDynamicProperty(`p:${count + 1}`, { x: Math.floor(x), y: Math.floor(y), z: Math.floor(z) });
        player.setDynamicProperty(`p:${count + 1}.5`, player.dimension.id.replace("minecraft:", ""));
        if (count >= maxLimit) {
            player.setDynamicProperty(`p:${count - maxLimit}`, undefined);
            player.setDynamicProperty(`p:${count - maxLimit}.5`, undefined);
        }
    }
}, 20);
const defaultPos = { x: 0, y: 1024, z: 0 };
