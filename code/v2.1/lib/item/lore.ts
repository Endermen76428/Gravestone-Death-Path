import { world, ItemStack, Vector3 } from "@minecraft/server"
import { apiVec3 } from "../math/vector"

export const apiLore = new class apiLore {
  getDeathPos(item: ItemStack, index = 0): Vector3 | undefined {
    const lore = item.getLore()
    if(lore[index] == undefined) return
    const subjects = lore[index].split(" ").slice(3)
    const coords = [subjects[0], subjects[2], subjects[4]].filter(value => value !== undefined).map(value => (parseInt(value)))
    if(coords.length < 3) return
    return apiVec3.create(...coords)
  }
}