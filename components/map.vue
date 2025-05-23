<script lang="ts" setup>
import { MapCircleType, type MapCircle, getMapCircleCost } from '~/server/utils/state';
import { getDistance } from 'geolib'

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

const circleButtonContents = [
	{
		type: MapCircleType.SMOKE_BOMB,
		name: "Smoke bomb",
		color: "grey"
	},
	{
		type: MapCircleType.FREEZE_BOMB,
		name: "Freeze bomb",
		color: "#f2b3f5",
	},
	{
		type: MapCircleType.SEEKERS_FORTUNE,
		name: "Seekers fortune",
		color: "gold"
	}
]

const handleClick = (evt: any) => {

	if (!store.isHider) return

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

const shouldHideTeammates = computed(() => {

	if (store.isHider) return false

	const circles = api.userState?.room?.mapCircles;

	const inCircle = circles?.filter(c => c.type === 'smoke_bomb')
		.some(c => {
			const circlePosition = {	
				lat: c.position.lat,
				lon: c.position.long,
			}
			const userPosition = {
				lat: store.geo?.lat ?? 0,
				lon: store.geo?.lon ?? 0,
			}

			console.debug(circlePosition, userPosition)
			return getDistance(circlePosition, userPosition) < c.radius
		})

	return !!inCircle
})

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

			<LCircleMarker v-if="!shouldHideTeammates" v-for="seeker in seekers" :lat-lng="seeker" :radius="10" :color="seeker.name === store.username ? 'green' : 'blue'">
				<LTooltip>{{ seeker.name }}</LTooltip>
			</LCircleMarker>

			<LCircle
				v-for="circle in circles"
				:lat-lng="{lat: circle.position.lat, lng: circle.position.long}"
				:radius="circle.radius"
				:stroke="false"
				:fill-color="circleButtonContents.find(b => b.type === circle.type)?.color"
				:fill-opacity="0.6"
			/>
		</LMap>
		<UiModal v-model:open="showModal" title="Choose spell">
			<template #body v-if="position !== undefined">
				<div class="flex flex-col gap-2 w-full">
					<UiButton :disabled="store.coinCount < getMapCircleCost(button.type)" variant="outline" color="neutral" v-for="button in circleButtonContents" @click="addCircle(button.type, position)">
						{{ button.name }}
					</UiButton>
				</div>
			</template>
		</UiModal>
	</div>
</template>
