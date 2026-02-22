import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';

const COLORS = [
  '#e74c3c', '#3498db', '#2ecc71', '#f39c12',
  '#9b59b6', '#1abc9c', '#e67e22', '#2980b9',
];

interface UserState {
  userId: string;
  userName: string;
  userColor: string;
  isNameSet: boolean;
  setUserName: (name: string) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      userId: nanoid(),
      userName: '',
      userColor: COLORS[Math.floor(Math.random() * COLORS.length)],
      isNameSet: false,
      setUserName: (name) => set({ userName: name, isNameSet: true }),
    }),
    {
      name: 'cocoa-canvas-user',
      partialize: (state) => ({
        userId: state.userId,
        userName: state.userName,
        userColor: state.userColor,
        isNameSet: state.isNameSet,
      }),
    },
  ),
);
