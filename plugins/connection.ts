import type { ClientMessage, ServerMessage } from "~/types"

export default defineNuxtPlugin(() => {

	// TODO need "real" URL here
	// TODO authentication?

	const protocol = import.meta.dev ? 'ws' : 'wss'

	const { host } = useRequestURL()
	const { status, data, send, open } = useWebSocket(`${protocol}://${host}/api/websocket`, { autoReconnect: true })

	let nextId: bigint = 0n

	const lastMessage = ref<ServerMessage>()
	const pendingRequests = new Map<string, (response: ServerMessage) => void>()

	watchSyncEffect(() => {

		if (!data.value) return

		const message: ServerMessage = JSON.parse(data.value)

		console.log('RECEIVE_MESSAGE', JSON.stringify(message, null, 2));

		if (message.id) {
			// the server message is a response
			const resolvePending = pendingRequests.get(message.id)

			if (resolvePending) {
				pendingRequests.delete(message.id)
				resolvePending(message)
				return
			}
		}

		lastMessage.value = message
	})

	function sendEvent(event: ClientMessage): void {
		const payload = JSON.stringify(event)
		send(payload)
	}

	function sendRequest(request: ClientMessage, timeout = 10000): Promise<ServerMessage> {
		const id = `${++nextId}`
		request.id = id

		const requestPromise = new Promise<ServerMessage>((resolve, _) => {
			pendingRequests.set(id, (response: ServerMessage) => resolve(response))
			console.debug('SEND_REQEUST', request)
			const payload = JSON.stringify(request)
			send(payload)
		})

		return wrapInTimeout(requestPromise, timeout)
	}

	const connection = {
		lastMessage,
		status,

		sendEvent,
		sendRequest
	}

	return {
		provide: {
			connection: connection
		}
	}
})

async function wrapInTimeout<T>(promise: Promise<T>, timeout: number): Promise<T> {
	let timer: NodeJS.Timeout
	return Promise.race([
		promise,
		new Promise<T>((_resolve, reject) => timer = setTimeout(() => reject('timeout'), timeout))
	]).finally(() => clearTimeout(timer))
}