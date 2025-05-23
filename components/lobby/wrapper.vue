<script setup lang="ts">

const api = useApi()

const stateStore = useStateStore()

</script>

<template>
	<LobbyRoom :user-id="stateStore.userId" :room-id="stateStore.roomId ?? 'OH OH'" :users="stateStore.users"/>
</template>