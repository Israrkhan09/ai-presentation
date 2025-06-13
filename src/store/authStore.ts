import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  name: string;
  voiceProfileId?: string;
  createdAt: Date;
}

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{success: boolean;error?: string;}>;
  register: (email: string, password: string, name: string) => Promise<{success: boolean;error?: string;}>;
  logout: () => void;
  updateVoiceProfile: (voiceProfileId: string) => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isAuthenticated: false,

  login: async (email: string, password: string) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock authentication
    if (email && password) {
      const user: User = {
        id: '1',
        email,
        name: email.split('@')[0],
        createdAt: new Date()
      };
      set({ user, isAuthenticated: true });
      return { success: true };
    }
    return { success: false, error: 'Invalid credentials' };
  },

  register: async (email: string, password: string, name: string) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const user: User = {
      id: Date.now().toString(),
      email,
      name,
      createdAt: new Date()
    };
    set({ user, isAuthenticated: true });
    return { success: true };
  },

  logout: () => {
    set({ user: null, isAuthenticated: false });
  },

  updateVoiceProfile: (voiceProfileId: string) => {
    const currentUser = get().user;
    if (currentUser) {
      set({ user: { ...currentUser, voiceProfileId } });
    }
  }
}));