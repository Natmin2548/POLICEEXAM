import { create } from "zustand";

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  avatarUrl?: string;
  role: "ADMIN" | "USER" | "OWNER";
  isLoggedIn: boolean;
}

interface UserState {
  user: UserProfile;
  setUser: (user: Partial<UserProfile>) => void;
  setRole: (role: "ADMIN" | "USER" | "OWNER") => void;
  login: (profile: Partial<UserProfile>) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>((set) => {
  // Default logged-out user
  let initialUser: UserProfile = {
    id: 1,
    name: "มีน",
    email: "nni893399@gmail.com",
    avatarUrl: "",
    role: "ADMIN",
    isLoggedIn: false,
  };

  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("police_exam_user");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object") {
          initialUser = { ...initialUser, ...parsed };
        }
      } catch {
        // ignore parse error
      }
    }
  }

  return {
    user: initialUser,
    setUser: (updates) =>
      set((state) => {
        const next = { ...state.user, ...updates };
        if (typeof window !== "undefined") {
          localStorage.setItem("police_exam_user", JSON.stringify(next));
        }
        return { user: next };
      }),
    setRole: (role) =>
      set((state) => {
        const next = { ...state.user, role };
        if (typeof window !== "undefined") {
          localStorage.setItem("police_exam_user", JSON.stringify(next));
        }
        return { user: next };
      }),
    login: (profile) =>
      set((state) => {
        const next: UserProfile = {
          ...state.user,
          ...profile,
          isLoggedIn: true,
        };
        if (typeof window !== "undefined") {
          localStorage.setItem("police_exam_user", JSON.stringify(next));
        }
        return { user: next };
      }),
    logout: () => {
      if (typeof window !== "undefined") {
        localStorage.removeItem("police_exam_user");
        localStorage.removeItem("police_exam_active_session");
        window.location.href = "/?login=1";
      }
    },
  };
});
