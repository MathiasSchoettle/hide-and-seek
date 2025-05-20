<script lang="ts" setup>

const loading = ref(false)
const error = ref<string>("")

function handleJoin(pin: string) {
	loading.value = true
	error.value = ''
	setTimeout(() => {
		loading.value = false
		error.value = "Room Code doesn't exist"
	}, 3000)
}

</script>

<template>
	<div class="h-dvh w-screen flex flex-col items-center justify-center size px-5 gap-5">

		<div class="text-xl text-pretty font-semibold text-highlighted font-mono">
			Join via Code
		</div>

		<PinInput :loading="loading" :error="error" @join="handleJoin" @switch=""/>

		<UiButton icon="i-lucide-circle-play" size="lg" @click="navigateTo('/create')" color="neutral" variant="ghost" class="cursor-pointer">
			Create Own Lobby
		</UiButton>
	</div>
</template>