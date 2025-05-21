import { type CreateNewRoomResponse, type ClientMessage, type ServerMessage, type FailureResponse, type JoinRoomResponse, type ConnectResponse } from "~/types"
import { useStorage } from '@vueuse/core'

// could this be a composable?
export const useApi = defineStore('api', () => {

	const { $connection } = useNuxtApp()

	const userId = useStorage('userId', crypto.randomUUID())

	function init() {
		// this should be handled somewhere and set a value to indicate we are connected.
		wrapRequest<ConnectResponse>({
			type: 'connectRequest',
			value: {
				userId: userId.value,
				username: 'test'
			}
		}, 'connectResponse')
	}

	init()

	// move to state store
	const users = ref<string[]>([])

	watchSyncEffect(() => {
		const message = $connection.lastMessage

		console.debug(message)

		switch(message.value?.message.type) {
			case 'updateStateEvent':
				users.value = message.value.message.value.users
				break
		}
	})

	function wrapRequest<T>(request: ClientMessage['message'], expectedType: ServerMessage['message']['type']) {
		return new Promise<T>((resolve, reject) => {
			$connection.sendRequest({ message: request })
			.then((response: ServerMessage) => {
				if (response.message.type === expectedType) {
					resolve(response.message.value as T)
				} else if (response.message.type === 'failure') {
					reject(response.message.value as FailureResponse)
				}

				reject(new Error(`Unexpected Response: ${JSON.stringify(response)}`))
			})
			.catch(error => {
				reject(error)
			})
		})
	}

	function createNewRoom(): Promise<CreateNewRoomResponse> {
		return wrapRequest<CreateNewRoomResponse>({
			type: 'createNewRoomRequest',
			value: {}
		}, 'createNewRoomResponse')
	}

	function joinRoom(roomId: string): Promise<JoinRoomResponse> {
		return wrapRequest<JoinRoomResponse>({
			type: 'joinRoomRequest',
			value: {
				roomId: roomId
			}
		}, 'joinRoomResponse')
	}

	function leaveRoom(roomId: string) {
		$connection.sendEvent({
			message: {
				type: 'leaveRoomEvent',
				value: {
					roomId: roomId
				}
			}
		})
	}

	return {
		createNewRoom,
		joinRoom,
		leaveRoom,

		users
	}
})
