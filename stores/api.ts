import type { ClientMessage, CreateRoomResponse, JoinRoomResponse, MoinMoinResponse, ServerMessage } from "~/types"


// could this be a composable?
export const useApi = defineStore('api', () => {

	const { $connection } = useNuxtApp()

	const stateStore = useStateStore()

	watchSyncEffect(() => {
		const message = $connection.lastMessage

		switch(message.value?.message.type) {
			case 'updateStateEvent':
				console.debug(message.value.message.value)
				break
		}
	})

	function wrapRequest<T>(request: ClientMessage['message'], expectedType: ServerMessage['message']['type']) {
		return new Promise<T>((resolve, reject) => {
			$connection.sendRequest({ message: request })
			.then((response: ServerMessage) => {
				if (response.message.type === expectedType) {
					resolve(response.message.value as T)
				}

				reject(new Error(`Unexpected Response: ${JSON.stringify(response)}`))
			})
			.catch(error => {
				reject(error)
			})
		})
	}

	function sayMoin(userId: string, username: string): Promise<MoinMoinResponse> {
		return wrapRequest<MoinMoinResponse>({
			type: 'moinRequest',
			value: {
				userId: userId,
				username: username
			}
		}, 'moinMoinResponse')
	}

	function createNewRoom(): Promise<CreateRoomResponse> {
		return wrapRequest<CreateRoomResponse>({
			type: 'createRoomRequest',
			value: {}
		}, 'createRoomResponse')
	}

	function joinRoom(roomId: string): Promise<JoinRoomResponse> {
		return wrapRequest<JoinRoomResponse>({
			type: 'joinRoomRequest',
			value: {
				roomId: roomId
			}
		}, 'joinRoomResponse')
	}

	function leaveRoom() {
		$connection.sendEvent({
			message: {
				type: 'leaveRoomEvent',
				value: {}
			}
		})
	}

	function closeRoom() {
		$connection.sendEvent({
			message: {
				type: 'closeRoomEvent',
				value: {}
			}
		})
	}

	return {
		sayMoin,
		createNewRoom,
		joinRoom,
		leaveRoom,
		closeRoom,
	}
})
