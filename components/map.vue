<script lang="ts" setup>
import { MapCircleType, type MapCircle } from '~/server/utils/state';
	
const store = useStateStore();
const api = useApi();

const props = defineProps<{
	isHider: boolean
	hider: { lat: number; lng: number, name: string }
	seekers: { lat: number, lng: number, name: string }[]
	circles: MapCircle[]
}>()

defineEmits<{
	foundMe: []
}>()

const position = ref<Position>();
const showModal = ref<boolean>(false);

const center: [number, number] = [props.hider.lat, props.hider.lng]

const circleColors: Record<MapCircleType, string> = {
	[MapCircleType.SMOKE_BOMB]: "grey",
	[MapCircleType.FREEZE_BOMB]: "#42b3f5",
	[MapCircleType.SEEKERS_FORTUNE]: "gold",
}

const circleButtonContents: [MapCircleType, string][] = [
	[MapCircleType.SMOKE_BOMB, "Smoke bomb"],
	[MapCircleType.FREEZE_BOMB, "Freeze bomb"],
	[MapCircleType.SEEKERS_FORTUNE, "Seekers fortune"],
]

const handleClick = (evt: any) => {
	console.log(props.circles);
	console.log(evt);
	const latLng = evt.latlng;
	const clickPosition: Position = {
		lat: latLng.lat,
		long: latLng.lng,
	}
	position.value = clickPosition;
	showModal.value = true;
}

const addCircle = (type: MapCircleType, position: Position) => {
	api.addMapCircle(type, position);
	showModal.value = false;
}

</script>

<template>
	<div class="h-full w-full">
		<LMap
			class="h-screen w-full"
			:zoom="16"
			:center="center"
			:use-global-leaflet="false"
			@click="handleClick"
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
		<UiModal v-model:open="showModal" title="Choose spell">
			<template #body>
				<UiButton v-if="position !== undefined" v-for="button in circleButtonContents" @click="addCircle(button[0], position)">
					{{button[1]}}
				</UiButton>
			</template>
		</UiModal>
	</div>
</template>
