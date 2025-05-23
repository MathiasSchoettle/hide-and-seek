<script setup lang="ts">
const id = useLocalStorage('userId', '')
</script>

<template>
	<div class="h-screen w-full flex flex-col items-center justify-center">
		<span>{{ id }}</span>
	</div>
</template>