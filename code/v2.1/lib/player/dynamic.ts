import { world, Player } from "@minecraft/server"

export const apiPlayerDynamic = new class apiPlayerDynamic {
  addDeathCounter(player: Player): number {
    const deathCounter = this.getDeathCounter(player)
    player.setDynamicProperty("gravestone_death_path:death_counter", deathCounter +1)
    return deathCounter +1
  }

  deathPathCounter(player: Player): number {
    const count = player.getDynamicProperty("gravestone_death_path:death_path_count")
    if(count == undefined || typeof count != "number") return -1
    return count
  }

  getDeathCounter(player: Player): number {
    const dynamicCounter = player.getDynamicProperty("gravestone_death_path:death_counter")
    return typeof dynamicCounter != "number" ? 0 : dynamicCounter
  }
}