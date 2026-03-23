// Prevent logged-in users from visiting the login page
export default defineNuxtRouteMiddleware(() => {
  const { isLoggedIn } = useAuth();
  if (isLoggedIn.value) {
    return navigateTo("/");
  }
});
