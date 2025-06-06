import type { MapCircleType, Position, QuestionString } from "~/server/utils/state"
import type { ClientMessage, CreateRoomResponse, JoinRoomResponse, MoinMoinResponse, ServerMessage } from "~/types"

// could this be a composable?
export const useApi = defineStore('api', () => {

	const { $connection } = useNuxtApp()

	const userState = ref<UserState>()

	watchSyncEffect(() => {
		const message = $connection.lastMessage

		switch (message.value?.message.type) {
			case 'updateStateEvent':
				userState.value = message.value.message.value.state
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

	function askQuestion(question: QuestionString) {
		$connection.sendEvent({
			message: {
				type: 'askQuestionEvent',
				value: {
					question
				}
			}
		});
	}

	function answerQuestion(question: QuestionString, answer: string | null) {
		$connection.sendEvent({
			message: {
				type: 'answerQuestionEvent',
				value: {
					question,
					answer,
				}
			}
		});
	}

	function addMapCircle(type: MapCircleType, position: Position) {
		$connection.sendEvent({
			message: {
				type: "addMapCircle",
				value: {
					type,
					position,
				}
			}
		})
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

	function setHider(userId: string) {
		$connection.sendEvent({
			message: {
				type: 'setHiderEvent',
				value: {
					hiderId: userId
				}
			}
		})
	}

	function sendGeoData(lat: number, long: number) {
		$connection.sendEvent({
			message: {
				type: 'positionEvent',
				value: {
					postiion: {
						lat: lat,
						long: long
					}
				}
			}
		})
	}

	function startGame() {
		$connection.sendEvent({
			message: {
				type: 'gameStartEvent',
				value: {}
			}
		})
	}

	function finishEarly() {
		$connection.sendEvent({
			message: {
				type: 'startSeekingPhaseEvent',
				value: {}
			}
		})
	}

	function wasFound() {
		$connection.sendEvent({
			message: {
				type: 'hiderFoundEvent',
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
		setHider,
		sendGeoData,
		startGame,
		finishEarly,
		wasFound,
		askQuestion,
		answerQuestion,
		addMapCircle,

		userState
	}
})
