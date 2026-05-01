import { world, Player, BlockPermutation, ItemStack } from "@minecraft/server"
import { apiSafeArea, canReplace, needMove } from "../lib/block/safeArea"
import { gravestoneEasterEgg, gravestoneIds } from "../variables"
import { apiEquippable } from "../lib/player/equippable"
import { apiPlayerDynamic } from "../lib/player/dynamic"
import { apiInventory } from "../lib/player/inventory"
import { apiItemDynamic } from "../lib/item/dynamic"
import { apiVec3 } from "../lib/math/vector"
import { apiWarn } from "../lib/player/warn"
import { apiXp } from "../lib/player/xp"

world.afterEvents.entityDie.subscribe(({deadEntity: entity, damageSource: source}) => {
  if(entity.typeId != "minecraft:player") return
  const player = entity as Player
  const playerEquip = player.getComponent("equippable")
  const playerInv = player.getComponent("inventory")?.container

  if(!playerEquip || !playerInv) return
  if(apiInventory.getItems(playerInv).length < 1 && apiEquippable.getItems(playerEquip).length < 1) return

  const pos = apiSafeArea.getSafePos(player.location, player.dimension)
  const blockBelow = player.dimension.getBlock(apiVec3.offset(pos, apiVec3.offsetDirection["Down"]))

  const degress = player.getRotation().y +180
  const dir = apiVec3.directions4[degress < 45 || degress > 315 ? 2 : degress > 45 && degress < 135 ? 3 : degress > 135 && degress < 225 ? 0 : 1]
  const graveId = getGravestoneId(player.dimension.id, source.damagingEntity?.typeId)

  player.dimension.setBlockPermutation(pos, BlockPermutation.resolve(graveId, {"minecraft:cardinal_direction": dir.toLowerCase()}))
  if(blockBelow) if(needSoil.includes(blockBelow.typeId)) blockBelow.setType(dimensionSoil[player.dimension.id] ?? "minecraft:dirt")

  const graveE = player.dimension.spawnEntity("gravestone_death_path:gravestone_entity", apiVec3.offset(apiVec3.bottomCenter(pos), apiVec3.divide(apiVec3.offsetDirection["Up"], 20)))
  const graveInv = graveE.getComponent("inventory")?.container
  if(!graveInv) return

  player.setDynamicProperty("gravestone_death_path:death_path_count", undefined)

  apiEquippable.transferItemsToGravestone(playerEquip, graveInv)
  apiInventory.transferItemsToGravestone(playerInv, graveInv)
  apiXp.transferXpToGravestone(graveE, player)
  apiWarn.notify(player, {"rawtext":[{"translate": "dimension.gravestone_death_path:die1", with: [`§cx: ${pos.x}, §by: ${pos.y}, §az: ${pos.z}§r`]}, {"translate": `dimension.gravestone_death_path:${player.dimension.id.replace("minecraft:", "")}`}, {"translate": "dimension.gravestone_death_path:die2"}]})

  const deathCounter = apiPlayerDynamic.addDeathCounter(player)

  const key = new ItemStack("gravestone_death_path:gravestone_key")
  key.setLore([`§7Death ${deathCounter}: §cx: ${pos.x}, §by: ${pos.y}, §az: ${pos.z}§r`])
  key.setDynamicProperty("gravestone_death_path:death_info", player.id)
  playerInv.addItem(apiItemDynamic.transferDeathPath(player, key, pos))
})

function getGravestoneId(dimension: string, source?: string): string {
  const blockId = `gravestone_death_path:gravestone${dimensionIds[dimension] ?? ""}`
  if(Math.random() * 100 < 1) return `${blockId}_${gravestoneEasterEgg[Math.floor(Math.random() * gravestoneEasterEgg.length)]}`

  const graveId = `${blockId}_${source?.replace("minecraft:", "")}`
  if(gravestoneIds.includes(graveId)) return graveId
  return blockId
}

const dimensionIds: { [key: string]: string } = {
  "minecraft:nether": "_nether",
  "minecraft:the_end": "_end"
}

const needSoil = [...canReplace, ...needMove]

const dimensionSoil: { [key: string]: string } = {
  "minecraft:overworld": "minecraft:dirt",
  "minecraft:nether": "minecraft:netherrack",
  "minecraft:the_end": "minecraft:end_stone"
}