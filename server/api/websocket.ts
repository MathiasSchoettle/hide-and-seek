import type { ClientMessage } from "~/types"
import { handle } from "../utils/commands"
import { state } from "../utils/state"

export default defineWebSocketHandler({
	open(_) {
		console.debug('open')
	},
	close(peer, _) {
		console.debug('close')
		state.disconnectPeer(peer.id);
	},
	error(peer) {
		console.debug('error')
		state.disconnectPeer(peer.id);
	},
	async message(peer, message) {
		const clientMessage: ClientMessage = JSON.parse(message.toString())
		console.log(clientMessage);

		const response = await handle(clientMessage.message, peer).then(message => message)

		if (response) {
			peer.send(JSON.stringify({
				id: clientMessage.id,
				message: response
			}))
		}
	}
})