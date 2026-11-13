import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** 1450 -> "S/ 1,450" */
export function formatSoles(value: number | null | undefined) {
  return 'S/ ' + Number(value || 0).toLocaleString('es-PE')
}
