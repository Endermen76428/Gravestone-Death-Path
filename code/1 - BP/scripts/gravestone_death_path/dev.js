import { world } from "@minecraft/server";
world.afterEvents.itemUse.subscribe(({ itemStack: item, source: entity }) => {
    const player = entity;
    if (!player.hasTag("dev"))
        return;
    if (item.typeId == "minecraft:netherite_shovel") {
    }
    if (item.typeId == "minecraft:stick") {
        player.getDynamicPropertyIds().filter(value => value.startsWith("p:")).forEach(value => player.setDynamicProperty(value, undefined));
        world.sendMessage(`Clear Dynamics`);
        player.setDynamicProperty("count", undefined);
    }
    if (item.typeId == "minecraft:spyglass") {
        console.warn(JSON.stringify(player.getDynamicPropertyIds().filter(value => value.startsWith("p:") && !value.endsWith(".5")).sort((a, b) => Number(a.replace("p:", "")) - Number(b.replace("p:", "")))));
        console.warn(player.getDynamicPropertyTotalByteCount());
    }
    if (item.typeId == "minecraft:golden_carrot") {
    }
});
