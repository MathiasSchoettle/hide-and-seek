import { ClientPayload, MoinRequest, JoinRoomRequest, LeaveRoomEvent, ServerMessage, ServerPayload, CreateRoomRequest, CloseRoomEvent, CompassMoinRequest } from "~/types";
import { Peer } from 'crossws'
import { state } from "./state";

type MessageHandler<T> = (message: T, peer: Peer) => Promise<ServerPayload | undefined>;

async function onMoin(message: MoinRequest, peer: Peer): Promise<ServerPayload> {
	state.connectUser(message.userId, message.username, peer);
	// TODO do something
	return {
		type: 'moinMoinResponse',
		value: {}
	}
}
async function onCompassMoin(message: CompassMoinRequest, peer: Peer): Promise<ServerPayload> {
	state.connectCompass(message.userId, peer);
	// TODO do something
	return {
		type: 'moinMoinResponse',
		value: {}
	}
}

async function onCreateRoom(_message: CreateRoomRequest, peer: Peer): Promise<ServerPayload> {
	state.createRoom(peer.id);

	return {
		type: 'createRoomResponse',
		value: {},
	}
}

async function onJoinRoom(message: JoinRoomRequest, peer: Peer): Promise<ServerPayload> {
	const status = state.joinRoom(peer.id, message.roomId);

	return {
		type: 'joinRoomResponse',
		value: {
			status,
		}
	}
}

async function onLeaveRoom(message: LeaveRoomEvent, peer: Peer): Promise<undefined> {
	state.leaveRoom(peer.id);
}

async function onCloseRoom(message: CloseRoomEvent, peer: Peer): Promise<undefined> {
	state.closeRoom(peer.id);
}

const commandRegistry: {
	[K in ClientPayload as K['type']]: MessageHandler<K['value']>
} = {
	moinRequest: onMoin,
	compassMoinRequest: onCompassMoin,
	createRoomRequest: onCreateRoom,
	joinRoomRequest: onJoinRoom,
	leaveRoomEvent: onLeaveRoom,
	closeRoomEvent: onCloseRoom,
};


export function handle(message: ClientPayload, peer: Peer): Promise<ServerPayload | undefined> {
	const { type, value } = message
	const handler = commandRegistry[type as keyof typeof commandRegistry] as MessageHandler<typeof value>;

	return handler(value, peer)
}
