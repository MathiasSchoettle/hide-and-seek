export default defineNuxtPlugin(() => {

	const api = useApi()
	const stateStore = useStateStore()

	const { coords, error, locatedAt } = useGeolocation({ enableHighAccuracy: true})

	setInterval(() => {
		const lat = coords.value.latitude
		const lon = coords.value.longitude

		stateStore.geo = {
			lat: lat,
			lon: lon,
			error: error.value?.message ?? '-',
			last: new Date(locatedAt.value ?? 0)
		}
		
		api.sendGeoData(lat, lon)
	}, 1000)
})