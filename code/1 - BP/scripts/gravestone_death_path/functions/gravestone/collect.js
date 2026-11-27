import { apiDeathKnowledge, apiDeathKnowledgeXp, maxDeathKnowledgeXp } from "../../lib/player/deathKnowledge";
import { EntityComponentTypes, EquipmentSlot } from "@minecraft/server";
import { apiScoreboard } from "../../../0-lib/math/scoreboard";
import { cacheDeathPathBykey } from "../deathPath/locator";
import { apiConfigAdmin } from "../../lib/configAdmin";
import { apiWarn } from "../../../0-lib/player/warn";
import { apiConfig } from "../../lib/player/config";
import { apiTimer } from "../../lib/player/timer";
import { equippableSlotsIds } from "./saveItens";
export function collectGravestone(block, player) {
    const gravestoneEntity = block.dimension.getEntities({ type: "gravestone_death_path:gravestone_entity", location: block.bottomCenter(), maxDistance: 0.5, closest: 1 })[0];
    if (!gravestoneEntity) {
        block.setPermutation(block.permutation.withState("gravestone_death_path:breakable", true));
        return apiWarn.notify(player, "block.warn.gravestone_death_path:gravestone.already_collected", { sound: "warn.gravestone_death_path:pop" });
    }
    const playerEquip = player.getComponent(EntityComponentTypes.Equippable);
    const playerInv = player.getComponent(EntityComponentTypes.Inventory)?.container;
    const gravestoneInv = gravestoneEntity?.getComponent(EntityComponentTypes.Inventory)?.container;
    if (!playerEquip || !playerInv || !gravestoneInv)
        return;
    const item = playerEquip.getEquipment(EquipmentSlot.Mainhand);
    if (apiConfigAdmin.get("needKey")) {
        if (!item?.hasTag("gravestone_death_path:gravestone_key"))
            return apiWarn.notify(player, "block.warn.gravestone_death_path:collect.key.need_key", { sound: "warn.gravestone_death_path:bass" });
        const pos = (r => typeof r != "object" ? undefined : r)(item.getDynamicProperty("last"));
        if (!pos)
            return apiWarn.notify(player, "item.warn.gravestone_death_path:key.corrupted", { sound: "warn.gravestone_death_path:break" });
        if (block.x != pos.x || block.y != pos.y || block.z != pos.z)
            return apiWarn.notify(player, "block.warn.gravestone_death_path:collect.key.other_gravestone", { sound: "warn.gravestone_death_path:bass" });
        playerEquip.setEquipment(EquipmentSlot.Mainhand, undefined);
    }
    if (item) {
        cacheDeathPathBykey.delete(`${player.id}${item.getLore()[0] ?? ""}`);
    }
    else {
        for (const key of cacheDeathPathBykey.keys()) {
            if (key.startsWith(player.id))
                cacheDeathPathBykey.delete(key);
        }
    }
    const currentDeathKnowledgeXp = apiDeathKnowledge.get(player, "xp");
    if (currentDeathKnowledgeXp < maxDeathKnowledgeXp)
        if (apiTimer.checkCooldown(player, "timer:death_knowledge").finished) {
            apiTimer.setCooldown(player, "timer:death_knowledge", 300);
            apiDeathKnowledgeXp.increaseXp(player, 1);
        }
    for (let i = 0; i < playerInv.size; i++)
        gravestoneInv.swapItems(i, i, playerInv);
    equippableSlotsIds.forEach((slot, i) => {
        const graveItem = gravestoneInv.getItem(i + 95);
        if (graveItem) {
            const playerItem = playerEquip.getEquipment(slot);
            playerEquip.setEquipment(slot, graveItem);
            if (playerItem) {
                gravestoneInv.setItem(i + 95, playerItem);
            }
            else {
                gravestoneInv.setItem(i + 95, undefined);
            }
        }
    });
    let emptySlots = playerInv.emptySlotsCount;
    for (let i = 0; i < gravestoneInv.size; i++) {
        const item = gravestoneInv.getItem(i);
        if (item) {
            if (emptySlots != 0) {
                if (item) {
                    playerInv.addItem(item);
                    gravestoneInv.setItem(i, undefined);
                    emptySlots -= 1;
                }
            }
            else {
                player.dimension.spawnItem(item, block.center());
            }
        }
    }
    for (let i = 0; i < gravestoneInv.size; i++) {
        const item = gravestoneInv.getItem(i);
        item && player.dimension.spawnItem(item, block.center());
    }
    const xp = (r => typeof r != "number" ? 0 : r)(gravestoneEntity.getProperty("gravestone_death_path:xp"));
    player.addExperience(xp);
    apiScoreboard.setScore(`gravestone_death_path:${player.id}`, `${block.x},${block.y},${block.z}`, undefined);
    if (apiConfig.get(player, "dropGrave")) {
        const graveItem = block.getItemStack();
        graveItem && block.dimension.spawnItem(graveItem, { x: block.x + 0.5, y: block.y, z: block.z + 0.5 });
    }
    block.setType("minecraft:air");
    block.dimension.playSound("block.gravestone_death_path:gravestone.open", block.location);
    gravestoneEntity.remove();
}
