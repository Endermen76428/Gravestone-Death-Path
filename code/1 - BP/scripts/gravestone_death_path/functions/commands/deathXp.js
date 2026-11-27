import { apiDeathKnowledgeXp, maxDeathKnowledgeXp } from "../../lib/player/deathKnowledge";
import { apiNumber } from "../../lib/math/number";
export function deathKnowledgeXpHandler(player, type, value) {
    const exe = deathKnowledgeExecutions[type];
    exe && exe(player, value);
}
const deathKnowledgeExecutions = {
    "give": (player, value) => {
        apiDeathKnowledgeXp.increaseXp(player, apiNumber.clamp(value, -maxDeathKnowledgeXp, maxDeathKnowledgeXp));
    },
    "set": (player, value) => {
        apiDeathKnowledgeXp.setXp(player, apiNumber.clamp(value, 0, maxDeathKnowledgeXp));
    },
    "remove": (player, value) => {
        apiDeathKnowledgeXp.increaseXp(player, -apiNumber.clamp(value, -maxDeathKnowledgeXp, maxDeathKnowledgeXp));
    }
};
