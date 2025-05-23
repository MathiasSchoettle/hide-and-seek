<script setup lang="ts">

const props = defineProps<{
	timeEnd: number
	isHider: boolean
}>()

defineEmits<{
	finish: []
}>()

const date = ref(Date.now())

const timeString = computed(() => formatDuration(date.value, props.timeEnd))

function formatDuration(startTimestamp: number, endTimestamp: number): string {
	const diffMs = Math.abs(endTimestamp - startTimestamp);
	const totalSeconds = Math.floor(diffMs / 1000);
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;

	const formattedMinutes = minutes.toString().padStart(2, '0');
	const formattedSeconds = seconds.toString().padStart(2, '0');

	return `${formattedMinutes}:${formattedSeconds}`;
}

useIntervalFn(() => {
	date.value = Date.now()
}, 100)

</script>

<template>
	<div class="flex flex-col gap-5 items-center">
		<span class="font-mono text-2xl">Time Remaining</span>

		<span class="text-8xl font-mono">
			{{ timeString }}
		</span>

		<UiButton @click="$emit('finish')" v-if="isHider">
			Finished
		</UiButton>
	</div>
</template>