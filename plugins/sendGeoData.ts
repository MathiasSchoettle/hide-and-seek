export default defineNuxtPlugin(() => {

	const api = useApi()
	const stateStore = useStateStore()

	const { coords, error, locatedAt } = useGeolocation({ enableHighAccuracy: false, maximumAge: 0 })

	setInterval(() => {
		const lat = coords.value.latitude
		const lon = coords.value.longitude

		console.debug(lat, lat)

		stateStore.geo = {
			lat: lat,
			lon: lon,
			error: error.value?.message ?? '-',
			last: new Date(locatedAt.value ?? 0),
			accuracy: coords.value.accuracy,
		}
		
		api.sendGeoData(lat, lon)
	}, 1000)
})