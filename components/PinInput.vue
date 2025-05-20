<script lang="ts" setup>

const props = defineProps<{
	loading: boolean
	error?: string
}>()

const emit = defineEmits<{
	join: [pin: string]
}>()

function join() {
	emit('join', state.value.pin.join())
}

const state = ref({
	pin: <string[]>[]
})

const joinDisabled = computed(() => state.value.pin.length < 4)

const ui = computed(() => {
	return {
		base: 'uppercase size-12 text-2xl font-extrabold ' + (props.error ? 'ring-red-400' : ''), 
		root: 'gap-2'
	}
})

</script>

<template>
	<div class="flex flex-col gap-5 items-center">
		<UiForm :state="state" @submit.prevent="join" class="flex flex-col items-center gap-3" >

			<UiFormField name="pin" :error="error" :ui="{error: 'text-center'}">
				<UiPinInput :disabled="loading" :length="4" size="xl" v-model="state.pin" :ui="ui"/>
			</UiFormField>

			<UiButton type="submit" :loading="loading" :disabled="joinDisabled" variant="subtle" class="cursor-pointer" size="lg" icon="i-lucide-rocket">
				Join
			</UiButton>
		</UiForm>
	</div>
</template>