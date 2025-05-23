import {v4 as uuidv4} from 'uuid'
import type { GamePhase } from '~/server/utils/state'

export const useStateStore = defineStore('state', () => {
	
	const api = useApi()

	const username = useLocalStorage('username', '')
	const userId = useLocalStorage('userId', uuidv4())

	const waitingForUpdate = ref(false)

	watch(waitingForUpdate, () => {
		console.log(waitingForUpdate.value)
	})

	watch(() => api.userState, () => {
		if (waitingForUpdate.value) {
			waitingForUpdate.value = false
		}
	})

	const roomId = computed(() => api.userState?.room?.id)

	const gameState = computed<GamePhase | undefined>(() => api.userState?.room?.gamePhase)
	
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
		waitingForUpdate,
		gameState
	}
})

export type InternalUser = {
	id: string
	username: string
	isOwner: boolean
	isHider: boolean
}