<script setup lang="ts">
import { GamePhase } from '~/server/utils/state';

const stateStore = useStateStore()

</script>

<template>
	<div class="h-screen w-screen bg-neutral-900 flex flex-col justify-center items-center text-white">

		<UsernameInput v-if="!stateStore.username"/>

		<div v-else-if="stateStore.waitingForUpdate">
			<UiIcon name="i-lucide-loader-circle" :size="40" class="animate-spin"/>
		</div>
		
		<RoomJoinOrCreate v-else-if="stateStore.gameState === undefined"/>

		<LobbyWrapper v-else-if="stateStore.gameState === GamePhase.LOBBY"/>
	</div>
</template>