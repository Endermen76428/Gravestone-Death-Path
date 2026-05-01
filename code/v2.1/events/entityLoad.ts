import { apiInventory } from "../lib/player/inventory"
import { world } from "@minecraft/server"

world.afterEvents.entityLoad.subscribe(({entity}) => {
  if(entity.typeId == "gravestone_death_path:gravestone_entity"){
    const block = entity.dimension.getBlock(entity.location)
    if(block == undefined || block.getTags().includes("gravestone_death_path:gravestone")) return

    apiInventory.dropInventory(entity.id)
  }
})