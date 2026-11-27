import { world, system, Player, ItemStack, EquipmentSlot } from "@minecraft/server"
import { apiDeathKnowledge, apiDeathKnowledgeXp, maxDeathKnowledgeXp } from "./lib/player/deathKnowledge"
import { apiNumber } from "./lib/math/number"
import { ActionFormData } from "@minecraft/server-ui"

world.afterEvents.itemUse.subscribe(({itemStack: item, source: entity}) => {
  const player = entity as Player
  if(!player.hasTag("dev")) return

  if(item.typeId == "minecraft:netherite_shovel"){
    // player.setDynamicProperty("dk:lv", 0)
    // player.setDynamicProperty("dk:xp", 0)
    // apiDeathKnowledgeXp.increaseXp(player, 525)
    // apiDeathKnowledgeXp.increaseXp(player, 15)
    // apiDeathKnowledgeXp.increaseXp(player, 1)
    // console.warn("Byte:", player.getDynamicPropertyTotalByteCount())
  }
  if(item.typeId == "minecraft:stick"){
    // apiDeathKnowledgeXp.increaseXp(player, -15)
    // apiDeathKnowledgeXp.increaseXp(player, -1)
    // apiDeathKnowledgeXp.increaseXp(player, -525)
    // player.clearDynamicProperties(); world.sendMessage(`Clear Dynamics`)
    // console.warn(player.getDynamicPropertyIds())
    player.getDynamicPropertyIds().filter(value => value.startsWith("p:")).forEach(value => player.setDynamicProperty(value, undefined)); world.sendMessage(`Clear Dynamics`)
    player.setDynamicProperty("count", undefined)
  }

  if(item.typeId == "minecraft:spyglass"){
    console.warn(JSON.stringify(player.getDynamicPropertyIds().filter(value => value.startsWith("p:") && !value.endsWith(".5")).sort((a, b) => Number(a.replace("p:", "")) - Number(b.replace("p:", "")))))
    console.warn(player.getDynamicPropertyTotalByteCount())
    // apiDeathKnowledgeXp.increaseXp(player, 15)
    // apiDeathKnowledgeXp.increaseXp(player, -maxDeathKnowledgeXp)
    // const cache = apiDeathKnowledge.getAll(player)
    // cache.upXp = 0
    // cache.upTpKey = 0
    // player.setDynamicProperty("dk:upXp", 0)
    // player.setDynamicProperty("dk:upTpKey", 0)
  }

  if(item.typeId == "minecraft:golden_carrot"){
    // apiDeathKnowledgeXp.increaseXp(player, -525)
  }
})