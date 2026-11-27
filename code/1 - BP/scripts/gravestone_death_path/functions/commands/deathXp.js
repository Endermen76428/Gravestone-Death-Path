import { apiDeathKnowledgeXp, maxDeathKnowledgeXp } from "../../lib/player/deathKnowledge";
import { apiNumbers } from "../../../0-lib/math/numbers";
export function deathKnowledgeXpHandler(player, type, value) {
    const exe = deathKnowledgeExecutions[type];
    exe && exe(player, value);
}
const deathKnowledgeExecutions = {
    "give": (player, value) => {
        apiDeathKnowledgeXp.increaseXp(player, apiNumbers.clamp(value, -maxDeathKnowledgeXp, maxDeathKnowledgeXp));
    },
    "set": (player, value) => {
        apiDeathKnowledgeXp.setXp(player, apiNumbers.clamp(value, 0, maxDeathKnowledgeXp));
    },
    "remove": (player, value) => {
        apiDeathKnowledgeXp.increaseXp(player, -apiNumbers.clamp(value, -maxDeathKnowledgeXp, maxDeathKnowledgeXp));
    }
};
