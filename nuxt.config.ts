// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
	devtools: { enabled: true },
	ssr: false,
	modules: [
		"@vueuse/nuxt",
		"@nuxtjs/leaflet",
		'@nuxt/ui',
		'@pinia/nuxt'
	],

	css: ['~/assets/css/main.css'],

	nitro: {
		experimental: {
			websocket: true
		},
	},

	typescript: {
		strict: true
	},

	ui: {
		prefix: 'Ui'
	},

	vite: {
		plugins: [
			tailwindcss()
		]
	}
})