import { apiDeathKnowledge } from "../lib/player/deathKnowledge"
import { apiConfig } from "../lib/player/config"
import { world } from "@minecraft/server"

world.afterEvents.playerSpawn.subscribe(({player, initialSpawn}) => {
  if(initialSpawn){
    apiConfig.load(player)
    apiDeathKnowledge.load(player)
    return
  }
})