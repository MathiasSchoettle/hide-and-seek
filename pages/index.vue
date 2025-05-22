<script setup lang="ts">

const stateStore = useStateStore()

</script>

<template>
	<div class="h-screen w-screen bg-neutral-900 flex flex-col justify-center items-center text-white">
		<UsernameInput v-if="!stateStore.username"/>

		<RoomJoinOrCreate v-else/>
	</div>
</template>