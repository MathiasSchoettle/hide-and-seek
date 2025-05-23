
<script setup lang="ts">
import type Room from './lobby/room.vue';

const api = useApi()
const stateStore = useStateStore()


const messages = ref([

])

</script>

<template>
	<div class="h-full w-full flex flex-col p-2 gap-2 bg-neutral-900">
		<div class="grow w-full overflow-hidden">
			<div class="h-full flex flex-col gap-2 overflow-scroll">
				<div v-for="message in messages" class="flex" :class="message.type === 'SENT' ? 'justify-end' : 'justify-start'">
					<div class="p-2 rounded-md max-w-3/5 flex flex-col gap-1 whitespace-pre-wrap" :class="message.type === 'SENT' ? 'bg-neutral-500' : 'bg-neutral-700'">
						{{ message.message }}
					</div>
				</div>
			</div>
		</div>

		<div class="w-full flex gap-2">
			<UiInput size="xl" :ui="{ root: 'grow' }" type="text"/>
			<UiButton :ui="{ base: 'px-5', trailingIcon: 'text-4xl' }" size="sm" trailing-icon="i-lucide-send-horizontal"></UiButton>
		</div>
	</div>
</template>