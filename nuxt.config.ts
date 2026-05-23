// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2025-07-15',
    devtools: {enabled: false},
    modules: ['@nuxt/ui', '@pinia/nuxt', '@nuxt/fonts', '@vercel/analytics', '@vercel/speed-insights'],

    fonts: {
        families: [
            { name: 'Nunito', provider: 'google', weights: [400, 500, 600, 700, 800], styles: ['normal'] },
        ],
    },

    css: ['~/assets/css/main.css'],

    colorMode: {
        preference: 'dark'
    },

    runtimeConfig: {
        public: {
            apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api'
        }
    },

    app: {
        head: {
            title: 'Ninja Tab - Free app keep track of and settle shared costs',
            htmlAttrs: {
                lang: 'en',
            },
            link: [
                {rel: 'icon', type: 'image/x-icon', href: '/favicon.ico'},
            ],
        },
    },
})
