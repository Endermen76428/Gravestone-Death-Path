import { EntityComponentTypes, ItemStack, Player, world } from "@minecraft/server";
import { gravestoneGenerateTomb } from "../functions/gravestone/generate";
import { gravestoneSaveItens } from "../functions/gravestone/saveItens";
import { apiDeathKnowledge } from "../lib/player/deathKnowledge";
import { apiScoreboard } from "../../0-lib/math/scoreboard";
import { apiItemDynamic } from "../lib/item/dynamic";
import { apiWarn } from "../../0-lib/player/warn";
world.afterEvents.entityDie.subscribe(({ deadEntity: player, damageSource }) => {
    if (player.typeId != "minecraft:player" || !(player instanceof Player))
        return;
    const deathCounter = (r => typeof r != "number" ? 1 : r + 1)(player.getDynamicProperty("gravestone_death_path:death_counter"));
    player.setDynamicProperty("gravestone_death_path:death_counter", deathCounter);
    const playerItems = gravestoneSaveItens.getInventory(player);
    if (!playerItems)
        return;
    const block = gravestoneGenerateTomb.generate(player, damageSource.damagingEntity?.typeId);
    if (!block)
        return;
    const gravestoneEntity = player.dimension.spawnEntity("gravestone_death_path:gravestone_entity", { x: block.x + 0.5, y: block.y + 0.1, z: block.z + 0.5 });
    const gravestoneInventory = gravestoneEntity.getComponent(EntityComponentTypes.Inventory)?.container;
    if (!gravestoneInventory)
        return;
    playerItems.forEach(({ slot, item }) => gravestoneInventory.setItem(slot, item));
    gravestoneEntity.setProperty("gravestone_death_path:xp", player.getTotalXp() * (apiDeathKnowledge.get(player, "upXp") * 0.1));
    player.resetLevel();
    apiWarn.notify(player, { "rawtext": [{ "translate": "dimension.gravestone_death_path:die1", with: [`§cx: ${Math.floor(player.location.x)}, §by: ${Math.floor(player.location.y)}, §az: ${Math.floor(player.location.z)}§r`] }, { "translate": `dimension.gravestone_death_path:${player.dimension.id.replace("minecraft:", "")}` }, { "translate": "dimension.gravestone_death_path:die2" }] });
    apiScoreboard.setScore(`gravestone_death_path:${player.id}`, `${block.x},${block.y},${block.z}`, 0);
    player.setDynamicProperty("lastDeath", block.location);
    const random = Math.random();
    const tpChange = (apiDeathKnowledge.get(player, "upTpKey") * 0.1);
    const keyId = tpChange == 0 ? "gravestone_death_path:gravestone_key" : tpChange == 1 ? "gravestone_death_path:gravestone_key_tp" : random < tpChange ? "gravestone_death_path:gravestone_key_tp" : "gravestone_death_path:gravestone_key";
    const key = new ItemStack(keyId);
    key.setLore([`§7Death ${deathCounter}: §cx: ${block.x}, §by: ${block.y}, §az: ${block.z}§r`]);
    apiItemDynamic.transferDeathPath(player, key, block.location);
    player.getComponent(EntityComponentTypes.Inventory)?.container.addItem(key);
});
