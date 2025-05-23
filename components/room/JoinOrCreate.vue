<script setup lang="ts">
import { JoinRoomStatus } from '~/types'

const api = useApi()
const stateStore = useStateStore()

const loading = ref(false)
const joinError = ref<string>()

const createError = ref<string>('')

function create() {
	loading.value = true
	joinError.value = ''
	createError.value = ''

	api.createNewRoom()
		.then((response) => {
			stateStore.waitingForUpdate = true
		})
		.catch(() => {
			// do something
			createError.value = 'Something went wrong'
		})
		.finally(() => {
			loading.value = false
		})
}

function join() {
	loading.value = true
	joinError.value = ''
	createError.value = ''

	api.joinRoom(state.value.pin.join(''))
		.then((response) => {
			switch(response.status) {
				case JoinRoomStatus.SUCCESS: 
					stateStore.waitingForUpdate = true
					break
				case JoinRoomStatus.ROOM_DOES_NOT_EXIST:
				case JoinRoomStatus.ROOM_FULL:
				default:
					joinError.value = 'Something went wrong'
			}	
		})
		.catch(() => {
			joinError.value = 'Server Error'
		})
		.finally(() => {
			loading.value = false
		})
}

const state = ref({
	pin: <string[]>[]
})

const disabled = computed(() => state.value.pin.length < 4 || loading.value)

const ui = computed(() => {
	return {
		base: 'uppercase size-12 text-2xl font-extrabold ' + (joinError.value ? 'ring-red-400' : ''), 
		root: 'gap-2'
	}
})

</script>

<template>
	<div class="flex flex-col gap-4 items-center">

		<div class="text-xl text-pretty font-semibold text-highlighted font-mono">
			Join via Code
		</div>

		<UiForm :state="state" @submit.prevent="join" class="flex flex-col items-center gap-3" >
			<UiFormField name="pin" :error="joinError" :ui="{error: 'text-center'}">
				<UiPinInput :disabled="loading" :length="4" size="xl" v-model="state.pin" :ui="ui"/>
			</UiFormField>

			<UiButton type="submit" :loading="loading" :disabled="disabled" variant="subtle" class="cursor-pointer" size="lg" icon="i-lucide-rocket">
				Join
			</UiButton>
		</UiForm>
	
		<UiSeparator class="w-64"/>

		<UiButton @click="create" :disabled="loading" icon="i-lucide-circle-play" size="lg" color="neutral" variant="subtle" class="cursor-pointer">
			Or create your own
		</UiButton>
		<span class="text-red-400 text-sm">{{ createError }}</span>
	</div>
</template>