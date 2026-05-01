import { world, Player, EquipmentSlot } from "@minecraft/server"
import { teleportToGravestone } from "../functions/teleport"
import { apiEquippable } from "../lib/player/equippable"
import { collectGravestone } from "../functions/collect"
import { apiItemDynamic } from "../lib/item/dynamic"
import { deathPath } from "../functions/locator"
import { apiTimer } from "../lib/player/timer"
import { apiVec3 } from "../lib/math/vector"
import { apiWarn } from "../lib/player/warn"
import { apiLore } from "../lib/item/lore"

world.beforeEvents.worldInitialize.subscribe(({itemComponentRegistry: customI}) => {
  customI.registerCustomComponent("gravestone_death_path:gravestone_key", {
    onUseOn({source, itemStack: item, block}){
      const player = source as Player
      if(block.getTags().includes("gravestone_death_path:gravestone")){
        const posKey = apiLore.getDeathPos(item)
        if(!posKey){
          apiEquippable.setItem(player, EquipmentSlot.Mainhand, undefined)
          return apiWarn.notify(player, "warning.gravestone_death_path:gravestone_key.corrupted", {sound: "gravestone_death_path.warn.break"})
        }

        if(!apiVec3.compare(block.location, posKey, true)){
          const lastPoint = apiItemDynamic.getDeathPath(item)[0]
          if(lastPoint) try { world.getDimension(lastPoint.dimension).spawnParticle("gravestone_death_path:ghost_shadow", lastPoint.pos) } catch {}
          return apiWarn.notify(player, "warning.gravestone_death_path:gravestone_key.invalid_gravestone", {sound: "gravestone_death_path.warn.bass"})
        }

        player.dimension.getEntities({type: "gravestone_death_path:ghost", tags: [`gravestone_death_path.owner: ${player.id}`]}).forEach(entity => entity.remove())
        return collectGravestone(block, player, true)
      }

      const keyOwner = apiItemDynamic.getDeathInfo(item)

      if(keyOwner == undefined){
        apiEquippable.setItem(player, EquipmentSlot.Mainhand, undefined)
        return apiWarn.notify(player, "warning.gravestone_death_path:gravestone_key.corrupted", {sound: "gravestone_death_path.warn.break"})
      }

      if(keyOwner != player.id) return apiWarn.notify(player, "warning.gravestone_death_path:gravestone_key.invalid_owner", {sound: "gravestone_death_path.warn.bass"})

      if(player.isSneaking) return
      if(!apiTimer.checkCooldown(player, "gravestone_death_path:gravestone_key_cooldown").finished && !player.hasTag("dev")) return
      apiTimer.setCooldown(player, "gravestone_death_path:gravestone_key_cooldown", 5)

      deathPath.start(player, item, block)
    },

    onUse({source: player, itemStack: item}){
      if(item && item.typeId == "gravestone_death_path:gravestone_key" && player.getBlockFromViewDirection({maxDistance: 8})?.block == undefined){
        return teleportToGravestone(player, item)
      }
    }
  })
})