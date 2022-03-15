import { httpRequest } from './networking'
import type {
	TSubscriptionStateContext,
	Tcallback,
	ActionMap,
	TEffect,
} from './types'
import { delay } from './utils'

async function handShake(
	context: TSubscriptionStateContext,
	callback: Tcallback
): Promise<any> {
	try {
		let url = `/v2/subscribe/demo/${context.channels.join(
			','
		)}/0?tt=0&&uuid=tstest`
		if (context.channelGroups?.length !== 0) {
			url += `&${context.channelGroups?.join(',')}`
		}
		const requestResult = await httpRequest(url)

		const response = JSON.parse(requestResult)

		callback('HANDSHAKE_SUCCESS', {
			timetoken: response.t.t,
			region: response.t.r,
		})
		return
	} catch (e) {
		if (e instanceof Error) {
			callback('HANDSHAKE_FAILURE', e)
		}
	}
}

async function receiveEvents(
	context: TSubscriptionStateContext,
	callback: Tcallback
): Promise<void> {
	let response

	try {
		let url = `/v2/subscribe/demo/${context.channels.join(',')}/0?tt=${
			context.subscriptionCursor.timetoken
		}&tr=${context.subscriptionCursor.region}&uuid=tstest`
		if (context.channelGroups?.length !== 0) {
			url += `&${context.channelGroups?.join(',')}`
		}
		const httpRequestResult = await httpRequest(url)

		response = JSON.parse(httpRequestResult)
	} catch (e) {
		if (e instanceof Error) {
			callback('RECEIVE_FAILURE', e)
		}
		return
	}

	callback('RECEIVE_SUCCESS', {
		timetoken: response.t.t,
		region: response.t.r,
		messages: response.m,
	})
	return
}

function unsubscribeAll(_: TSubscriptionStateContext, a: Tcallback) {
	console.log('stopped!!')
	return
}

async function retryRequest(
	context: TSubscriptionStateContext,
	callback: Tcallback
) {
	let response
	let attempted = 0
	let delayMilliseconds = 200

	try {
		let url = `/v2/subscribe/demo/${context.channels.join(',')}/0?tt=${
			context.subscriptionCursor.timetoken
		}&tr=${context.subscriptionCursor.region}&uuid=tstest`
		if (context.channelGroups?.length !== 0) {
			url += `&${context.channelGroups?.join(',')}`
		}
		const httpRequestResult = await httpRequest(url)

		response = JSON.parse(httpRequestResult)

		callback('RECONNECT_SUCCESS', {
			timetoken: response.t.t,
			region: response.t.r,
			messages: response.m,
		})
	} catch (e) {
		// if (e instanceof Error) {
		//		custom logic whether to attempt retry
		// }
		if (attempted >= context.retryCount) {
			callback('GIVEUP', e as Error)
			return
		} else {
			await delay(delayMilliseconds * ++attempted)
			retryRequest(context, callback)
		}
	}
}

export const effectMap: ActionMap<TEffect> = {
	HANDSHAKE_REQUEST: handShake,
	RECEIVE_MESSAGE_REQUEST: receiveEvents,
	UNSUBSCRIBE_ALL: unsubscribeAll,
	RECONNECTING: retryRequest,
}
