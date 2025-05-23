<script lang="ts" setup>
import { ref } from 'vue'
import L from 'leaflet'
import { LMap, LTileLayer, LMarker, LPopup } from '@vue-leaflet/vue-leaflet'

const props = defineProps<{
	hider_location: { lat: number; lng: number }
	seeker_location: { lat: number; lng: number }
}>()

const map = ref(null)

const center = ref<[number, number]>([props.hider_location.lat, props.hider_location.lng])
const zoom = 16

const seekerPosition = ref<[number, number]>([props.seeker_location.lat, props.seeker_location.lng])
const hiderPosition = ref<[number, number]>([props.hider_location.lat, props.hider_location.lng])

const move_center = (lat: number, lng: number) => {
	map.value?.leafletObject.flyTo([lat, lng], zoom)
}

const onMapClick = (event: any) => {
	// Move seeker marker
	const { lat, lng } = event.latlng
	seekerPosition.value = [lat, lng]
	move_center(lat, lng)
}

// // On click for marker creation
// const onMapClick = (event: any) => {
// 	const { lat, lng } = event.latlng
// 
// 	const name = prompt('Enter name for this location:')
// 	if (!name) return
// 
// 	const marker = L.marker([lat, lng]).bindPopup(name).addTo(map.value.leafletObject)
// 	markers.value.push(marker)
// 	move_center(lat, lng)
// }
</script>

<template>
	<LMap ref="map" style="height: 100vh; width: 100vw" :zoom="zoom" :center="center" :use-global-leaflet="true"
		@click="onMapClick">
		<LTileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
			attribution="&copy; <a href='https://www.openstreetmap.org/'>OpenStreetMap</a> contributors" />

		<LMarker :lat-lng="seekerPosition">
			<LPopup>Seeker</LPopup>
		</LMarker>

		<LMarker :lat-lng="hiderPosition">
			<LPopup>Hider</LPopup>
		</LMarker>
	</LMap>
</template>
