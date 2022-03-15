import type {
	TSubscriptionStateContext,
	TEvent,
	ActionMap,
	TEventData,
} from './types'

function subscriptionChangeAction(
	context: TSubscriptionStateContext,
	eventData: TEventData
) {
	context.channels = eventData?.channels ? eventData?.channels : []
	context.channelGroups = eventData?.channelGroups
		? eventData?.channelGroups
		: []
	return true
}

function receiveEventsSuccessAction(
	context: TSubscriptionStateContext,
	eventData: TEventData
) {
	context.subscriptionCursor!.timetoken = eventData.timetoken!
	context!.subscriptionCursor!.region = eventData.region!

	console.log('messages received => ', eventData.messages) // Receive Events handling EFFECT ?!
	return true
}

function updateSubscriptionCursor(
	context: TSubscriptionStateContext,
	eventData: TEventData
) {
	if (context.subscriptionCursor) {
		context.subscriptionCursor!.timetoken = eventData.timetoken!
		context.subscriptionCursor!.region = eventData.region!
	} else {
		context.subscriptionCursor = {
			timetoken: eventData.timetoken!,
			region: eventData.region!,
		}
	}
	return true
}

function errorHandlingAction(_: TSubscriptionStateContext, error: Error) {
	console.log(`failure with error: ${error.message}`)
	return true
}

function voidAction(_: TSubscriptionStateContext, eventData: any) {
	console.log(`voidAction/ no error data: ${eventData}`)
	return true
}

export const eventMap: ActionMap<TEvent> = {
	SUBSCRIPTION_CHANGE: subscriptionChangeAction,
	HANDSHAKE_SUCCESS: updateSubscriptionCursor,
	RECEIVE_SUCCESS: receiveEventsSuccessAction,
	HANDSHAKE_FAILURE: voidAction,
	RECEIVE_FAILURE: voidAction,
	AUTHORIZATION_CHANGE: voidAction,
	UNSUBSCRBE_ALL: voidAction,
	RECONNECT_SUCCESS: voidAction,
	REQUEST_FAILURE: errorHandlingAction,
	DISCONNECT: errorHandlingAction,
	RESTORE: voidAction,
	GIVEUP: voidAction,
}
