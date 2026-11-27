import { apiDeathKnowledgeXp, maxDeathKnowledgeXp } from "../../lib/player/deathKnowledge"
import { apiNumbers } from "../../../0-lib/math/numbers"
import { Player } from "@minecraft/server"

export function deathKnowledgeXpHandler(player: Player, type: string, value: number): void {
  const exe = deathKnowledgeExecutions[type]
  exe && exe(player, value)
}

const deathKnowledgeExecutions: { [key: string]: (player: Player, value: number) => void } = {
  "give": (player, value) => {
    apiDeathKnowledgeXp.increaseXp(player, apiNumbers.clamp(value, -maxDeathKnowledgeXp, maxDeathKnowledgeXp))
  },

  "set": (player, value) => {
    apiDeathKnowledgeXp.setXp(player, apiNumbers.clamp(value, 0, maxDeathKnowledgeXp))
  },

  "remove": (player, value) => {
    apiDeathKnowledgeXp.increaseXp(player, -apiNumbers.clamp(value, -maxDeathKnowledgeXp, maxDeathKnowledgeXp))
  }
}