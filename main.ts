import { effectMap } from './effectActions'
import { eventMap } from './eventActions'
import { EffectEngine, EventEngine } from './eventEngine'
import type { TStateMachineDefinition } from './types'

const stateMachineDefinition: TStateMachineDefinition = {
	initialState: 'UNSUBSCRIBED',
	states: {
		UNSUBSCRIBED: {
			transitions: {
				SUBSCRIPTION_CHANGE: { target: 'HANDSHAKING' },
				RESTORE: { target: 'RECONNECTING' },
			},
		},

		HANDSHAKING: {
			effects: ['HANDSHAKE_REQUEST'],
			transitions: {
				HANDSHAKE_FAILURE: { target: 'RECONNECTING' },
				HANDSHAKE_SUCCESS: { target: 'RECEIVING' },
				SUBSCRIPTION_CHANGE: { target: 'HANDSHAKING' },
			},
		},

		RECEIVING: {
			effects: ['RECEIVE_MESSAGE_REQUEST'],
			transitions: {
				RECEIVE_FAILURE: { target: 'RECONNECTING' },
				RECEIVE_SUCCESS: { target: 'RECEIVING' },
				SUBSCRIPTION_CHANGE: { target: 'RECEIVING' },
			},
		},
		RECONNECTING: {
			transitions: {
				SUBSCRIPTION_CHANGE: { target: 'HANDSHAKING' },
				RECONNECT_SUCCESS: { target: 'RECEIVING' },
				GIVEUP: { target: 'STOPPED' },
			},
		},
		STOPPED: {
			transitions: {
				SUBSCRIPTION_CHANGE: { target: 'HANDSHAKING' },
				RESTORE: { target: 'RECONNECTING' },
			},
		},
	},
}

async function main() {
	const effectEngine = new EffectEngine(effectMap)

	const engine = new EventEngine(stateMachineDefinition, eventMap, effectEngine)

	engine.start('SUBSCRIPTION_CHANGE', { channels: ['ch1'] })
}
main()
