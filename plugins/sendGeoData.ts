export default defineNuxtPlugin(() => {

	const api = useApi()

	const { coords, error } = useGeolocation()

	setInterval(() => {
		const lat = coords.value.latitude
		const lon = coords.value.longitude

		api.sendGeoData(lat, lon)
	}, 1000)
})