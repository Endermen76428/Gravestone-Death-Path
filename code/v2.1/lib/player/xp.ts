import { world, Entity, Player } from "@minecraft/server"

export const apiXp = new class apiXp {
  transferXpToGravestone(gravestone: Entity, player: Player): void {
    if(player.level < 0 || player.level > 999999) return
    gravestone.setProperty("gravestone_death_path:xp", player.level * 0.9)
    player.addLevels(-(2 ** 24))
  }

  transferXpToPlayer(gravestone: Entity, player: Player): void {
    const xp = gravestone.getProperty("gravestone_death_path:xp")
    if(typeof xp != "number" || xp <= 0) return
    if(xp >= 24791){ player.addLevels(24791) } else player.addLevels(xp)
  }
}