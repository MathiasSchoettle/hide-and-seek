export default defineNuxtPlugin(() => {

	const api = useApi()
	const stateStore = useStateStore()

	const { coords, error } = useGeolocation({ enableHighAccuracy: true})

	setInterval(() => {
		const lat = coords.value.latitude
		const lon = coords.value.longitude

		stateStore.pos = {
			lat: lat,
			lon: lon
		}
		
		api.sendGeoData(lat, lon)
	}, 1000)
})