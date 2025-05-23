import { Peer } from 'crossws';
import { JoinRoomStatus, ServerMessage } from '~/types';

type User = {
    id: string,
    name: string,
    peer?: Peer,
}

type Compass = {
    userId: string,
    peer?: Peer,
}

const MAX_ROOM_SIZE = 10;
const HIDING_DURATION = 15 * 60 * 1000;

type Room = {
    id: string,
    ownerId: string,
    userIds: string[],
    hiderId: string,
    gamePhase: GamePhase,
    positions: Record<string, Position>
    hidingTimeEnd?: number,
    hiderFoundTime?: number,
}

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

export class State {
    private users: User[];
    private compasses: Compass[];
    private rooms: Room[];
    constructor() {
        this.users = [];
        this.compasses = [];
        this.rooms = [];
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

    connectUser(id: string, name: string, peer: Peer): void {
        const user = this.users.find(u => u.id === id);
        if (user !== undefined) {
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
            positions: {},
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
        const index = this.rooms.findIndex(r => r === room);
        this.rooms.splice(index, 1);
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

        room.gamePhase = GamePhase.SEEKING;
    }

    updateTimers() {
        const now = Date.now();
        for (const room of this.rooms) {
            if (room.gamePhase !== GamePhase.HIDING) {
                continue;
            }
            if (room.hidingTimeEnd === undefined) {
                throw Error("Unreachble state: game phase hiding but no timer")
            }

            if (now > room.hidingTimeEnd) {
                room.gamePhase = GamePhase.SEEKING;
            }
        }
    }

    hiderFound(peerId: string) {
        const user = this.getUserByPeerId(peerId);
        if (user === undefined) {
            return;
        }

        const room = this.getRoomByUserId(user.id);
        if (room === undefined) {
            return;
        }

        // only the hider is allowed to do this and only if the game phase is SEEKING
        if (room === undefined || room.hiderId !== user.id || room.gamePhase !== GamePhase.SEEKING) {
            return;
        }

        room.gamePhase = GamePhase.HIDER_FOUND;
        room.hiderFoundTime = Date.now();
    }
}

export const state = new State();