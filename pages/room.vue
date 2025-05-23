<script setup lang="ts">

const users = [
	{
		id: '1',
		username: 'sith98',
		isOwner: true,
		isHider: true
	},
	{
		id: '2',
		username: 'schmaddi',
		isOwner: false,
		isHider: true
	},
		{
		id: '3',
		username: 'Maja',
		isOwner: false,
		isHider: false
	},
]
	
</script>

<template>
	<div class="h-screen w-screen bg-neutral-900 flex flex-col justify-center items-center">
		<LobbyRoom user-id="1" room-id="ABCD" :users="users"/>
	</div>
</template>