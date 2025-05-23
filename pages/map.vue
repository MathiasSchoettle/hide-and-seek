<script lang="ts" setup>
import Map from '@/components/map.vue'

const hider_location = { lat: 49.00252018672146, lng: 12.100188665384959 }
const seeker_location = { lat: 49.00245411928066, lng: 12.097421476143023}

</script>

<template>
	<Map :hider_location="hider_location" :seeker_location="seeker_location" />
</template>
