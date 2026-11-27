export const apiTimer = new class apiTimer {
    checkCooldown(player, id) {
        if (this.getTime() > this.getCooldown(player, id))
            return { finished: true, time: this.getCooldown(player, id) - this.getTime() };
        return { finished: false, time: this.getTime() - this.getCooldown(player, id) };
    }
    getTime() { return Date.now() / 1000; }
    getCooldown(player, id) {
        const cooldown = player.getDynamicProperty(id);
        if (!cooldown || typeof cooldown != "number")
            return this.getTime() - 0.001;
        return cooldown;
    }
    setCooldown(player, id, time) {
        player.setDynamicProperty(id, this.getTime() + time);
    }
};
