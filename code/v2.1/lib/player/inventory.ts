import { world, ItemStack, Container, system } from "@minecraft/server"
import { apiEquippable } from "./equippable"

export const apiInventory = new class apiInventory {
  getItems(inv: Container, ids?: string | string[]): ItemSlot[] {
    const items: ItemSlot[] = []
    for(let i = 0; i < inv.size; i++){
      const slot = inv.getItem(i)
      if(!slot || slot.keepOnDeath == true) continue
      if(!ids){ items.push({item: slot, slot: i}); continue }
      if(ids.includes(slot.typeId)) items.push({item: slot, slot: i})
    }
    return items
  }

  getEmptySlots(inv: Container): number[] {
    const empty: number[] = []
    for(let i = 0; i < inv.size; i++){
      if(inv.getItem(i) == undefined) empty.push(i)
    }
    return empty
  }

  transferItemsToGravestone(playerInv: Container, graveInv: Container): void {
    for(let i = 0; i < playerInv.size; i++){
      const item = playerInv.getItem(i)
      if(item?.keepOnDeath != true){
        graveInv.setItem(i, item)
        playerInv.setItem(i, undefined)
      }
    }
  }

  transferItemsToInventory(playerInv: Container, graveInv: Container): void {
    for(let i = 0; i < playerInv.size; i++){
      const graveSlot = graveInv.getItem(i)
      if(graveSlot != undefined) playerInv.swapItems(i, i, graveInv)
    }
    apiEquippable.transferItemsToInventoryOldItems(graveInv, playerInv)
  }

  async transferItemsToInventoryOldItems(graveInv: Container, playerInv: Container): Promise<void> {
    await system.waitTicks(1)
    for(let i = 0; i < playerInv.size; i++){
      if(playerInv.emptySlotsCount < 1) return
      const graveSlot = graveInv.getItem(i)
      if(graveSlot == undefined) continue
      playerInv.addItem(graveSlot)
      graveInv.setItem(i, undefined)
    }
  }

  dropInventory(id: string): void {
    const entity = world.getEntity(id)
    if(!entity) return
    const inv = entity.getComponent("inventory")?.container
    if(!inv) return
    for(let i = 0; i < inv.size; i++){
      const item = inv.getItem(i)
      if(item) entity.dimension.spawnItem(item, entity.location)
    }
    entity.remove()
    return
  }

  setItem(playerInv: Container, item: ItemStack | undefined, slot: number): void {
    if(slot > playerInv.size) return
    playerInv.setItem(slot, item)
  }

  decrementItem(playerInv: Container, item: ItemStack, slot: number, reduce = 1): void {
    if(item.amount - reduce <= 0) return this.setItem(playerInv, undefined, slot)

    item.amount -= reduce
    this.setItem(playerInv, item, slot)
  }
}

interface ItemSlot {
  item: ItemStack,
  slot: number
}