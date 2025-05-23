<script lang="ts" setup>
import { MapCircleType, type MapCircle } from '~/server/utils/state';

	
const store = useStateStore();

const props = defineProps<{
	isHider: boolean
	hider: { lat: number; lng: number, name: string }
	seekers: { lat: number, lng: number, name: string }[]
	circles: MapCircle[]
}>()

defineEmits<{
	foundMe: []
}>()

const center: [number, number] = [props.hider.lat, props.hider.lng]

const circleColors: Record<MapCircleType, string> = {
	[MapCircleType.SMOKE_BOMB]: "grey",
	[MapCircleType.FREEZE_BOMB]: "#42b3f5",
	[MapCircleType.SEEKERS_FORTUNE]: "gold",
}

</script>

<template>
	<LMap
		class="h-screen w-full"
		:zoom="16"
		:center="center"
		:use-global-leaflet="false"
	>
		<LTileLayer
			url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
			attribution="&amp;copy; <a href=&quot;https://www.openstreetmap.org/&quot;>OpenStreetMap</a> contributors"
			layer-type="base"
			name="OpenStreetMap"
		/>

		<LCircleMarker v-if="isHider" :lat-lng="hider" :radius="10" color="red">
			<LTooltip>{{ hider.name }}</LTooltip>
		</LCircleMarker>
		<LCircleMarker v-for="seeker in seekers" :lat-lng="seeker" :radius="10" color="blue">
			<LTooltip>{{ seeker.name }}</LTooltip>
		</LCircleMarker>
		<LCircle
			v-for="circle in circles"
			:lat-lng="{lat: circle.position.lat, lng: circle.position.long}"
			:radius="circle.radius"
			:stroke="false"
			:fill-color="circleColors[circle.type]"
			:fill-opacity="0.6"
		/>
	</LMap>

	<!-- <UiButton v-if="isHider" @click="$emit('foundMe')" class="z-[400] shadow absolute left-auto right-auto bottom-10 font-bold">
		I got caught!
	</UiButton> -->
</template>
