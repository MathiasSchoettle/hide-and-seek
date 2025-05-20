<script lang="ts" setup>
import type { FailureResponse } from '~/types'

const api = useApi()

const roomId = ref('')
const input = ref('')
const loading = ref(false)

function joinRoom() {
	loading.value = true
	api.joinRoom(input.value)
		.then((response) => {
			roomId.value = response.roomId
		}).catch(error => {
			console.log((error as FailureResponse).reason)
		}).finally(() => {
			loading.value = false
		})
}

function leaveRoom() {
	api.leaveRoom(roomId.value)
	roomId.value = ''
}

</script>

<template>
	<div class="flex flex-col w-full h-full items-center">

		<div class="flex flex-col gap-2" v-if="roomId">
			<div>{{ roomId }}</div>

			<div v-for="user in api.users" class="flex flex-col gap-2 bg-red-800">
				{{ user }}
			</div>

			<UiButton @click="leaveRoom" color="warning">
				Leave
			</UiButton>
		</div>

		<div v-else class="flex gap-2">
			<UiInput type="text" v-model="input"/>
			<UiButton :loading="loading" @click="joinRoom">Join Room</UiButton>
		</div>

	</div>
</template>