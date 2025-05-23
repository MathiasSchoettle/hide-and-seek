import { Peer } from 'crossws';
import { JoinRoomStatus, ServerMessage } from '~/types';
import { getDistance } from 'geolib'
import { GeolibInputCoordinates } from 'geolib/es/types';

type User = {
    id: string,
    name: string,
    peer?: Peer,
}

type Compass = {
    userId: string,
    peer?: Peer,
}

export const MAX_ROOM_SIZE = 10;
export const HIDING_DURATION = 15 * 60 * 1000;
export const MAX_HIDER_FOUND_DURATION = 0.5 * 60 * 1000;

export const INITIAL_COIN_COUNT = 50;
export const QUESTION_COST = 10;
export const COINT_INCREMENT_INTERVAL = 60 * 1000;

export const SKIP_QUESTION_COST = 35;

type Room = {
    id: string,
    ownerId: string,
    userIds: string[],
    hiderId: string,
    gamePhase: GamePhase,
    positions: Record<string, Position>,
    nHiderCoins: number,
    nSeekerCoins: number,
    hidingTimeEnd?: number,
    hiderFoundTime?: number,
    questions: Question[],
    mapCircles: MapCircle[],
}

export type Question = {
    question: string,
    answer: string | undefined | null,
}

export const questions = [
    "Is your latitude higher or lower than mine?",
    "Is your longitude higher or lower than mine?",
    "Describe a building in your line of sight",
    "What is the color of the closest building to you",
    "What is the most dominant sound in your area?",
    "How long would it take to walk to the nearest bus or train station?",
    "Are you indoors?",
    "Are you on the main campus?",
    "Are on ground level",
    "Can you see a minimum of 5 trees from where you are?",
    "Are you near water?",
    "Do you have a strong Wifi signal?",
    "Are you likely to be interrupted or seen where you are?",
    "Are there flyers or posters on the walls near you?",
    "If I yelled your name right now, would you hear me?",
    "Can I get to your location without using stairs?",
    "Which is the nearest cafeteria?",
]

export enum GamePhase {
    LOBBY = "lobby",
    HIDING = "hiding",
    SEEKING = "seeking",
    HIDER_FOUND = "hiderFound",
}

export type Position = {
    lat: number,
    long: number,
}

export type UserState = {
    room?: Room,
    userNames: Record<string, string>,
};

export enum MapCircleType {
    SMOKE_BOMB = "smoke_bomb",
    FREEZE_BOMB = "freeze_bomb",
    SEEKERS_FORTUNE = "seekers_fortnue"
}

export const getMapCircleDuration = (type: MapCircleType): number => {
    switch (type) {
        case MapCircleType.SMOKE_BOMB:
        case MapCircleType.FREEZE_BOMB:
            return 5 * 60 * 1000;
        case MapCircleType.SEEKERS_FORTUNE:
            return 10 * 60 * 1000;
    }
}

export const getMapCircleRadius = (type: MapCircleType): number => {
    return 100; // meters
}
export const getMapCircleCost = (type: MapCircleType): number => {
    switch (type) {
        case MapCircleType.SMOKE_BOMB:
            return 30;
        case MapCircleType.FREEZE_BOMB:
            return 25;
        case MapCircleType.SEEKERS_FORTUNE:
            return -10;
    }
}

export type MapCircle = {
    type: MapCircleType,
    position: Position,
    radius: number,
    activeUntil: number,
}

export class State {
    private users: User[];
    private compasses: Compass[];
    private rooms: Room[];
    private intervals: Record<string, NodeJS.Timeout>;
    constructor() {
        this.users = [];
        this.compasses = [];
        this.rooms = [];
        this.intervals = {};
    }

    private getUserByPeerId(peerId: string): User | undefined {
        return this.users.find(user => {
            if (user.peer === undefined) return false;
            return user.peer.id === peerId;
        })
    }

    private getRoomByUserId(id: string): Room | undefined {
        return this.rooms.find(room => room.userIds.find(id2 => id === id2) !== undefined)
    }
    private generateRoomId() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' as const
        const digit = () => chars[Math.floor(Math.random() * (chars.length - 1))]
        while (true) {
            const id = `${digit()}${digit()}${digit()}${digit()}`
            if (this.rooms.find(room => room.id === id) === undefined) {
                return id;
            }
        }
    }
    private getUserNameMapping(userIds: string[]): Record<string, string> {
        const mapping: Record<string, string> = {};
        for (const id of userIds) {
            const user = this.users.find(u => u.id === id);
            if (user !== undefined) {
                mapping[user.id] = user.name;
            }
        }
        return mapping;
    }

    private removeRoom(room: Room) {
        const interval = this.intervals[room.id];
        if (interval !== undefined) {
            clearInterval(interval);
        }
        const index = this.rooms.findIndex(r => r === room);
        this.rooms.splice(index, 1);
    }

    connectUser(id: string, name: string, peer: Peer): void {
        const user = this.users.find(u => u.id === id);
        if (user !== undefined) {
            user.name = name;
            user.peer = peer;
            return;
        }
        this.users.push({
            id,
            name,
            peer,
        })
    }

    connectCompass(userId: string, peer: Peer): void {
        const compass = this.compasses.find(c => c.userId === userId);
        if (compass !== undefined) {
            compass.peer = peer;
            return;
        }
        this.compasses.push({
            userId,
            peer,
        })
    }

    disconnectPeer(peerId: string) {
        const user = this.getUserByPeerId(peerId);
        if (user !== undefined) {
            this.disconnectUser(user);
        } else {
            const compass = this.compasses.find(c => {
                if (c.peer === undefined) {
                    return false;
                }
                return c.peer.id === peerId;
            });
            if (compass !== undefined) {
                this.disconnectCompass(compass);
            }
        }
    }

    private disconnectCompass(compass: Compass) {
        compass.peer = undefined;
    }

    private disconnectUser(user: User) {
        user.peer = undefined;

        const room = this.getRoomByUserId(user.id);

        // If the user is not in room, do nothing
        if (room === undefined) {
            return;
        }
        // If the owner disconnects, he stays in the room
        if (room.ownerId === user.id) {
            return;
        }
        // If the game has already started, the user does not leave
        if (room.gamePhase === GamePhase.LOBBY) {
            room.userIds.splice(room.userIds.indexOf(user.id), 1);
        }

    }

    publishGameStates() {
        for (const user of this.users) {
            if (user.peer !== undefined) {
                this.sendUserState(user.id, user.peer);
            }
        }
        for (const compass of this.compasses) {
            if (compass.peer !== undefined) {
                this.sendUserState(compass.userId, compass.peer);
            }
        }
    }

    sendUserState(userId: string, peer: Peer) {
        const state = this.getUserState(userId);
        const event: ServerMessage = {
            message: {
                type: 'updateStateEvent',
                value: { state },
            }
        }
        const stateMessage = JSON.stringify(event)
        peer.send(stateMessage);
    }

    private getUserState(userId: string): UserState {
        const user = this.users.find(u => u.id === userId);
        if (user === undefined) {
            return {
                room: undefined,
                userNames: {},
            }
        }
        const relevantUserIds = new Set<string>();
        relevantUserIds.add(user.id);

        const room = this.getRoomByUserId(user.id);
        if (room !== undefined) {
            for (const id of room.userIds) {
                relevantUserIds.add(id);
            }
        }
        return {
            room,
            userNames: this.getUserNameMapping(Array.from(relevantUserIds))
        };
    }

    createRoom(peerId: string) {
        const user = this.getUserByPeerId(peerId);
        if (user === undefined) {
            return;
        }
        const existingRoom = this.getRoomByUserId(user.id);
        if (existingRoom !== undefined) {
            return;
        }
        const room: Room = {
            id: this.generateRoomId(),
            ownerId: user.id,
            userIds: [user.id],
            hiderId: user.id,
            gamePhase: GamePhase.LOBBY,
            nHiderCoins: INITIAL_COIN_COUNT,
            nSeekerCoins: INITIAL_COIN_COUNT,
            positions: {},
            questions: [],
            mapCircles: [],
        }
        this.rooms.push(room)
    }

    joinRoom(peerId: string, roomId: string): JoinRoomStatus {
        const user = this.getUserByPeerId(peerId);
        if (user === undefined) {
            return JoinRoomStatus.ROOM_DOES_NOT_EXIST;
        }
        if (this.getRoomByUserId(user.id) !== undefined) {
            return JoinRoomStatus.ALREADY_IN_ROOM;
        }
        const room = this.rooms.find(r => r.id === roomId);
        if (room === undefined) {
            return JoinRoomStatus.ROOM_DOES_NOT_EXIST;
        }
        if (room.userIds.length >= MAX_ROOM_SIZE) {
            return JoinRoomStatus.ROOM_FULL;
        }
        room.userIds.push(user.id);
        return JoinRoomStatus.SUCCESS;
    }

    leaveRoom(peerId: string) {
        const user: User | undefined = this.getUserByPeerId(peerId);
        if (user === undefined) {
            return;
        }
        const room: Room | undefined = this.getRoomByUserId(user.id);
        if (room === undefined) {
            return;
        }
        if (room.ownerId === user.id) {
            return;
        }
        const index = room.userIds.findIndex(id => id === user.id);
        room.userIds.splice(index, 1);
    }

    closeRoom(peerId: string) {
        const user: User | undefined = this.getUserByPeerId(peerId);
        if (user === undefined) {
            return;
        }
        const room: Room | undefined = this.getRoomByUserId(user.id);
        if (room === undefined) {
            return;
        }
        if (room.ownerId !== user.id) {
            return;
        }
        this.removeRoom(room);
    }

    updatePosition(peerId: string, position: Position) {
        const user = this.getUserByPeerId(peerId);
        if (user === undefined) {
            return;
        }
        const room = this.getRoomByUserId(user.id);
        if (room === undefined) {
            return;
        }
        room.positions[user.id] = position;
    }

    setHider(peerId: string, hiderId: string) {
        const user = this.getUserByPeerId(peerId);
        if (user === undefined) {
            return;
        }

        const room = this.getRoomByUserId(user.id);

        // only the owner is allowed to do this and only if the game has not started.
        if (room === undefined || room.ownerId !== user.id || room.gamePhase !== GamePhase.LOBBY) {
            return;
        }

        // the hider must be in the room
        if (!room.userIds.includes(hiderId)) {
            return;
        }
        room.hiderId = hiderId;
        if (user.peer !== undefined) {
            this.sendUserState(user.id, user.peer);
        }
    }

    startGame(peerId: string) {
        const user = this.getUserByPeerId(peerId);
        if (user === undefined) {
            return;
        }
        const room = this.getRoomByUserId(user.id);

        // only the owner is allowed to do this and only if the game has not started.
        if (room === undefined || room.ownerId !== user.id || room.gamePhase !== GamePhase.LOBBY) {
            return;
        }

        room.gamePhase = GamePhase.HIDING;
        room.hidingTimeEnd = Date.now() + HIDING_DURATION;
    }

    startSeekingPhase(peerId: string) {
        const user = this.getUserByPeerId(peerId);
        if (user === undefined) {
            return;
        }
        const room = this.getRoomByUserId(user.id);

        // only the hider is allowed to do this and only if the game phase is HIDING
        if (room === undefined || room.hiderId !== user.id || room.gamePhase !== GamePhase.HIDING) {
            return;
        }

        this._startSeekingPhase(room)
    }

    private _startSeekingPhase(room: Room) {
        room.hidingTimeEnd = Date.now();
        room.gamePhase = GamePhase.SEEKING;

        this.intervals[room.id] = setInterval(() => {
            this.incrementCoins(room);
        }, COINT_INCREMENT_INTERVAL);
    }

    private incrementCoins(room: Room) {
        if (room.gamePhase !== GamePhase.SEEKING) {
            return;
        }
        room.nHiderCoins += 1;
        room.nSeekerCoins += 1;
        this.handleSeekersFortune(room);
    }

    private handleSeekersFortune(room: Room) {
        for (const circle of room.mapCircles) {
            if (circle.type !== MapCircleType.SEEKERS_FORTUNE) {
                continue;
            }
            for (const userId of room.userIds) {
                if (userId === room.hiderId) {
                    continue;
                }
                const circlePosition = {
                    lat: circle.position.lat,
                    lon: circle.position.long,
                }
                const userPosition = {
                    lat: room.positions[userId]?.lat ?? 0,
                    lon: room.positions[userId]?.long ?? 0,
                }
                if (getDistance(circlePosition, userPosition) <= circle.radius) {
                    room.nSeekerCoins += 1;
                }
            }
        }
    }

    updateTimers() {
        const now = Date.now();
        for (const room of this.rooms) {
            if (room.gamePhase === GamePhase.HIDING) {
                if (room.hidingTimeEnd === undefined) {
                    throw Error("Unreachable state: game phase hiding but no timer")
                }
                if (now > room.hidingTimeEnd) {
                    this._startSeekingPhase(room);
                }
            } else if (room.gamePhase === GamePhase.SEEKING) {
                // update circles
                room.mapCircles = room.mapCircles.filter(circle => now <= circle.activeUntil);
            } else if (room.gamePhase === GamePhase.HIDER_FOUND) {
                if (room.hiderFoundTime === undefined) {
                    throw Error("Unreachable state: game phase HIDER_FOUND but no found time")
                }
                if (now > room.hiderFoundTime + MAX_HIDER_FOUND_DURATION) {
                    this.removeRoom(room);
                }
            }
        }
    }

    hiderFound(peerId: string) {
        const user = this.getUserByPeerId(peerId);
        if (user === undefined) {
            return;
        }

        const room = this.getRoomByUserId(user.id);

        // only the hider is allowed to do this and only if the game phase is SEEKING
        if (room === undefined || room.hiderId !== user.id || room.gamePhase !== GamePhase.SEEKING) {
            return;
        }

        room.gamePhase = GamePhase.HIDER_FOUND;
        room.hiderFoundTime = Date.now();
    }

    askQuestion(peerId: string, question: string) {
        const user = this.getUserByPeerId(peerId);
        if (user === undefined) {
            return;
        }
        const room = this.getRoomByUserId(user.id);

        // only seekers can do this and only in seeking phase
        if (room === undefined || room.hiderId === user.id || room.gamePhase !== GamePhase.SEEKING) {
            console.error(`User ${user.id} cannot perform "askQuestion" in room ${JSON.stringify(room)}`)
            return;
        }

        if (!questions.includes(question)) {
            console.error(`invalid question "${question}"`);
            return;
        }

        if (room.questions.find(q => q.question === question) !== undefined) {
            console.error(`Question "${question}" has already been asked`);
            return;
        }

        if (room.questions.find(q => q.answer === undefined) !== undefined) {
            console.error(`You have to wait for the answer to the previous question before asking another one`);
            return;
        }

        if (room.nSeekerCoins < QUESTION_COST) {
            console.error(`You don't have enough coins to ask a question`);
            return;
        }

        room.questions.push({ question, answer: undefined });
        room.nSeekerCoins -= QUESTION_COST;
    }

    answerQuestion(peerId: string, question: string, answer: string | null) {
        const user = this.getUserByPeerId(peerId);
        if (user === undefined) {
            return;
        }
        const room = this.getRoomByUserId(user.id);

        // only hiders can do this and only in seeking phase
        if (room === undefined || room.hiderId !== user.id || room.gamePhase !== GamePhase.SEEKING) {
            console.error(`User ${user.id} cannot perform "askQuestion" in room ${JSON.stringify(room)}`)
            return;
        }

        const roomQuestion = room.questions.find(q => q.question === question);
        if (roomQuestion === undefined) {
            console.error(`Question "${question}" does not exist`);
            return;
        }

        if (roomQuestion.answer !== undefined) {
            console.error(`Question "${question}" has already been answered`);
            return;
        }

        if (answer === null) {
            if (room.nHiderCoins < SKIP_QUESTION_COST) {
                console.error(`Not enough coins to skip question`);
                return;
            }
            room.nHiderCoins -= SKIP_QUESTION_COST;
        }
        roomQuestion.answer = answer;
    }

    addMapCircle(peerId: string, type: MapCircleType, position: Position) {
        const user = this.getUserByPeerId(peerId);
        if (user === undefined) {
            return;
        }
        const room = this.getRoomByUserId(user.id);

        // only hiders can do this and only in seeking phase
        if (room === undefined || room.hiderId !== user.id || room.gamePhase !== GamePhase.SEEKING) {
            console.error(`User ${user.id} cannot perform "addMapCircle" in room ${JSON.stringify(room)}`)
            return;
        }

        const cost = getMapCircleCost(type);

        if (room.nHiderCoins < cost) {
            console.error("Not enough coins to add circle " + type);
            return;
        }

        const circle: MapCircle = {
            type,
            position,
            activeUntil: Date.now() + getMapCircleDuration(type),
            radius: getMapCircleRadius(type),
        }

        room.mapCircles.push(circle);
        room.nHiderCoins -= cost;
    }
}

export const state = new State();