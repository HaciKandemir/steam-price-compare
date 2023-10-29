// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ['@nuxt/ui-edge'],
  /*routeRules: {
    '/api/**': { proxy: { to: "https://api.steampowered.com/**"} },
    '/store-api/**': { proxy: { to: "https://store.steampowered.com/api/**"} },
  }*/
})
