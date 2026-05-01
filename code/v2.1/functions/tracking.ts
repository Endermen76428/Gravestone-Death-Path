import { world, system, Vector3 } from "@minecraft/server"
import { apiPlayerDynamic } from "../lib/player/dynamic"
import { apiVec3 } from "../lib/math/vector"

const allLastPos = new Map<string, Vector3>()

const maxLimit = (5 * 60) -2

system.runInterval(() => {
  for(const player of world.getAllPlayers()){
    if(!allLastPos.has(player.id)) allLastPos.set(player.id, player.location)
    const lastpos = allLastPos.get(player.id)
    if(!lastpos) continue
    if(apiVec3.distance3(player.location, lastpos) < 4) continue

    allLastPos.set(player.id, player.location)
    const count = apiPlayerDynamic.deathPathCounter(player)
    player.setDynamicProperty(`gravestone_death_path:death_path_count`, count +1)
    player.setDynamicProperty(`gravestone_death_path:death_path_point_${String(count +1).padStart(10, "0")}`, JSON.stringify({pos: apiVec3.bottomCenter(player.location), dimension: player.dimension.id}))
    if(count >= maxLimit) player.setDynamicProperty(`gravestone_death_path:death_path_point_${String(count -maxLimit).padStart(10, "0")}`, undefined)
  }
}, 20)