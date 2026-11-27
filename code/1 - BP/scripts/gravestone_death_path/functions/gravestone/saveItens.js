import { EntityComponentTypes, EquipmentSlot } from "@minecraft/server";
export const equippableSlotsIds = [EquipmentSlot.Head, EquipmentSlot.Chest, EquipmentSlot.Legs, EquipmentSlot.Feet, EquipmentSlot.Offhand];
export const gravestoneSaveItens = new class GravestoneSaveItens {
    getInventory(player) {
        const inventory = player.getComponent(EntityComponentTypes.Inventory)?.container;
        const equippable = player.getComponent(EntityComponentTypes.Equippable);
        if (!inventory || !equippable)
            return;
        const inv = new Array(inventory.size + 5);
        let i = 0;
        for (let slot = 0; slot < inventory.size; slot++) {
            const item = inventory.getItem(slot);
            if (item && item.keepOnDeath == false && !item.hasTag("gravestone_death_path:gravestone_key")) {
                i++;
                inv[slot] = { item, slot };
                inventory.setItem(slot, undefined);
            }
        }
        equippableSlotsIds.forEach((slot, i) => {
            const item = equippable.getEquipment(slot);
            if (item && item.keepOnDeath == false) {
                i++;
                inv[inventory.size + i] = { item, slot: i + 94 };
                equippable.setEquipment(slot, undefined);
            }
        });
        if (i == 0)
            return;
        return inv;
    }
};
