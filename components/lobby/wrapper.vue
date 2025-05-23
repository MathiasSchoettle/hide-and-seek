<script setup lang="ts">

const api = useApi()

const stateStore = useStateStore()

</script>

<template>
	<LobbyRoom
		:user-id="stateStore.userId"
		:room-id="stateStore.roomId ?? ''"
		:users="stateStore.users"
		@close="api.closeRoom()"
		@leave="api.leaveRoom()"
		@make-hider="(hiderId) => api.setHider(hiderId)"
	/>
</template>