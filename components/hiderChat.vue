
<script setup lang="ts">
import { SKIP_QUESTION_COST } from '~/server/utils/state'

const api = useApi()
const stateStore = useStateStore()


const questions = computed(() => api.userState?.room?.questions ?? [])

const lastQ = computed(() => questions.value.at(-1))


const sendDisabled = computed(() => questions.value?.at(-1)?.answer !== undefined )
const skipDisabled = computed(() => stateStore.coinCount < SKIP_QUESTION_COST)

const textinput = ref('')

function handleSend() {
	const q = questions.value?.at(-1)?.question

	if (q) {
		api.answerQuestion(q, textinput.value)
	}

	textinput.value = ''
}

function handleSkip() {
	const q = questions.value?.at(-1)?.question

	if (q) {
		api.answerQuestion(q, null)
	}
}

</script>

<template>
	<div class="h-full w-full flex flex-col p-4 gap-2 bg-neutral-900">
		<div class="grow w-full overflow-hidden">
			<div class="h-full flex flex-col gap-2 overflow-scroll">

				<template v-for="(question, index) in questions" :key="index">
					<div class="p-2 rounded-md max-w-3/5 flex flex-col bg-neutral-700 mr-auto">
						{{ question.question }}
					</div>

					<div class="ml-auto" v-if="question.answer === undefined">
						<UiButton @click="handleSkip" :disabled="skipDisabled" leading-icon="i-lucide-chevrons-right">Skip for {{ SKIP_QUESTION_COST }}</UiButton>
					</div>

					<div v-else-if="question.answer === null" class="p-2 rounded-md max-w-3/5 flex flex-col bg-neutral-500 ml-auto italic">
						Skipped
					</div>

					<div v-else class="p-2 rounded-md max-w-3/5 flex flex-col bg-neutral-500 ml-auto">
						{{ question.answer }}
					</div>
				</template>
			</div>
		</div>

		<div class="w-full flex gap-4">
			<UiInput v-model="textinput" :disabled="sendDisabled" size="xl" :ui="{ root: 'grow' }" type="text"/>
			<UiButton @click="handleSend" :disabled="sendDisabled" :ui="{ base: 'px-5', trailingIcon: 'text-4xl' }" size="sm" trailing-icon="i-lucide-send-horizontal"></UiButton>
		</div>
	</div>
</template>