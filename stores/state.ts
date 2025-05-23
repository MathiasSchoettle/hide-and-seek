import {v4 as uuidv4} from 'uuid'
import type { GamePhase } from '~/server/utils/state'

export const useStateStore = defineStore('state', () => {
	
	const api = useApi()

	const username = useLocalStorage('username', '')
	const userId = useLocalStorage('userId', uuidv4())

	const waitingForUpdate = ref(true)

	watch(() => api.userState, () => {
		if (waitingForUpdate.value) {
			waitingForUpdate.value = false
		}
	})

	const roomId = computed(() => api.userState?.room?.id)

	const isHider = computed(() => api.userState?.room?.hiderId === userId.value)

	const hidingEndTime = computed(() => api.userState?.room?.hidingTimeEnd ?? 0)
	
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

	const seekerPositions = computed(() => {
		const hiderId = api.userState?.room?.hiderId

		const seekerIds = api.userState?.room?.userIds.filter(id => id !== hiderId) ?? []
		const positions = api.userState?.room?.positions

		if (!positions) return []

		return seekerIds?.map(id => positions[id]).map(pos => ({ lat: pos.lat, lng: pos.long }))
	})

	const hiderPosition = computed(() => {
		const hiderId = api.userState?.room?.hiderId ?? ''

		const position = api.userState?.room?.positions[hiderId]

		return { lat: position?.lat ?? 0, lng: position?.long ?? 0 }
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
		gameState,
		hidingEndTime,
		isHider,
		seekerPositions,
		hiderPosition,
	}
})

export type InternalUser = {
	id: string
	username: string
	isOwner: boolean
	isHider: boolean
}