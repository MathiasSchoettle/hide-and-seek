<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import L from 'leaflet'
import { LMap, LTileLayer, LMarker, LIcon } from '@vue-leaflet/vue-leaflet'

const props = defineProps<{
	hider_location: { lat: number; lng: number }
	seeker_location: { lat: number; lng: number }
}>()

const map = ref(null)
const markers = ref<L.Marker[]>([])
const center = ref<[number, number]>([49.00252018672146, 12.100188665384959])
const zoom = 16

const move_center = (lat, lng) => {
	const leafletMap = map.value.leafletObject
	leafletMap.flyTo([lat, lng], zoom)
}

const onMapReady = () => {
}

const onMapClick = (event: any) => {
	const { lat, lng } = event.latlng

	const name = prompt('Enter name for this location:')
	if (!name) return

	const marker = L.marker([lat, lng]).bindPopup(name).addTo(map.value.leafletObject)
	markers.value.push(marker)
	move_center(lat, lng)
}
</script>

<template>
	<LMap ref="map" style="height: 100vh; width: 100vw" :zoom="16" :center="center" :use-global-leaflet="true"
		@ready="onMapReady" @click="onMapClick">
		<LTileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
			attribution="&copy; <a href='https://www.openstreetmap.org/'>OpenStreetMap</a> contributors" />
		<LMarker :lat-lng="[props.hider_location.lat, props.hider_location.lng]">
			<LPopup>Hider</LPopup>
		</LMarker>
		<LMarker :lat-lng="[props.seeker_location.lat, props.seeker_location.lng]">
			<LPopup>Seeker</LPopup>
		</LMarker>
	</LMap>
</template>
