<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui';

const stateStore = useStateStore()

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
			/>

			<div class="w-full h-full" v-show="index === '1'">
				<HiderChat v-if="false"/>
				<SeekerChat v-else/>
			</div>

		</div>

		<div class="w-full flex justify-between bg-neutral-800">
			<UiTabs v-model="index"  :items="items" size="xl" :content="false" :ui="{ root: 'p-1 gap-1', list: 'rounded-none bg-transparent', trigger: 'px-5' }"/>

			<div class="flex justify-center items-center p-3 gap-2">
				<span class="font-bold text-xl font-mono">{{ stateStore.coinCount }}</span>
				<UiIcon name="i-lucide-coins" :size="24"/>
			</div>
		</div>
</template>