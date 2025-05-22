// type for all allowed messages from client to server
export type ClientMessage = {
	id?: string,
	message:
	// requests
	| { type: 'connectRequest', value: ConnectRequest }
	| { type: 'createRoomRequest', value: {} }
	| { type: 'joinRoomRequest', value: JoinRoomRequest }
	// events
	| { type: 'leaveRoomEvent', value: {} }
	| { type: 'closeRoomEvent', value: {} }
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

// type for all allowed messages from server to client
export type ServerMessage = {
	id?: string,
	message:
	// responses
	| { type: 'connectResponse', value: {} }
	| { type: 'createRoomResponse', value: {} }
	| { type: 'joinRoomResponse', value: JoinRoomResponse }
	// events
	| { type: 'updateStateEvent' }
}

export type ServerPayload = ServerMessage['message']

export enum JoinRoomStatus {
	SUCCESS = "success",
	ROOM_DOES_NOT_EXIST = "room_id_not_found",
	ROOM_FULL = "room_full",
}

export type JoinRoomResponse = {
	status: JoinRoomStatus,
}

