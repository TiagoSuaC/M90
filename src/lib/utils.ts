import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

export function formatDecimal(value: number | string, decimals = 1): string {
  const n = typeof value === "string" ? parseFloat(value) : value;
  return n.toFixed(decimals);
}
