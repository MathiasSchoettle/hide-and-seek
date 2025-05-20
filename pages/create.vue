<script lang="ts" setup>

const loading = ref(false)
const error = ref<string>("")

function handleCreate(username: string) {
	loading.value = true
	error.value = ''
	setTimeout(() => {
		loading.value = false
		error.value = 'Something went wrong'
	}, 3000)
}

</script>

<template>
	<div class="h-dvh w-screen flex flex-col items-center justify-center size px-5 gap-5">

		<div class="text-xl text-pretty font-semibold text-highlighted font-mono">
			Create a Game
		</div>

		<NewGameInput :loading="loading" :error="error" @create="handleCreate" @switch=""/>

		<UiButton icon="i-lucide-circle-play" size="lg" @click="navigateTo('/join')" color="neutral" variant="ghost" class="cursor-pointer">
			Join Lobby
		</UiButton>
	</div>
</template>