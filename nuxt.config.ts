import { existsSync, readdirSync } from 'node:fs'

// @nuxt/content's SQLite database doesn't run inside a Vercel serverless
// function, so any page that queries a collection at request time 404s on a
// direct hit — it only survives client-side navigation, where the browser has
// its own copy. Every content-backed page is static anyway, so prerender them
// all. Derived from the files so a new trip or creator needs no config edit.
const contentRoutes = (dir: string, prefix: string): string[] =>
    existsSync(`content/${dir}`)
        ? readdirSync(`content/${dir}`)
            .filter(file => file.endsWith('.md'))
            .map(file => prefix + file.replace(/\.md$/, ''))
        : []

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2025-07-15',
    devtools: {enabled: false},
    routeRules: {
        '/giveaway': {prerender: true},
        '/join': {prerender: true},
        '/credit-card-hot-potato': {prerender: true},
        '/madlertravel': {prerender: true},
    },
    modules: ['@nuxt/ui', '@pinia/nuxt', '@nuxt/fonts', '@vercel/analytics', '@vercel/speed-insights', '@nuxt/content'],

    nitro: {
        prerender: {
            routes: [
                '/blog',
                ...contentRoutes('blog', '/blog/'),
                ...contentRoutes('trips', '/t/'),
                ...contentRoutes('authors', '/'),
            ],
        },
    },

    fonts: {
        families: [
            {name: 'Nunito', provider: 'google', weights: [400, 500, 600, 700, 800], styles: ['normal']},
        ],
    },

    css: ['~/assets/css/main.css'],

    vite: {
        server: {
            allowedHosts: ['0502-88-97-220-62.ngrok-free.app'],
        },
    },

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