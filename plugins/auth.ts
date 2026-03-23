// Runs on both server and client on every full page load.
// On server the cookie is forwarded automatically, so user state
// is filled before the page renders — avoiding a flash of "logged-out" UI.
export default defineNuxtPlugin(async () => {
  const { user, fetchUser } = useAuth();
  if (!user.value) {
    await fetchUser();
  }
});
