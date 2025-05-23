
<script setup lang="ts">

const timeEnd = ref(Date.now() + 60 * 1000)



</script>
<template>


	<div class="h-screen w-full flex flex-col items-center justify-center">
		<Timer :time-end="timeEnd"/>
	</div>

</template>