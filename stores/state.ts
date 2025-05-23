import {v4 as uuidv4} from 'uuid'

export const useStateStore = defineStore('state', () => {
	
	const api = useApi()

	const username = useLocalStorage('username', '')
	const userId = useLocalStorage('userId', uuidv4())

	const roomId = ref()
	const users = ref<string[]>([])

	const receivingUpdates = ref(false)

	until(api.userState)
		.not.toBe(undefined)
		.then(() => receivingUpdates.value = true)

	watch(() => api.userState, (state) => {
		roomId.value = state?.room?.id
		users.value = state?.room?.userIds ?? []
	})

	until(username).toBeTruthy().then(() => {
		console.debug('CONNECTED')
		api.sayMoin(userId.value, username.value)
	})

	return {
		username,
		userId,
		roomId,
	}
})
