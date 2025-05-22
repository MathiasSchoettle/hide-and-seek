// type for all allowed messages from client to server
export type ClientMessage = {
	id?: string,
	message:
	// requests
	| { type: 'moinRequest', value: MoinRequest }
	| { type: 'createRoomRequest', value: CreateRoomRequest }
	| { type: 'joinRoomRequest', value: JoinRoomRequest }
	// events
	| { type: 'leaveRoomEvent', value: LeaveRoomEvent }
	| { type: 'closeRoomEvent', value: CloseRoomEvent }
}
export type ClientPayload = ClientMessage['message']

export type MoinRequest = {
	userId: string
	username: string
}

export type CreateRoomRequest = {}

export type JoinRoomRequest = {
	roomId: string
}

export type LeaveRoomEvent = {}

export type CloseRoomEvent = {}

// type for all allowed messages from server to client
export type ServerMessage = {
	id?: string,
	message:
	// responses
	| { type: 'moinMoinResponse', value: MoinMoinResponse }
	| { type: 'createRoomResponse', value: CreateRoomResponse }
	| { type: 'joinRoomResponse', value: JoinRoomResponse }
	// events
	| { type: 'updateStateEvent', value: UpdateStateEvent }
}
export type ServerPayload = ServerMessage['message']

export type MoinMoinResponse = {}

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

}