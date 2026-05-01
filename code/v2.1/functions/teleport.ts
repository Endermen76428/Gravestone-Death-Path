import { world, ItemStack, EquipmentSlot, Player } from "@minecraft/server"
import { apiEquippable } from "../lib/player/equippable"
import { apiInventory } from "../lib/player/inventory"
import { apiItemDynamic } from "../lib/item/dynamic"
import { apiWarn } from "../lib/player/warn"
import { apiVec3 } from "../lib/math/vector"
import { apiConfig } from "../lib/config"

export function teleportToGravestone(player: Player, item: ItemStack): void {
  if(!apiConfig.getTpState()) return apiWarn.notify(player, "warning.gravestone_death_path:gravestone_key.teleport_disabled", {sound: "gravestone_death_path.warn.break"})

  const inv = player.getComponent("inventory")?.container
  if(!inv) return

  const graveInfo = apiItemDynamic.getDeathPath(item)
  const gravePos = graveInfo[graveInfo.length -1]
  if(!gravePos){
    apiEquippable.setItem(player, EquipmentSlot.Mainhand, undefined)
    return apiWarn.notify(player, "warning.gravestone_death_path:gravestone_key.corrupted", {sound: "gravestone_death_path.warn.break"})
  }

  const pearl = apiInventory.getItems(inv, "minecraft:ender_pearl")[0]
  if(!pearl) return apiWarn.notify(player, "warning.gravestone_death_path:gravestone_key.teleport", {sound: "gravestone_death_path.warn.bass"})

  apiInventory.decrementItem(inv, pearl.item, pearl.slot)
  player.teleport(apiVec3.offset(gravePos.pos, {x: 0, y: 0.25, z: 0}), {dimension: world.getDimension(gravePos.dimension)})
  apiWarn.notify(player, "", {sound: "gravestone_death_path.item.gravestone_key.teleport", delaySound: 5, particle: {id: "gravestone_death_path:teleport_particle", pos: gravePos.pos}, delayParticle: 5})
}