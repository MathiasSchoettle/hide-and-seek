<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui';

const stateStore = useStateStore()
const api = useApi()

const index = ref('0')

const items: TabsItem[] = [
	{
		icon: 'i-lucide-map'
	},
	{
		icon: 'i-lucide-message-circle-question'
	},
	{
		icon: 'i-lucide-bug-off'
	}
]

</script>

<template>
		<div class="grow w-full flex flex-col items-center justify-center overflow-hidden">
			<Map
				v-show="index === '0'"
				:is-hider="stateStore.isHider" :seekers="stateStore.seekerPositions" :hider="stateStore.hiderPosition"
				:circles="stateStore.mapCircles"
			/>

			<div class="w-full h-full" v-show="index === '1'">
				<HiderChat v-if="stateStore.isHider"/>
				<SeekerChat v-else/>
			</div>

			<div class="w-full h-full flex flex-col text-sm" v-show="index === '2'">
				<span>{{ JSON.stringify(stateStore.geo, null, 2) }}</span>

				<span v-for="pos in api.userState?.room?.positions">{{ JSON.stringify(pos, null, 2) }}</span>

				<span>{{ $connection.status }}</span>

			</div>
		</div>

		<div class="w-full flex justify-between bg-neutral-800">
			<div class="flex justify-center items-center">
				<UiTabs v-model="index"  :items="items" size="xl" :content="false" :ui="{ root: 'p-1 gap-1', list: 'rounded-none bg-transparent', trigger: 'px-5' }"/>
			</div>

			<div class="flex justify-center items-center p-3 gap-2">
				<span class="font-bold text-xl font-mono">{{ stateStore.coinCount }}</span>
				<UiIcon name="i-lucide-coins" :size="24"/>

				<UiButton v-if="stateStore.isHider" :ui="{ base: 'ml-4'}" @click="api.wasFound()" icon="i-lucide-eye" size="xl"/>
				<UiButton v-if="stateStore.isLeader" :ui="{ base: 'ml-2'}" @click="api.closeRoom()" color="error" icon="i-lucide-x" size="xl"></UiButton>
			</div>
		</div>
</template>