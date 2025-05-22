import { highlight } from '@nuxt/ui/runtime/utils/fuse.js';
import { Peer } from 'crossws'

type User = {
    id: string,
    name: string,
    peer: Peer | undefined,
}

class Users {
    users: User[];
    constructor() {
        this.users = []
    }
    addUser(user: User): void {
        this.users.push(user);
    }
    getUserById(id: string): User | undefined {
        return this.users.find(user => user.id === id);
    }
    getUserByPeerId(peerId: string): User | undefined {
        return this.users.find(user => user.peer?.id === peerId);
    }
}


enum RoomStatus {
    LOBBY = "lobby",
    PLAYING = "playing",
}

type Room = {
    id: string,
    status: RoomStatus,
    ownerId: string,
    userIds: string[],
}

class Rooms {
    rooms: Room[];
    constructor() {
        this.rooms = []
    }
}

type UserState =
    | { isInRoom: false }
    | { isInRoom: true, room: Room }

class State {
    users: User[];
    rooms: Room[];
    constructor() {
        this.rooms = [];
        this.users = [];
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

    connectUser(id: string, name: string, peer: Peer): void {
        const user = this.getUserByPeerId(peer.id);
        if (user !== undefined) {
            user.peer = peer;
        }
        this.users.push({
            id,
            name,
            peer,
        })
    }

    disconnectUser(peerId: string) {
        const user = this.getUserByPeerId(peerId);
        if (user === undefined) {
            return;
        }
        user.peer = undefined;
    }

    getUserStateForPeerId(peerId: string): UserState | undefined {
        const user = this.getUserByPeerId(peerId);
        if (user === undefined) {
            return undefined;
        }
        const room = this.getRoomByUserId(user.id);
        if (room === undefined) {
            return { isInRoom: false };
        }
        return {
            isInRoom: true,
            room,
        }
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
            status: RoomStatus.LOBBY,
        }
        return room;
    }

    joinRoom(peerId: string, roomId: string) {
        const user = this.getUserByPeerId(peerId);
        if (user === undefined) {
            return;
        }
        if (this.getRoomByUserId(user.id) !== undefined) {
            return;
        }
        const room = this.rooms.find(r => r.id === roomId);
        if (room === undefined) {
            return;
        }
        room.userIds.push(user.id);
    }

    leaveRoom(peerId: string) {
        const user = this.getRoomByUserId(peerId);
        if (user === undefined) {
            return;
        }
        const room = this.getRoomByUserId(user.id);
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
        const user = this.getRoomByUserId(peerId);
        if (user === undefined) {
            return;
        }
        const room = this.getRoomByUserId(user.id);
        if (room === undefined) {
            return;
        }
        if (room.ownerId !== user.id) {
            return;
        }
        const index = this.rooms.findIndex(r => r === room);
        this.rooms.splice(index, 1);
    }
}