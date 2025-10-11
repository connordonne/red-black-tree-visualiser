// src/lib/utils.ts

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const onlyDigits = (s: string): string => s.replace(/[^0-9]/g, '');

export const stripLeadingZeros = (s: string): string => s.replace(/^0+(?=\d)/, '');

export const normalizeNumberInput = (s: string): string => {
  if (s === "") return "";
  return stripLeadingZeros(onlyDigits(s));
};