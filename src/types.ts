export type TState =
	| 'UNSUBSCRIBED'
	| 'HANDSHAKING'
	| 'RECEIVING'
	| 'RECONNECTING'
	| 'STOPPED'

export type TEvent =
	| 'SUBSCRIPTION_CHANGE'
	| 'HANDSHAKE_SUCCESS'
	| 'HANDSHAKE_FAILURE'
	| 'AUTHORIZATION_CHANGE'
	| 'UNSUBSCRBE_ALL'
	| 'RECONNECT_SUCCESS'
	| 'REQUEST_FAILURE'
	| 'DISCONNECT'
	| 'RESTORE'
	| 'GIVEUP'
	| 'RECEIVE_FAILURE'
	| 'RECEIVE_SUCCESS'

export type TSubscriptionStateContext = {
	channels: Array<string>
	channelGroups?: Array<string>
	subscriptionCursor: TSubscriptionCursor
	retryCount: number
}

export type TEventData = {
	channels?: Array<string>
	channelGroups?: Array<string>
	timetoken?: string
	region?: number
	messages?: Array<any>
}

export type TSubscriptionCursor = {
	timetoken: string
	region: number
}

export type TEffect =
	| 'HANDSHAKE_REQUEST'
	| 'RECEIVE_MESSAGE_REQUEST'
	| 'UNSUBSCRIBE_ALL'
	| 'RECONNECTING'

export type TStates<T extends string> = {
	[k in T]: any
}

export type TStateMachineDefinition = {
	initialState: TState
	states: TStates<TState>
}

export type ActionMap<T extends string> = {
	[k in T]: Function
}

export type Tcallback = (e: TEvent, d: TEventData | Error) => void
