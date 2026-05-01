import { collectGravestone } from "../functions/collect"
import { world, system } from "@minecraft/server"
import { gravestoneIds } from "../variables"

world.beforeEvents.playerBreakBlock.subscribe(({block, player}) => {
  system.run(() => { collectGravestone(block, player) })
}, {blockTypes: gravestoneIds})