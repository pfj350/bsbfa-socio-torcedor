import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getPublishBadge = (dateString: string) => {
  if (!dateString) return null;
  const dateStrUtc = new Date(dateString);
  const now = new Date();
  
  const dateObj = new Date(dateStrUtc.getFullYear(), dateStrUtc.getMonth(), dateStrUtc.getDate());
  const nowObj = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const diffTime = nowObj.getTime() - dateObj.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Hoje';
  if (diffDays === 1) return 'Ontem';
  return `Há ${diffDays} dias`;
};
