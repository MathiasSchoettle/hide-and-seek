<script lang="ts" setup>

const props = defineProps<{
	loading: boolean
	error?: string
}>()

const emit = defineEmits<{
	create: [name: string]
}>()

const state = ref({
	username: ''
})

function create() {
	emit('create', state.value.username)
}

const disabled = computed(() => !state.value.username)

</script>

<template>
	<UiForm :state="state" @submit.prevent="create" class="flex flex-col gap-3 items-center">
		<UiFormField name="username" :error="error" :ui="{error: 'text-center'}">
			<UiInput size="xl" :disabled="loading" placeholder="Username" v-model="state.username" class="w-full" />
		</UiFormField>

		<UiButton type="submit" :disabled="disabled" :loading="loading" variant="subtle" class="cursor-pointer" size="lg" icon="i-lucide-rocket">
			Create
		</UiButton>
	</UiForm>
</template>