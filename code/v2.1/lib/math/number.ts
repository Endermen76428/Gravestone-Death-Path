import { world } from "@minecraft/server"

export const apiNumber = new class apiNumber {
  clamp(value: number, min: number, max: number): number { return Math.min(Math.max(value, min), max) }
}