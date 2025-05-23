<script setup lang="ts">
import { GamePhase } from '~/server/utils/state';

const stateStore = useStateStore()
const api = useApi()

function handleEearlyFinish() {
	stateStore.waitingForUpdate = true
	api.finishEarly()
}

function handleFound() {
	stateStore.waitingForUpdate = true
	api.wasFound()
}

const { coords } = useGeolocation({enableHighAccuracy: true})

</script>

<template>
	<div class="h-screen w-screen bg-neutral-900 flex flex-col justify-center items-center text-white">

		<div class="bg-white absolute top-5 right-5 whitespace-pre-wrap text-black z-[500]">
			{{ JSON.stringify(coords, null, 2) }}
			{{ JSON.stringify(stateStore.geo, null, 2) }}
			websocket status: {{ $connection.status }}
		</div>

		<UsernameInput v-if="!stateStore.username"/>

		<div v-else-if="stateStore.waitingForUpdate">
			<UiIcon name="i-lucide-loader-circle" :size="40" class="animate-spin"/>
		</div>
		
		<RoomJoinOrCreate v-else-if="stateStore.gameState === undefined"/>

		<LobbyWrapper v-else-if="stateStore.gameState === GamePhase.LOBBY"/>

		<Timer @finish="handleEearlyFinish" :is-hider="stateStore.isHider" :time-end="stateStore.hidingEndTime" v-else-if="stateStore.gameState === GamePhase.HIDING"/>

		<Map v-else-if="stateStore.gameState === GamePhase.SEEKING" @found-me="handleFound" :is-hider="stateStore.isHider" :seekers="stateStore.seekerPositions" :hider="stateStore.hiderPosition"/>

		<div v-else-if="stateStore.gameState === GamePhase.HIDER_FOUND">
			<UiButton v-if="stateStore.isLeader" @click="api.closeRoom()">Close</UiButton>
			<UiButton v-else @click="api.leaveRoom()">Leave</UiButton>
		</div>
	</div>
</template>