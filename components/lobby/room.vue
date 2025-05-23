<script setup lang="ts">
import type { InternalUser } from '~/stores/state';

const props = defineProps<{
	userId: string
	roomId: string
	users: InternalUser[]
}>()

const emit = defineEmits<{
	close: []
	leave: []
	makeHider: [id: string]
}>()

const isLeader = computed(() => props.users.find((user) => user.isOwner)?.id === props.userId)

function handleSetHider(id: string) {
	emit('makeHider', id)
}

</script>

<template>
	<div class="flex flex-col gap-5 w-max-screen w-[400px] items-center">
		<div class="flex gap-4 items-center">
			<span class="text-xl font-mono">Welcome to room <b>'{{ roomId }}'</b></span>
			<UiButton v-if="isLeader" @click="$emit('close')" class="cursor-pointer font-bold" size="lg" color="error" variant="outline">Close Game</UiButton>
			<UiButton v-else @click="$emit('leave')" class="cursor-pointer font-bold" size="lg" color="error" variant="outline">Leave Game</UiButton>
		</div>

		<UiSeparator/>

		<div class="flex flex-col gap-2 w-full">
			<div @click="handleSetHider(user.id)" :class="{'cursor-pointer hover:bg-neutral-700 hover:border-neutral-600': isLeader}" class="flex gap-3 bg-neutral-800 border border-neutral-700 rounded-md items-center justify-between py-2 px-3 font-bold" v-for="user in users" :key="user.id">
				<div class="h-full flex items-center gap-2">
					<UiIcon name="i-lucide-user" :size="22"/>
					<div>{{ user.username }} {{ user.id === userId ? '(You)' : '' }}</div>
				</div>
				
				<div class="h-full flex items-center gap-2">
					<UiIcon v-if="user.isOwner" name="i-lucide-crown" :size="22"/>
					<UiIcon v-if="user.isHider" name="i-lucide-eye" :size="22"/>
				</div>
			</div>
		</div>
	</div>
</template>