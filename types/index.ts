import type { Position, UserState } from "~/server/utils/state"

// type for all allowed messages from client to server
export type ClientMessage = {
	id?: string,
	message:
	// requests
	| { type: 'moinRequest', value: MoinRequest }
	| { type: 'compassMoinRequest', value: CompassMoinRequest }
	| { type: 'createRoomRequest', value: CreateRoomRequest }
	| { type: 'joinRoomRequest', value: JoinRoomRequest }
	// events
	| { type: 'leaveRoomEvent', value: LeaveRoomEvent }
	| { type: 'closeRoomEvent', value: CloseRoomEvent }
	| { type: 'setHiderEvent', value: SetHiderEvent }
	| { type: 'positionEvent', value: PositionEvent }
	| { type: 'gameStartEvent', value: GameStartEvent }
	| { type: "startSeekingPhaseEvent", value: StartSeekingPhaseEvent }
	| { type: "hiderFoundEvent", value: HiderFoundEvent }
	| { type: "askQuestionEvent", value: AskQuestionEvent }
	| { type: "answerQuestionEvent", value: AnswerQuestionEvent }
}
export type ClientPayload = ClientMessage['message']

export type MoinRequest = {
	userId: string
	username: string
}
export type CompassMoinRequest = {
	userId: string
}

export type CreateRoomRequest = {}

export type JoinRoomRequest = {
	roomId: string
}

export type LeaveRoomEvent = {}

export type CloseRoomEvent = {}
export type GameStartEvent = {}
export type StartSeekingPhaseEvent = {}
export type HiderFoundEvent = {}
export type GameFinishEvent = {}

export type AskQuestionEvent = {
	question: string,
}
export type AnswerQuestionEvent = {
	question: string,
	answer: string,
}

export type SetHiderEvent = {
	hiderId: string,
}

export type PositionEvent = {
	postiion: Position
}

// type for all allowed messages from server to client
export type ServerMessage = {
	id?: string,
	message:
	// responses
	| { type: 'moinMoinResponse', value: MoinMoinResponse }
	| { type: 'compassMoinMoinResponse', value: CompassMoinMoinResponse }
	| { type: 'createRoomResponse', value: CreateRoomResponse }
	| { type: 'joinRoomResponse', value: JoinRoomResponse }
	// events
	| { type: 'updateStateEvent', value: UpdateStateEvent }
}
export type ServerPayload = ServerMessage['message']

export type MoinMoinResponse = {}
export type CompassMoinMoinResponse = {}
export type CreateRoomResponse = {}

export type JoinRoomResponse = {
	status: JoinRoomStatus,
}

export enum JoinRoomStatus {
	SUCCESS = "success",
	ROOM_DOES_NOT_EXIST = "room_id_not_found",
	ALREADY_IN_ROOM = "already_in_room",
	ROOM_FULL = "room_full",
}

export type UpdateStateEvent = {
	state: UserState,
}