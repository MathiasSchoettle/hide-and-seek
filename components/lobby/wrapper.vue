<script setup lang="ts">

const api = useApi()

const stateStore = useStateStore()

function handleLeave() {
	stateStore.waitingForUpdate = true
	api.leaveRoom()
}

function handleClose() {
	stateStore.waitingForUpdate = true
	api.closeRoom()
}

</script>

<template>
	<LobbyRoom
		:user-id="stateStore.userId"
		:room-id="stateStore.roomId ?? ''"
		:users="stateStore.users"
		@close="handleClose"
		@leave="handleLeave"
		@make-hider="(hiderId) => api.setHider(hiderId)"
	/>
</template>