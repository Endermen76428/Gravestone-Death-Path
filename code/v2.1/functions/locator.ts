import { world, system, ItemStack, Block, Dimension, Player, Vector3, Entity } from "@minecraft/server"
import { apiItemDynamic } from "../lib/item/dynamic"
import { apiVec3 } from "../lib/math/vector"
import { apiWarn } from "../lib/player/warn"

const currentPoints = new Map<number, Vector3[]>()
let pointMapIndex = 0
const animationStep = 10

export const deathPath = new class deathPath {
  start(player: Player, item: ItemStack, block: Block): void {
    const deathInfo = apiItemDynamic.getDeathInfo(item)
    if(deathInfo == undefined) return apiWarn.notify(player, "warning.gravestone_death_path:gravestone_key.corrupted", {sound: "gravestone_death_path.warn.break"})

    player.dimension.getEntities({type: "gravestone_death_path:ghost", tags: [`gravestone_death_path.owner: ${player.id}`]}).forEach(entity => entity.remove())
    const points = apiItemDynamic.getDeathPath(item)

    if(points.length < 1) return

    const positions = points.map(value => value.pos)
    // const dimensions = points.map(value => value.dimension)

    const blockPos = apiVec3.bottomCenter(apiVec3.offset(block.location, apiVec3.offsetDirection["Up"]))
    const index = this.getClosestPoint(block.location, positions)

    const pos = positions[index]
    const nextPos = positions[index +1]

    const ghost = block.dimension.spawnEntity("gravestone_death_path:ghost", blockPos)
    ghost.addTag(`gravestone_death_path.owner: ${player.id}`)

    currentPoints.delete(pointMapIndex -7)
    pointMapIndex++
    currentPoints.set(pointMapIndex, positions)
    if(pos){
      this.updateRotate(ghost, nextPos ? nextPos : pos)
      this.startMove(ghost, index)
    }

    this.generateParticles(player.dimension, positions, index +1)
  }

  private async startMove(entity: Entity, index: number): Promise<void> {
    const points = currentPoints.get(pointMapIndex)
    if(!points) return
    const pos = points[index]
    const pos1 = points[index +1]
    const pos2 = points[index +2]
    const pos3 = points[index +3]
    if(!pos) return entity.triggerEvent("gravestone_death_path:despawn_ghost")
    const distance1 = apiVec3.divide(apiVec3.distanceXYZ(apiVec3.bottomCenter(entity.location), apiVec3.bottomCenter(pos1 ? pos1 : pos)), animationStep)
    const distance2 = apiVec3.divide(apiVec3.distanceXYZ(apiVec3.bottomCenter(pos1 ? pos1 : entity.location), apiVec3.bottomCenter(pos2 ? pos2 : pos)), animationStep)
    const distance3 = apiVec3.divide(apiVec3.distanceXYZ(apiVec3.bottomCenter(pos2 ? pos2 : entity.location), apiVec3.bottomCenter(pos3 ? pos3 : pos)), animationStep)
    try {
      await system.waitTicks(20 * 1.6)
      this.moveHere(entity, distance1)

      await system.waitTicks(11)
      if(!pos2) return entity.triggerEvent("gravestone_death_path:despawn_ghost")
      this.updateRotate(entity, pos2)
      this.moveHere(entity, distance2)

      await system.waitTicks(11)
      if(!pos3) return entity.triggerEvent("gravestone_death_path:despawn_ghost")
      this.updateRotate(entity, pos3)
      this.moveHere(entity, distance3)
    } catch {}
  }

  async continueMoving(entity: Entity): Promise<void> {
    const points = currentPoints.get(pointMapIndex)
    if(!points) return

    const index = this.getClosestPoint(entity.location, points)
    const pos = points[index +1]

    try {
      if(pos){
        const distance = apiVec3.divide(apiVec3.distanceXYZ(apiVec3.bottomCenter(entity.location), apiVec3.bottomCenter(pos ? pos : entity.location)), animationStep)

        entity.setDynamicProperty("gravestone_death_path:ghost_animation_step", 0)
        if(pos) this.updateRotate(entity, pos)

        return this.moveHere(entity, distance)
      }

      await system.waitTicks(11)
      entity.triggerEvent("gravestone_death_path:despawn_ghost")
    } catch {}
  }

  async moveHere(entity: Entity, distance: Vector3): Promise<void> {
    try {
      const step = entity.getDynamicProperty("gravestone_death_path:ghost_animation_step") ?? 0
      if(typeof step != "number" || step >= animationStep) return entity.setDynamicProperty("gravestone_death_path:ghost_animation_step", undefined)
      entity.setDynamicProperty("gravestone_death_path:ghost_animation_step", step +1)

      entity.tryTeleport(apiVec3.offset(entity.location, distance))
      await system.waitTicks(1)
      this.moveHere(entity, distance)
    } catch {}
  }

  private updateRotate(entity: Entity, nextPos: Vector3){
    const currentPos = apiVec3.bottomCenter(entity.location)
    const newPos = apiVec3.bottomCenter(nextPos)
    const degress = Math.floor(Math.atan2(currentPos.z - newPos.z, currentPos.x - newPos.x) * (180 / Math.PI)) +90
    entity.setProperty("gravestone_death_path:rotate", degress)
  }

  private async generateParticles(dimension: Dimension, points: Vector3[], start = 0): Promise<void> {
    for(let i = start; i < points.length; i++){
      const pos = points[i]
      try{ if(pos) dimension.spawnParticle("gravestone_death_path:ghost_shadow", pos) } catch {}
      await system.waitTicks(3)
    }
  }

  private getClosestPoint(playerPos: Vector3, points: Vector3[]): number {
    const index = points
    .map((value, idx) => {
      const distance = apiVec3.distance3(playerPos, value)
      const weight = 1 + (idx / (points.length - 1))
      return distance / weight
    })
    .reduce((minIdx, dist, idx, arr) => {
      if(arr[minIdx]) return dist < arr[minIdx] ? idx : minIdx
      return minIdx
    }, 0)
    return index
  }
}