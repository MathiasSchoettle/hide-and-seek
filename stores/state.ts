import { v4 as uuidv4 } from 'uuid'
import type { GamePhase } from '~/server/utils/state'

export const useStateStore = defineStore('state', () => {

	const api = useApi()
	const { $connection } = useNuxtApp()

	const username = useLocalStorage('username', '')
	const userId = useLocalStorage('userId', uuidv4())

	const waitingForUpdate = ref(true)

	watch(() => api.userState, () => {
		if (waitingForUpdate.value) {
			waitingForUpdate.value = false
		}
	})

	watchEffect(() => {
		if (
			$connection.status.value === 'OPEN' ||
			!!username.value ||
			!!userId.value
		) {
			api.sayMoin(userId.value, username.value)
		}
	})

	const roomId = computed(() => api.userState?.room?.id)

	const isHider = computed(() => api.userState?.room?.hiderId === userId.value)

	const coinCount = computed(() => {
		const room = api.userState?.room;
		if (room === undefined || isHider.value === undefined) {
			return 0;
		}

		return (isHider.value ? room.nHiderCoins : room.nSeekerCoins) ?? 0
	});

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

		return seekerIds?.map(id => ({ lat: positions[id].lat, lng: positions[id].long, name: api.userState?.userNames[id] ?? 'empty' }))
	})

	const hiderPosition = computed(() => {
		const hiderId = api.userState?.room?.hiderId ?? ''

		const position = api.userState?.room?.positions[hiderId]

		return { lat: position?.lat ?? 0, lng: position?.long ?? 0, name: api.userState?.userNames[hiderId!] ?? 'empty' }
	})

	watch(() => api.userState, (state) => {
		// maybe something else
	})

	const geo = ref<{
		lat: number,
		lon: number,
		error: string,
		last: Date
		accuracy: number
	}>()

	const isLeader = computed(() => api.userState?.room?.ownerId === userId.value)

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
		geo,
		coinCount,
		isLeader,
	}
})

export type InternalUser = {
	id: string
	username: string
	isOwner: boolean
	isHider: boolean
}