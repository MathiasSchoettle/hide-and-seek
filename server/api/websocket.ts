import type { ClientMessage, ServerPayload } from "~/types"
import { FailureReason } from '~/types'
import { handle } from "../utils/commands"

export default defineWebSocketHandler({
	open(peer) {},
	close(peer) {},
	error(peer) {},
	async message(peer, message) {
		const clientMessage: ClientMessage = JSON.parse(message.toString())

		const response = await handle(clientMessage.message, peer)
			.then(message => message)
			.catch(() => {
				return {
					type: 'failure',
					value: { 
						reason: FailureReason.INTERNAL_SERVER_ERROR 
					}
				} as ServerPayload
			})

		if (response) {
			peer.send(JSON.stringify({
				id: clientMessage.id,
				message: response
			}))
		}
	}
})