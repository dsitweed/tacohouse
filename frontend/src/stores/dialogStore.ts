import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export enum DialogType {
  CREATE_BUILDING = 'CREATE_BUILDING',
  UPDATE_BUILDING = 'UPDATE_BUILDING',
  CREATE_ROOM = 'CREATE_ROOM',
  UPDATE_ROOM = 'UPDATE_ROOM',
  DELETE_CONFIRM = 'DELETE_CONFIRM',
}

interface DialogStore {
  isOpen: boolean;
  data: Record<string, any> | null;
  type: DialogType | null;
  isLoading: boolean;

  openDialog: (type: DialogType, data?: Record<string, any> | null) => void;
  closeDialog: () => void;
  setLoading: (loading: boolean) => void;
  resetDialog: () => void;
}

export const useDialogStore = create<DialogStore>()(
  devtools(
    (set, get) => ({
      isOpen: false,
      data: null,
      type: null,
      isLoading: false,
      openDialog: (type, data = null) =>
        set({
          isOpen: true,
          data,
          type,
          isLoading: false,
        }),
      closeDialog: () =>
        set({
          isOpen: false,
          data: null,
          type: null,
          isLoading: false,
        }),
      setLoading: (isLoading: boolean) => set({ isLoading }),
      resetDialog: () =>
        set({
          isOpen: false,
          data: null,
          type: null,
          isLoading: false,
        }),
    }),
    {
      name: 'dialog-storage',
      enabled: process.env.NODE_ENV === 'development',
    },
  ),
);
