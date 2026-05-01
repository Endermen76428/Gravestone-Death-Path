import { world, ItemStack, Player, Vector3 } from "@minecraft/server"
import { apiVec3 } from "../math/vector"

export const apiItemDynamic = new class apiItemDynamic {
  transferDeathPath(player: Player, item: ItemStack, lastPos: Vector3): ItemStack {
    player.getDynamicPropertyIds().filter(value => value.startsWith("gravestone_death_path:death_path_point_")).forEach((value, index, points) => {
      item.setDynamicProperty(value.replace("gravestone_death_path:death_path_point_", "pos_"), player.getDynamicProperty(value))
      player.setDynamicProperty(value, undefined)
      if(index >= points.length -1){
        item.setDynamicProperty(`pos_${String(parseInt(value.replace("gravestone_death_path:death_path_point_", "")) +1).padStart(10, "0")}`, JSON.stringify({pos: apiVec3.bottomCenter(lastPos), dimension: player.dimension.id}))
      }
    })
    return item
  }

  getDeathPath(item: ItemStack): DeathPoint[] {
    return item.getDynamicPropertyIds()
    .filter(value => value.startsWith("pos_"))
    .sort()
    .map(value => {
      const info = item.getDynamicProperty(value)
      if(typeof info != "string") return
      return JSON.parse(info)
    })
    .filter(value => this.isDeathPoint(value))
  }

  getDeathInfo(item: ItemStack): string | undefined {
    const dynamic = item.getDynamicProperty("gravestone_death_path:death_info")
    if(typeof dynamic != "string") return
    return dynamic
  }

  private isDeathPoint(obj: any): obj is DeathPoint {
    return obj &&
    typeof obj == "object" &&
    typeof obj.pos == "object" &&
    typeof obj.dimension == "string"
  }
}

interface DeathPoint {
  pos: Vector3,
  dimension: string
}