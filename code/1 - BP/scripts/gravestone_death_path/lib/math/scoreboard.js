import { world } from "@minecraft/server";
export const apiScoreboard = new class ApiScoreboard {
    addObj(scoreId, displayName) {
        if (world.scoreboard.getObjective(scoreId))
            return this.getObj(scoreId);
        return world.scoreboard.addObjective(scoreId, displayName);
    }
    removeObj(scoreId) {
        return world.scoreboard.removeObjective(scoreId);
    }
    getObj(scoreId) {
        const score = world.scoreboard.getObjective(scoreId);
        if (!score)
            return this.addObj(scoreId);
        return score;
    }
    hasObj(scoreId) {
        return world.scoreboard.getObjective(scoreId) != undefined;
    }
    addScore(scoreId, participant, amount = 0) {
        const score = typeof scoreId == "string" ? this.getObj(scoreId) : scoreId;
        return score.addScore(participant, amount);
    }
    getScore(scoreId, participant) {
        const score = typeof scoreId == "string" ? this.getObj(scoreId) : scoreId;
        if (!this.hasParticipant(scoreId, participant))
            return this.addScore(scoreId, participant);
        const value = score.getScore(participant);
        if (value == undefined)
            return this.addScore(scoreId, participant);
        return value;
    }
    setScore(scoreId, participant, amount) {
        const score = typeof scoreId == "string" ? this.getObj(scoreId) : scoreId;
        if (amount == undefined) {
            score.removeParticipant(participant);
            return;
        }
        score.setScore(participant, amount);
    }
    hasParticipant(scoreId, participant) {
        const score = typeof scoreId == "string" ? this.getObj(scoreId) : scoreId;
        return score.hasParticipant(participant);
    }
};
