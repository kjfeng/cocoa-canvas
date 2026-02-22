import { useUserStore } from '../store/userStore';
import type { Card } from '../types';

export function isCardOwner(card: Card): boolean {
  if (!card.createdBy) return true; // legacy cards editable by all
  return card.createdBy === useUserStore.getState().userId;
}
