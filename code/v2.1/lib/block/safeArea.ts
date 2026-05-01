import { world, BlockVolume, Dimension, Vector3 } from "@minecraft/server"
import { apiNumber } from "../math/number"
import { apiVec3 } from "../math/vector"

export const apiSafeArea = new class apiSafeArea {
  getSafePos(deathPoint: Vector3, dimension: Dimension): Vector3 {
    const y = apiNumber.clamp(deathPoint.y, dimension.heightRange.min +5, dimension.heightRange.max -1)
    deathPoint["y"] = y

    const block = dimension.getBlock(deathPoint)
    if(!block) return deathPoint

    if(needMove.includes(block.typeId) || !canReplace.includes(block.typeId)){
      const blocks = dimension.getBlocks(new BlockVolume(apiVec3.offset(deathPoint, {x: -5, y: -10, z: -5}), apiVec3.offset(deathPoint, {x: 5, y: 10, z: 5})), {includeTypes: canReplace})
      const pos = [...blocks.getBlockLocationIterator()].reduce((last, curPos) => {
        return apiVec3.distance3(deathPoint, curPos) < apiVec3.distance3(deathPoint, last) ? curPos : last
      }, {x: 0, y: 1028, z: 0})
      if(!apiVec3.compare(pos, {x: 0, y: 1028, z: 0})){ return pos }
    }

    return apiVec3.floor(deathPoint)
  }
}

export const canReplace = [
  "minecraft:air",
  "minecraft:fern",
  "minecraft:large_fern",
  "minecraft:short_dry_grass",
  "minecraft:short_grass",
  "minecraft:tall_dry_grass",
  "minecraft:tall_grass",
  "minecraft:vine"
]

export const needMove = ["minecraft:flowing_lava", "minecraft:lava", "minecraft:flowing_water", "minecraft:water"]