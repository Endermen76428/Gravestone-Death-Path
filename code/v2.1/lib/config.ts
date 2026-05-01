import { world } from "@minecraft/server"

export const apiConfig = new class apiConfig {
  getTpState(): boolean {
    const score = world.scoreboard.getObjective("gravestone_death_path_teleport_setting")?.getScore("tp")
    return score == undefined ? true : (score == 1 ? true : false)
  }
}