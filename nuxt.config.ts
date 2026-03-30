export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: ["@nuxt/ui", "@nuxtjs/i18n"],

  i18n: {
    strategy: "no_prefix",
    defaultLocale: "en",
    langDir: "locales/",
    lazy: true,
    locales: [
      { code: "en", language: "en-US", name: "English", file: "en.json" },
      { code: "ru", language: "ru-RU", name: "Русский", file: "ru.json" },
      { code: "kk", language: "kk-KZ", name: "Қазақша", file: "kk.json" },
    ],
  },

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
