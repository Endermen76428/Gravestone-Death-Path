import { world, system, ItemStack, Container, EquipmentSlot, EntityEquippableComponent, Player } from "@minecraft/server"
import { apiInventory } from "./inventory"

const slotsId = Object.values(EquipmentSlot)

export const apiEquippable = new class apiEquippable {
  getItems(equippable: EntityEquippableComponent, ids?: string | string[]): ItemSlot[] {
    const items = []
    for(const slot of slotsId){
      const item = equippable.getEquipment(slot)
      if(!item || item.keepOnDeath == true) continue
      if(!ids){ items.push({item: item, slot: slot}); continue }
      if(ids.includes(item.typeId)) items.push({item: item, slot: slot})
    }
    return items
  }

  setItem(player: Player, slot: EquipmentSlot, item?: ItemStack): void {
    const comp = player.getComponent("equippable")
    if(!comp) return

    comp.setEquipment(slot, item)
  }

  transferItemsToGravestone(equippable: EntityEquippableComponent, graveInv: Container): void {
    for(let i = 0; i < slotsId.length; i++){
      const id = slotsId[i]
      if(id && id != EquipmentSlot.Mainhand){
        const item = equippable.getEquipment(id)
        if(item?.keepOnDeath != true){
          graveInv.setItem(graveInv.size -i -1, item)
          equippable.setEquipment(id, undefined)
        }
      }
    }
  }

  transferItemsToInventory(equippable: EntityEquippableComponent, graveInv: Container, playerInv: Container): void {
    for(let i = 0; i < slotsId.length; i++){
      const id = slotsId[i]
      if(id && id != EquipmentSlot.Mainhand){
        const graveSlot = graveInv.getItem(graveInv.size -i -1)
        if(graveSlot == undefined) continue
        const oldItem = equippable.getEquipment(id)
        if(oldItem != undefined){
          graveInv.setItem(graveInv.size -i -1, oldItem)
        } else graveInv.setItem(graveInv.size -i -1, undefined)
        equippable.setEquipment(id, graveSlot)
      }
    }
    apiInventory.transferItemsToInventoryOldItems(graveInv, playerInv)
  }

  async transferItemsToInventoryOldItems(graveInv: Container, playerInv: Container): Promise<void> {
    await system.waitTicks(1)
    for(let i = 0; i < slotsId.length; i++){
      if(playerInv.emptySlotsCount < 1) return
      const id = slotsId[i]
      if(id && id != EquipmentSlot.Mainhand){
        const graveSlot = graveInv.getItem(graveInv.size -i -1)
        if(graveSlot == undefined) continue
        playerInv.addItem(graveSlot)
        graveInv.setItem(graveInv.size -i -1, undefined)
      }
    }
  }
}

interface ItemSlot {
  item: ItemStack,
  slot: EquipmentSlot
}