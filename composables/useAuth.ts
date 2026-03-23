import type { User } from "~/types/user";

export const useAuth = () => {
  const user = useState<User | null>("auth:user", () => null);
  const isLoggedIn = computed(() => !!user.value);

  const login = async (email: string, password: string): Promise<User> => {
    const data = await $fetch<{ user: User }>("/api/auth/login", {
      method: "POST",
      body: { email, password },
    });
    user.value = data.user;
    return data.user;
  };

  const logout = async () => {
    await $fetch("/api/auth/logout", { method: "POST" });
    user.value = null;
    await navigateTo("/");
  };

  const fetchUser = async () => {
    try {
      const data = await $fetch<User>("/api/auth/me");
      user.value = data;
    } catch {
      user.value = null;
    }
  };

  return { user, isLoggedIn, login, logout, fetchUser };
};
