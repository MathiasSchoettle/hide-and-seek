import {v4 as uuidv4} from 'uuid'

export const useStateStore = defineStore('state', () => {
	
	const api = useApi()

	const username = useLocalStorage('username', '')
	const userId = useLocalStorage('userId', uuidv4())

	const roomId = ref()

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
