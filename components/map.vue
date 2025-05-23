<script lang="ts" setup>

defineProps<{
	isHider: boolean
	hider: { lat: number; lng: number }
	seekers: { lat: number, lng: number }[]
}>()

defineEmits<{
	foundMe: []
}>()

</script>

<template>
	<LMap
		class="h-screen w-full"
		:zoom="6"
		:center="[hider.lat, hider.lng]"
		:use-global-leaflet="false"
	>
		<LTileLayer
			url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
			attribution="&amp;copy; <a href=&quot;https://www.openstreetmap.org/&quot;>OpenStreetMap</a> contributors"
			layer-type="base"
			name="OpenStreetMap"
		/>

		<LCircleMarker :lat-lng="hider" :radius="10" color="red"/>
		<LCircleMarker v-for="seeker in seekers" :lat-lng="seeker" :radius="10" color="blue"/>
	</LMap>

	<UiButton v-if="isHider" class="z-[400] shadow absolute left-auto right-auto bottom-10">
		They found me
	</UiButton>
</template>
