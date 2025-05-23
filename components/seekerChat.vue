<script setup lang="ts">
import { questions, type QuestionString} from '~/server/utils/state'

const api = useApi()
const stateStore = useStateStore()

const messages = computed(() => api.userState?.room?.questions ?? [])

const questionsToAsk = computed(() => {
	return Object.values(questions).filter(q => !messages.value.find(m => m.question === q))
})

function doAskQuestion(question: QuestionString) {
	if (!disableInput.value) {
		api.askQuestion(question)
	}
	open.value = false
}

const lastQ = computed(() => messages.value.at(-1))

const disableInput = computed(() => lastQ.value?.answer === undefined && lastQ.value?.question !== undefined)

const open = ref(false)

</script>

<template>
	<div class="h-full w-full flex flex-col p-4 gap-2 bg-neutral-900">

		<div class="h-full w-full overflow-hidden">
			<div class="h-full flex flex-col gap-2 overflow-scroll">
				<template v-for="(question, index) in messages" :key="index">
					<div v-show="question.question" class="p-2 rounded-md max-w-3/5 flex flex-col bg-neutral-500 ml-auto">
						{{ question.question }}
					</div>
					
					<div v-show="question.answer !== undefined" class="p-2 rounded-md max-w-3/5 flex flex-col bg-neutral-700 mr-auto" :class="{ 'italic': question.answer === null}">
						{{ question.answer ?? 'Skipped' }}
					</div>
				</template>
			</div>
		</div>

		<div class="w-full flex gap-4">
			  <UiPopover v-model:open="open">
				<UiButton size="xl" :disabled="disableInput" @click="open = true" :ui="{ base: 'w-full text-center'}" label="Open" color="neutral" variant="subtle" />

				<template #content>
					<div class="flex flex-col gap-2 h-80 overflow-y-scroll">
						<div @click="doAskQuestion(askQuestion)" class="w-full p-3 hover:bg-neutral-700 text-sm" v-for="(askQuestion, index) in questionsToAsk">
							{{ askQuestion }}
						</div>
					</div>
				</template>
			</UiPopover>
		</div>
	</div>
</template>