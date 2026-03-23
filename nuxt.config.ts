export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: ["@nuxt/ui"],

  colorMode: {
    preference: "light",
  },

  runtimeConfig: {
    jwtSecret: process.env.JWT_SECRET || "change-this-in-production",
    public: {},
  },

  typescript: {
    strict: true,
  },
});
