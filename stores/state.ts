import {v4 as uuidv4} from 'uuid'

export const useStateStore = defineStore('state', () => {
	
	const api = useApi()

	const username = useLocalStorage('username', '')
	const userId = useLocalStorage('userId', uuidv4())

	const receivingUpdates = ref(false)

	until(api.userState)
		.not.toBe(undefined)
		.then(() => receivingUpdates.value = true)

	const roomId = computed(() => api.userState?.room?.id)
	
	const users = computed<InternalUser[]>(() => {

		const room = api.userState?.room
		const usernames = api.userState?.userNames

		if (!room || !usernames) return []

		return room.userIds.map((id) => {
			return {
				id: id,
				username: usernames[id],
				isOwner: room.ownerId === id,
				isHider: room.hiderId === id
			}
		})
	})

	watch(() => api.userState, (state) => {
		// maybe something else
	})

	until(username).toBeTruthy().then(() => {
		console.debug('CONNECTED')
		api.sayMoin(userId.value, username.value)
	})

	return {
		username,
		userId,
		roomId,
		users,
		receivingUpdates
	}
})

export type InternalUser = {
	id: string
	username: string
	isOwner: boolean
	isHider: boolean
}