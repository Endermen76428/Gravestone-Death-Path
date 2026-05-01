import { world, Block, Player, EquipmentSlot, system } from "@minecraft/server"
import { apiEquippable } from "../lib/player/equippable"
import { apiInventory } from "../lib/player/inventory"
import { apiVec3 } from "../lib/math/vector"
import { apiWarn } from "../lib/player/warn"
import { apiXp } from "../lib/player/xp"

export function collectGravestone(block: Block, player: Player, removeKey = false): void {
  const graveE = block.dimension.getEntities({type: "gravestone_death_path:gravestone_entity", location: apiVec3.bottomCenter(block.location), maxDistance: 1, closest: 1})[0]
  const playerEquip = player.getComponent("equippable")
  const playerInv = player.getComponent("inventory")?.container
  const graveInv = graveE?.getComponent("inventory")?.container

  if(!graveE || !playerEquip || !playerInv || !graveInv){
    if(removeKey){
      apiEquippable.setItem(player, EquipmentSlot.Mainhand, undefined)
      apiWarn.notify(player, "warning.gravestone_death_path:gravestone.already_collected", {sound: "gravestone_death_path.warn.pop"})
    }
    return
  }

  if(removeKey){
    const blockItem = block.getItemStack()
    playerEquip.setEquipment("Mainhand", undefined)
    player.playSound("gravestone_death_path.block.gravestone.open", {volume: 0.5})
    block.setType("minecraft:air")
    if(blockItem && world.gameRules.doTileDrops == true) block.dimension.spawnItem(blockItem, apiVec3.bottomCenter(block.location))
  }

  apiInventory.transferItemsToInventory(playerInv, graveInv)
  apiEquippable.transferItemsToInventory(playerEquip, graveInv, playerInv)
  apiXp.transferXpToPlayer(graveE, player)
  system.runTimeout(() => { try{ graveE.remove() } catch {} }, 5)
}