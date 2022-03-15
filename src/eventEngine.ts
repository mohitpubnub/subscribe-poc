import type {
	ActionMap,
	TEffect,
	TEventData,
	TEvent,
	TStateMachineDefinition,
	TState,
	TSubscriptionStateContext,
	Tcallback,
} from './types'

export class EffectEngine {
	effectMap: ActionMap<TEffect>

	constructor(effectMap: ActionMap<TEffect>) {
		this.effectMap = effectMap
	}

	performEffectAction(
		effect: TEffect,
		effectData: TSubscriptionStateContext,
		callback: Tcallback
	) {
		this.effectMap[effect](effectData, callback)
		return
	}
}

export class EventEngine {
	private machine: TStateMachineDefinition

	private eventActionDefinitions: ActionMap<TEvent>
	private currentState: TState
	private context: TSubscriptionStateContext

	private effectEngine: EffectEngine

	constructor(
		stateMachineDefinition: TStateMachineDefinition,
		eventActionDefinitions: ActionMap<TEvent>,
		effectEngine: EffectEngine
	) {
		this.machine = stateMachineDefinition
		this.eventActionDefinitions = eventActionDefinitions
		this.effectEngine = effectEngine

		this.context = {
			channels: [],
			channelGroups: [],
			subscriptionCursor: {
				timetoken: '0',
				region: 0,
			},
			retryCount: 5, // policy/count to be fetched from config
		}
		this.currentState = this.machine.initialState
	}

	start(event: TEvent, eventData: TEventData) {
		this.handleEvent(event, eventData)
	}

	handleEvent(event: TEvent, eventData: TEventData | Error) {
		let eventProcessed = false

		if (eventData instanceof Error) {
			// error handling ???
		}
		if (this.machine.states[this.currentState].transitions[event]) {
			eventProcessed = this.eventActionDefinitions[event](
				this.context,
				eventData
			)
		}
		if (eventProcessed) {
			const effects = this.transite(event)
			this.applyEffects(effects)
		}
	}

	transite(event: TEvent): TEffect[] {
		this.currentState =
			this.machine.states[this.currentState].transitions[event].target
		return this.machine.states[this.currentState].effects
	}

	applyEffects(stateEffects: Array<TEffect>) {
		stateEffects.forEach(async (effect) => {
			await this.effectEngine.performEffectAction(
				effect,
				this.context,
				this.handleEvent.bind(this)
			)
		})
	}
}
