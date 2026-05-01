import "./interactWithEntity"
import "./worldInitialize"
import "./entityHitEntity"
import "./scriptEvent"
import "./breakBlock"
import "./entityLoad"
import "./entityDie"

import { world, system } from "@minecraft/server"
system.run(() => { world.gameRules.keepInventory = true })