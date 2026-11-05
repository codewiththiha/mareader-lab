import { clsx, type ClassValue } from "clsx";

// clsx only: tailwind-merge does not know our token colours (text-ink vs text-[12px]).
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
