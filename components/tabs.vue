<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui';

const coins = ref(123)
const index = ref('0')

const hiders = { lat: 49.00252018672146, lng: 12.100188665384959, name: 'Schmiddy' }
const seekers = [{ lat: 49.00245411928066, lng: 12.097421476143023, name: 'Schmaddes'}]
const isHider = ref(false)

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
				:hider="hiders"
				:seekers="seekers"
				:is-hider="isHider"
			/>

			<Chat
				v-show="index === '1'"
			/>

		</div>

		<div class="w-full flex justify-between bg-neutral-800">
			<UiTabs v-model="index"  :items="items" size="xl" :content="false" :ui="{ root: 'p-1 gap-1', list: 'rounded-none bg-transparent', trigger: 'px-5' }"/>

			<div class="flex justify-center items-center p-3 gap-2">
				<span class="font-bold text-xl font-mono">{{ coins }}</span>
				<UiIcon name="i-lucide-coins" :size="24"/>
			</div>
		</div>
</template>