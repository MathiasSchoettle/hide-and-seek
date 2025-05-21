// type for all allowed messages from client to server
export type ClientMessage = {
	id?: string,
	message: 
		// requests
		| { type: 'connectRequest', value: ConnectRequest }
		| { type: 'createNewRoomRequest', value: CreateNewRoomRequest }
		| { type: 'joinRoomRequest', value: JoinRoomRequest }
		// events
		| { type: 'leaveRoomEvent', value: LeaveRoomEvent }
}
export type ClientPayload = ClientMessage['message']

export type ConnectRequest = {
	userId: string
	username: string
}

export type CreateNewRoomRequest = {}

export type JoinRoomRequest = {
	roomId: string
}

export type LeaveRoomEvent = {
	roomId: string
}

// type for all allowed messages from server to client
export type ServerMessage = {
	id?: string,
	message: 
		// responses
		| { type: 'connectResponse', value: ConnectResponse }
		| { type: 'createNewRoomResponse', value: CreateNewRoomResponse }
		| { type: 'joinRoomResponse', value: JoinRoomResponse }
		| { type: 'failure', value: FailureResponse }
		// events
		| { type: 'updateStateEvent', value: UpdateStateEvent }
}
export type ServerPayload = ServerMessage['message']

export type ConnectResponse = {
}

export type UpdateStateEvent = {
	users: string[]
}

export type CreateNewRoomResponse = {
	roomId: string
}

export type JoinRoomResponse = {
	roomId: string
}

export type FailureResponse = {
	reason: FailureReason
}

export enum FailureReason {
	ALREADY_IN_ROOM = 'Already in room',
	ROOM_DOES_NOT_EXIST = 'Room does not exist',
	INTERNAL_SERVER_ERROR = 'Internal Server error'
}

