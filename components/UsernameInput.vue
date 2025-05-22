<script setup lang="ts">

const username = ref('')
const stateStore = useStateStore()

function handle() {
	stateStore.username = username.value
}

</script>

<template>
	<div class="w-52 flex flex-col gap-3">
		<UiFormField label="Username">
			<UiInput v-model="username"/>
		</UiFormField>

		<div>
			<UiButton @click="handle">Submit</UiButton>
		</div>
	</div>
</template>	