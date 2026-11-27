import { system } from "@minecraft/server";
import { apiItemDynamic } from "../../lib/item/dynamic";
import { apiVec3 } from "../../lib/math/vector";
const currentPoints = new Map();
let pointMapIndex = 0;
const animationStep = 10;
export const deathPath = new class deathPath {
    start(player, item, block) {
        player.dimension.getEntities({ type: "gravestone_death_path:ghost", tags: [`gravestone_death_path.owner: ${player.id}`] }).forEach(entity => entity.remove());
        const points = apiItemDynamic.getDeathPath(item);
        if (points.length < 1)
            return;
        const positions = points.map(value => value.pos);
        const blockCenter = block.bottomCenter();
        const index = this.getClosestPoint(block.location, positions);
        const pos = positions[index];
        const nextPos = positions[index + 1];
        const ghost = block.dimension.spawnEntity("gravestone_death_path:ghost", { x: blockCenter.x, y: blockCenter.y - 1, z: blockCenter.z });
        ghost.addTag(`gravestone_death_path.owner: ${player.id}`);
        currentPoints.delete(pointMapIndex - 7);
        pointMapIndex++;
        currentPoints.set(pointMapIndex, positions);
        if (pos) {
            this.updateRotate(ghost, nextPos ? nextPos : pos);
            this.startMove(ghost, index);
        }
        this.generateParticles(player.dimension, positions, index + 1);
    }
    async startMove(entity, index) {
        const points = currentPoints.get(pointMapIndex);
        if (!points)
            return;
        const pos = points[index];
        const pos1 = points[index + 1];
        const pos2 = points[index + 2];
        const pos3 = points[index + 3];
        if (!pos)
            return entity.triggerEvent("gravestone_death_path:despawn_ghost");
        const distance1 = apiVec3.divide(apiVec3.distanceXYZ(apiVec3.bottomCenter(entity.location), apiVec3.bottomCenter(pos1 ? pos1 : pos)), animationStep);
        const distance2 = apiVec3.divide(apiVec3.distanceXYZ(apiVec3.bottomCenter(pos1 ? pos1 : entity.location), apiVec3.bottomCenter(pos2 ? pos2 : pos)), animationStep);
        const distance3 = apiVec3.divide(apiVec3.distanceXYZ(apiVec3.bottomCenter(pos2 ? pos2 : entity.location), apiVec3.bottomCenter(pos3 ? pos3 : pos)), animationStep);
        try {
            await system.waitTicks(20 * 1.6);
            this.moveHere(entity, distance1);
            await system.waitTicks(11);
            if (!pos2)
                return entity.triggerEvent("gravestone_death_path:despawn_ghost");
            this.updateRotate(entity, pos2);
            this.moveHere(entity, distance2);
            await system.waitTicks(11);
            if (!pos3)
                return entity.triggerEvent("gravestone_death_path:despawn_ghost");
            this.updateRotate(entity, pos3);
            this.moveHere(entity, distance3);
        }
        catch { }
    }
    async continueMoving(entity) {
        const points = currentPoints.get(pointMapIndex);
        if (!points)
            return;
        const index = this.getClosestPoint(entity.location, points);
        const pos = points[index + 1];
        try {
            if (pos) {
                const distance = apiVec3.divide(apiVec3.distanceXYZ(apiVec3.bottomCenter(entity.location), apiVec3.bottomCenter(pos ? pos : entity.location)), animationStep);
                entity.setDynamicProperty("gravestone_death_path:ghost_animation_step", 0);
                if (pos)
                    this.updateRotate(entity, pos);
                return this.moveHere(entity, distance);
            }
            await system.waitTicks(11);
            entity.triggerEvent("gravestone_death_path:despawn_ghost");
        }
        catch { }
    }
    async moveHere(entity, distance) {
        try {
            const step = entity.getDynamicProperty("gravestone_death_path:ghost_animation_step") ?? 0;
            if (typeof step != "number" || step >= animationStep)
                return entity.setDynamicProperty("gravestone_death_path:ghost_animation_step", undefined);
            entity.setDynamicProperty("gravestone_death_path:ghost_animation_step", step + 1);
            entity.tryTeleport(apiVec3.offset(entity.location, distance));
            await system.waitTicks(1);
            this.moveHere(entity, distance);
        }
        catch { }
    }
    updateRotate(entity, nextPos) {
        const currentPos = apiVec3.bottomCenter(entity.location);
        const newPos = apiVec3.bottomCenter(nextPos);
        const degress = Math.floor(Math.atan2(currentPos.z - newPos.z, currentPos.x - newPos.x) * (180 / Math.PI)) + 90;
        entity.setProperty("gravestone_death_path:rotate", degress);
    }
    async generateParticles(dimension, points, start = 0) {
        for (let i = start; i < points.length; i++) {
            const pos = points[i];
            try {
                if (pos)
                    dimension.spawnParticle("gravestone_death_path:ghost_shadow", pos);
            }
            catch { }
            await system.waitTicks(3);
        }
    }
    getClosestPoint(playerPos, points) {
        const index = points
            .map((value, idx) => {
            const distance = apiVec3.distance3(playerPos, value);
            const weight = 1 + (idx / (points.length - 1));
            return distance / weight;
        })
            .reduce((minIdx, dist, idx, arr) => {
            if (arr[minIdx])
                return dist < arr[minIdx] ? idx : minIdx;
            return minIdx;
        }, 0);
        return index;
    }
};
