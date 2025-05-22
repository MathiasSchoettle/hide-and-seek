import { ClientPayload, MoinRequest, JoinRoomRequest, LeaveRoomEvent, ServerMessage, ServerPayload } from "~/types";
import { Peer } from 'crossws'

interface MessageHandler<T> {
	handle(message: T, peer: Peer): Promise<ServerPayload | undefined>;
}

class ConnectRequestHandler implements MessageHandler<CreateNewRoomRequest> {
	async handle(message: MoinRequest, peer: Peer): Promise<ServerPayload> {
		
		// TODO do something

		return {
			type: 'connectResponse',
			value: {}
		}
	}
}

class CreateNewRoomHandler implements MessageHandler<CreateNewRoomRequest> {
	async handle(_message: CreateNewRoomRequest, peer: Peer): Promise<ServerPayload> {

		const roomId = generateRoomId()

		peer.subscribe(roomId)

		addMember(roomId, peer)

		return {
			type: 'createNewRoomResponse',
			value: {
				roomId
			}
		}
	}
}

class JoinRoomHandler implements MessageHandler<JoinRoomRequest> {
	async handle(message: JoinRoomRequest, peer: Peer): Promise<ServerPayload> {

		if (!rooms.has(message.roomId)) {
			return {
				type: 'failure',
				value: {
					reason: FailureReason.ROOM_DOES_NOT_EXIST
				}
			}
		}

		peer.subscribe(message.roomId)

		addMember(message.roomId, peer)

		return {
			type: 'joinRoomResponse',
			value: {
				roomId: message.roomId
			}
		}
	}
}

class LeaveRoomEventHandler implements MessageHandler<LeaveRoomEvent> {
	async handle(message: LeaveRoomEvent, peer: Peer): Promise<undefined> {

		let users = rooms.get(message.roomId)

		if (!users) {
			return
		}

		users = users.filter(users => users.id !== peer.id)

		rooms.set(message.roomId, users)

		peer.unsubscribe(message.roomId)

		const event: ServerMessage = {
			message: {
				type: 'updateStateEvent',
				value: {
					users: users.map(p => p.id)
				}
			}
		}

		const stateMessage = JSON.stringify(event)
		peer.publish(message.roomId, stateMessage)
	}
}

const commandRegistry: {
	[K in ClientPayload as K['type']]: MessageHandler<K['value']>
} = {
	connectRequest: new ConnectRequestHandler(),
	createNewRoomRequest: new CreateNewRoomHandler(),
	joinRoomRequest: new JoinRoomHandler(),
	leaveRoomEvent: new LeaveRoomEventHandler(),
};


export function handle(message: ClientPayload, peer: Peer): Promise<ServerPayload | undefined> {
	const { type, value } = message
	const handler = commandRegistry[type as keyof typeof commandRegistry] as MessageHandler<typeof value>;

	return handler.handle(value, peer)
}

// TODO move somewhere else

const rooms = new Map<string, Peer[]>()

function addMember(roomId: string, peer: Peer) {

	let users = rooms.get(roomId)

	if (!users || !users.length) {
		users = []
		rooms.set(roomId, users)
	}

	users.push(peer)

	const event: ServerMessage = {
		message: {
			type: 'updateStateEvent',
			value: {
				users: users.map(p => p.id)
			}
		}
	}

	const message = JSON.stringify(event)

	peer.publish(roomId, message)
	peer.send(message)
}

function generateRoomId() {
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' as const
	const digit = () => chars[Math.floor(Math.random() * (chars.length - 1))]
	return `${digit()}${digit()}${digit()}${digit()}`
}