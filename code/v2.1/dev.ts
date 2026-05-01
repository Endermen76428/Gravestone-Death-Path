import { world, system, Player, Entity, Vector3 } from "@minecraft/server"
import { apiSafeArea } from "./lib/block/safeArea"
import { apiVec3 } from "./lib/math/vector"

world.afterEvents.itemUse.subscribe(({itemStack: item, source: entity}) => {
  const player = entity as Player
  if(!player.hasTag("dev")) return
  if(item.typeId == "minecraft:netherite_shovel") world.sendMessage(`${player.getDynamicPropertyIds().filter(value => value.startsWith("gravestone_death_path:death_path_point_")).map(value => (value.replace("gravestone_death_path:death_path_point_", ""))).sort()}`)
  if(item.typeId == "minecraft:stick"){ player.clearDynamicProperties(); world.sendMessage(`Clear Dynamics`) }
  if(item.typeId == "minecraft:golden_carrot"){ world.sendMessage(`${JSON.stringify(apiSafeArea.getSafePos(player.location, player.dimension))}`) }
  // if(item.typeId == "gravestone_death_path:gravestone_key"){ world.sendMessage(`${JSON.stringify(item.getDynamicProperty("pos_-1"))}`) }
})