import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AdminUser {
  id: string;
  email: string;
  username: string;
  role: 'admin' | 'super-admin';
  permissions: string[];
}

interface AdminState {
  adminUser: AdminUser | null;
  isAdminAuthenticated: boolean;
  adminToken: string | null;
  login: (adminUser: AdminUser, token: string) => void;
  logout: () => void;
  checkAdminAuth: () => boolean;
  hasPermission: (permission: string) => boolean;
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      adminUser: null,
      isAdminAuthenticated: false,
      adminToken: null,
      
      login: (adminUser, token) => {
        set({ adminUser, adminToken: token, isAdminAuthenticated: true });
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('admin_token', token);
        }
      },
      
      logout: () => {
        set({ adminUser: null, adminToken: null, isAdminAuthenticated: false });
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('admin_token');
        }
      },
      
      checkAdminAuth: () => {
        const state = get();
        return state.isAdminAuthenticated && state.adminUser !== null && state.adminToken !== null;
      },
      
      hasPermission: (permission: string) => {
        const state = get();
        if (!state.adminUser) return false;
        if (state.adminUser.role === 'super-admin') return true;
        return state.adminUser.permissions?.includes(permission) || false;
      }
    }),
    {
      name: 'admin-storage',
      partialize: (state) => ({
        adminUser: state.adminUser,
        adminToken: state.adminToken,
        isAdminAuthenticated: state.isAdminAuthenticated,
      }),
    }
  )
);
