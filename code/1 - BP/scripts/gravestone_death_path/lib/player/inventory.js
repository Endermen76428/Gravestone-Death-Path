import { world } from "@minecraft/server";
export const apiInventory = new class apiInventory {
    getItems(inv, ids) {
        const items = [];
        for (let i = 0; i < inv.size; i++) {
            const slot = inv.getItem(i);
            if (!slot || slot.keepOnDeath == true)
                continue;
            if (!ids) {
                items.push({ item: slot, slot: i });
                continue;
            }
            if (ids.includes(slot.typeId))
                items.push({ item: slot, slot: i });
        }
        return items;
    }
    dropInventory(id) {
        const entity = world.getEntity(id);
        if (!entity)
            return;
        const inv = entity.getComponent("inventory")?.container;
        if (!inv)
            return;
        for (let i = 0; i < inv.size; i++) {
            const item = inv.getItem(i);
            if (item)
                entity.dimension.spawnItem(item, entity.location);
        }
        entity.remove();
        return;
    }
    setItem(playerInv, item, slot) {
        if (slot > playerInv.size)
            return;
        playerInv.setItem(slot, item);
    }
    decrementItem(playerInv, item, slot, reduce = 1) {
        if (item.amount - reduce <= 0)
            return this.setItem(playerInv, undefined, slot);
        item.amount -= reduce;
        this.setItem(playerInv, item, slot);
    }
};
