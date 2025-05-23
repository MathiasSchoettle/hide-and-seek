import { ClientPayload, MoinRequest, JoinRoomRequest, LeaveRoomEvent, ServerMessage, ServerPayload, CreateRoomRequest, CloseRoomEvent, CompassMoinRequest, PositionEvent, SetHiderEvent, GameStartEvent, HiderFoundEvent, GameFinishEvent, AskQuestionEvent, AnswerQuestionEvent, AddMapCircleEvent, BuyCompassEvent } from "~/types";
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

async function onPosition(message: PositionEvent, peer: Peer): Promise<undefined> {
	state.updatePosition(peer.id, message.postiion);
}

async function onSetHider(message: SetHiderEvent, peer: Peer): Promise<undefined> {
	state.setHider(peer.id, message.hiderId);
}
async function onGameStart(message: GameStartEvent, peer: Peer): Promise<undefined> {
	state.startGame(peer.id);
}
async function onStartSeekingPhase(message: GameStartEvent, peer: Peer): Promise<undefined> {
	state.startSeekingPhase(peer.id);
}
async function onHiderFound(message: HiderFoundEvent, peer: Peer): Promise<undefined> {
	state.hiderFound(peer.id);
}
async function onAskQuestion(message: AskQuestionEvent, peer: Peer): Promise<undefined> {
	state.askQuestion(peer.id, message.question);
}
async function onAnswerQuestion(message: AnswerQuestionEvent, peer: Peer): Promise<undefined> {
	state.answerQuestion(peer.id, message.question, message.answer);
}
async function onAddMapCircle(message: AddMapCircleEvent, peer: Peer): Promise<undefined> {
	state.addMapCircle(peer.id, message.type, message.position);
}
async function onBuyCompass(message: BuyCompassEvent, peer: Peer): Promise<undefined> {
	state.buyCompass(peer.id);
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
	positionEvent: onPosition,
	setHiderEvent: onSetHider,
	gameStartEvent: onGameStart,
	startSeekingPhaseEvent: onStartSeekingPhase,
	hiderFoundEvent: onHiderFound,
	askQuestionEvent: onAskQuestion,
	answerQuestionEvent: onAnswerQuestion,
	addMapCircle: onAddMapCircle,
	buyCompass: onBuyCompass,
};


export function handle(message: ClientPayload, peer: Peer): Promise<ServerPayload | undefined> {
	const { type, value } = message
	const handler = commandRegistry[type as keyof typeof commandRegistry] as MessageHandler<typeof value>;

	return handler(value, peer)
}
