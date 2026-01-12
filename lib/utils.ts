import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getObjectPosition(hotspot?: { x: number, y: number }) {
  if (!hotspot) return "center"
  return `${hotspot.x * 100}% ${hotspot.y * 100}%`
}
