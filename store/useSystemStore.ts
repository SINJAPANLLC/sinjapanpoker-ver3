import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SystemSettings {
  realMoneyEnabled: boolean; // リアルマネーモードの有効/無効
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  updatedAt: Date;
  updatedBy: string;
}

interface SystemStore {
  settings: SystemSettings;
  toggleRealMoney: (adminId: string) => void;
  toggleMaintenance: (adminId: string) => void;
  toggleRegistration: (adminId: string) => void;
  isRealMoneyEnabled: () => boolean;
}

export const useSystemStore = create<SystemStore>()(
  persist(
    (set, get) => ({
      settings: {
        realMoneyEnabled: false, // 初期状態はOFF（Adminがチップ付与）
        maintenanceMode: false,
        registrationEnabled: true,
        updatedAt: new Date(),
        updatedBy: 'system'
      },

      toggleRealMoney: (adminId: string) => {
        set((state) => ({
          settings: {
            ...state.settings,
            realMoneyEnabled: !state.settings.realMoneyEnabled,
            updatedAt: new Date(),
            updatedBy: adminId
          }
        }));
      },

      toggleMaintenance: (adminId: string) => {
        set((state) => ({
          settings: {
            ...state.settings,
            maintenanceMode: !state.settings.maintenanceMode,
            updatedAt: new Date(),
            updatedBy: adminId
          }
        }));
      },

      toggleRegistration: (adminId: string) => {
        set((state) => ({
          settings: {
            ...state.settings,
            registrationEnabled: !state.settings.registrationEnabled,
            updatedAt: new Date(),
            updatedBy: adminId
          }
        }));
      },

      isRealMoneyEnabled: () => get().settings.realMoneyEnabled,
    }),
    {
      name: 'system-storage',
      serialize: (state) => {
        const newState = {
          ...state,
          state: {
            ...state.state,
            settings: {
              ...state.state.settings,
              updatedAt: state.state.settings.updatedAt instanceof Date 
                ? state.state.settings.updatedAt.toISOString() 
                : state.state.settings.updatedAt,
            }
          }
        };
        return JSON.stringify(newState);
      },
      deserialize: (str) => {
        const newState = JSON.parse(str);
        newState.state.settings.updatedAt = new Date(newState.state.settings.updatedAt);
        return newState;
      },
    }
  )
);

