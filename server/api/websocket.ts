import type { ClientMessage } from "~/types"
import { handle } from "../utils/commands"

export default defineWebSocketHandler({
	open(peer) {
		console.debug('open')
	},
	close(peer, details) {
		console.log('closing', details)
	},
	error(peer) {
		console.log('error')
	},
	async message(peer, message) {
		const clientMessage: ClientMessage = JSON.parse(message.toString())

		const response = await handle(clientMessage.message, peer).then(message => message)

		if (response) {
			peer.send(JSON.stringify({
				id: clientMessage.id,
				message: response
			}))
		}
	}
})