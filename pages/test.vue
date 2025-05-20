<script lang="ts" setup>
import type { FailureResponse } from '~/types'

const api = useApi()

const roomId = ref('')
const loading = ref(false)

function createRoom() {
	loading.value = true
	api.createNewRoom()
		.then((response) => {
			roomId.value = response.roomId
		}).catch(error => {
			console.warn((error as FailureResponse))
		}).finally(() => {
			loading.value = false
		})
}

</script>

<template>
	<div class="flex flex-col w-full h-full items-center">
		<div class="flex flex-col gap-2" v-if="roomId">
			<div>{{ roomId }}</div>

			<div v-for="user in api.users" class="flex flex-col gap-2 bg-red-800">
				{{ user }}
			</div>
		</div>
		<UiButton :loading v-else @click="createRoom">Create Room</UiButton>
	</div>
</template>