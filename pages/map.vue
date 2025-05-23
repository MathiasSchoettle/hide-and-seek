<script lang="ts" setup>
import Map from '@/components/map.vue'

const hiders = { lat: 49.00252018672146, lng: 12.100188665384959, name: 'Schmiddy' }
const seekers = [{ lat: 49.00245411928066, lng: 12.097421476143023, name: 'Schmaddes'}]


</script>

<template>
	<div class="h-screen w-full">
		<Map :is-hider="true" :hider="hiders" :seekers="seekers" :circles="[]"/>
	</div>
</template>
