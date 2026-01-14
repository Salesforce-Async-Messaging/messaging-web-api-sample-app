import { APP_CONSTANTS, STORAGE_KEYS, MESSAGING_API_CONSTANTS, CONVERSATION_CONSTANTS, SUPPORTED_ENTRY_TYPES } from "../helpers/constants";
import { getOrganizationId, getDeploymentDeveloperName, getSalesforceMessagingUrl } from "./dataProvider";
import { getItemInWebStorageByKey, clearWebStorage } from "../helpers/webstorageUtils";
import { util } from "../helpers/common";
import {
	isEmpty
} from 'lodash'

/**
 * Send an HTTP request using fetch with a specified path, method, mode, headers, and body.
 *
 * @param {String} apiPath - Endpoint to make request to.
 * @param {String} method - HTTP request method (POST, GET, DELETE).
 * @param {String} mode - HTTP mode (cors, no-cors, same-origin, navigate).
 * @param {Object} requestHeaders - Headers to include with request.
 * @param {Object} requestBody - Body to include with request. This method stringifies the object passed in, except when
 *                               uploading a file. For file attachments, request body must be binary data.
 * @returns {Promise}
 */
function sendFetchRequest(apiPath, method, mode, requestHeaders, requestBody, jwt) {
	let messagingJwt = getItemInWebStorageByKey(STORAGE_KEYS.JWT);
	if(isEmpty(messagingJwt)) {
		messagingJwt = jwt
	}
	// console.log("messagingJwt", messagingJwt, jwt)
	const headers = requestHeaders ?
		requestHeaders :
		{
			"Content-Type": "application/json",
			...(messagingJwt && { "Authorization": "Bearer " + messagingJwt })
		};
	const body = requestBody ? JSON.stringify(requestBody) : undefined;

	return fetch(
		apiPath,
		{
			method,
			mode,
			headers,
			...(body && { body })
		}
	).then(async (response) => {
		if (response.status === 401) {
			// Unauthorized request. Clear the web storage.
			// clearWebStorage();
		}
		if (!response.ok) {
			let responseObject;
			try {
				responseObject = Object.assign(response, await response.json());
			} catch (e) {
				responseObject = Object.assign(response, {"message": `Error reading the body stream of error object: ${response}`});
			}
			throw responseObject;
		}
		return response;
	});
};

/**
 * Get a JWT for an anonymous user. This JWT is used for unauthenticated conversations.
 *
 * Refer https://developer.salesforce.com/docs/service/messaging-api/references/miaw-api-reference?meta=generateAccessTokenForUnauthenticatedUser
 *
 * @returns {Promise}
 */
function getUnauthenticatedAccessToken() {
	const orgId = getOrganizationId();
	const esDeveloperName = getDeploymentDeveloperName();
	const messagingUrl = getSalesforceMessagingUrl();
	const capabilitiesVersion = APP_CONSTANTS.APP_CAPABILITIES_VERSION;
	const platform = APP_CONSTANTS.APP_PLATFORM;
	const apiPath = `${messagingUrl}/iamessage/api/v2/authorization/unauthenticated/access-token`;

	return sendFetchRequest(
		apiPath,
		"POST",
		"cors",
		{
			"Content-Type": "application/json"
		},
		{
			orgId,
			esDeveloperName,
			capabilitiesVersion,
			platform
		}
	).then(response => {
		if (!response.ok) {
			throw response;
		}
		return response.json();
	});
}

/**
 * Create a new conversation.
 *
 * Refer https://developer.salesforce.com/docs/service/messaging-api/references/miaw-api-reference?meta=createConversation
 *
 * @param {Object} routingAttributes - Optional. Prechat data to be used while routing the conversation request.
 * @returns {Promise}
 */
function createConversation(conversationId, routingAttributes) {
	const esDeveloperName = getDeploymentDeveloperName();
	const messagingUrl = getSalesforceMessagingUrl();
	const apiPath = `${messagingUrl}/iamessage/api/v2/conversation`;

	return sendFetchRequest(
		apiPath,
		"POST",
		"cors",
		null,
		{
			...(routingAttributes && { routingAttributes }),
			esDeveloperName,
			conversationId
		},
		"createNewConversation"
	).then(response => {
		if (!response.ok) {
			throw response;
		}
	});
}

/**
 * Get a JWT with the same subjectId but new clientId as the existing Messaging JWT that was issued previously. This function is used for session continuity in the same tab (page reload) and/or across tabs.
 *
 * Refer https://developer.salesforce.com/docs/service/messaging-api/references/miaw-api-reference?meta=generateContinuationToken
 *
 * @returns {Promise}
 */
function getContinuityJwt(jwt="", url="") {
	let messagingUrl = getSalesforceMessagingUrl();
	if(!isEmpty(url)){
		messagingUrl = url
	}
	// console.log("getContinuityJwt_______", messagingUrl, url)
	const apiPath = `${messagingUrl}/iamessage/api/v2/authorization/continuation-access-token`;

	return sendFetchRequest(
		apiPath,
		"GET",
		"cors",
		null,
		null,
		jwt
	).then(response => {
		if (!response.ok) {
			throw response;
		}
		return response.json();
	});
}

/**
 * Get a list of all conversations the current subjectId is participating in.
 * Returns:
 * - number of open conversations
 * - number of closed conversations
 * - array of conversations
 *
 * Refer https://developer.salesforce.com/docs/service/messaging-api/references/miaw-api-reference?meta=listConversations
 *
 * @param {Boolean} includeClosedConversations - Whether to include closed conversations in list. Optional.
 * @returns {Promise}
 */
function listConversations(includeClosedConversations = false, jwt="", url=""){
	let messagingUrl = getSalesforceMessagingUrl();
	if(!isEmpty(url)){
		messagingUrl = url
	}
	const apiPath = `${messagingUrl}/iamessage/api/v2/conversation/list?inclClosedConvs=${includeClosedConversations}&limit=${MESSAGING_API_CONSTANTS.LIST_CONVERSATION_API_NUM_CONVERSATIONS_LIMIT}`;

	return sendFetchRequest(
		apiPath,
		"GET",
		"cors",
		null,
		null,
		jwt
	).then(response => {
		if (!response.ok) {
			throw response;
		}
		return response.json();
	});
};

/**
 * Get a list of conversation entries for a given conversationId.
 * Returns:
 * - array of conversation entries
 *
 * Refer https://developer.salesforce.com/docs/service/messaging-api/references/miaw-api-reference?meta=listConversationEntries
 *
 * @param {String} conversationId - The ID of the conversation to get entries for.
 * @param {Number} startTimestamp - The start time for the window of time being requested. Optional.
 * @param {Number} endTimestamp - The end time for the window of time being requested. Optional.
 * @param {String} direction - Query direction either "FromStart" or "FromEnd" of the conversation. Optional.
 * @returns {Promise}
 */
function listConversationEntries(conversationId, startTimestamp, endTimestamp, direction) {
	const messagingUrl = getSalesforceMessagingUrl();
	const limitUrlQueryParam = `${MESSAGING_API_CONSTANTS.LIST_CONVERSATION_ENTRIES_API_ENTRIES_LIMIT ? `limit=${MESSAGING_API_CONSTANTS.LIST_CONVERSATION_ENTRIES_API_ENTRIES_LIMIT}` : ``}`;
	const startTimestampUrlQueryParam = `${startTimestamp ? `&startTimestamp=${startTimestamp}` : ``}`;
	const endTimestampUrlQueryParam = `${endTimestamp ? `&endTimestamp=${endTimestamp}` : ``}`;
	const directionUrlQueryParam = `${direction ? `&direction=${direction}` : ``}`;
	const entryTypeFilterUrlQueryParam = `${SUPPORTED_ENTRY_TYPES ? `&entryTypeFilter=${SUPPORTED_ENTRY_TYPES}` : ``}`;
	const apiPath = `${messagingUrl}/iamessage/api/v2/conversation/${conversationId}/entries?${limitUrlQueryParam}${startTimestampUrlQueryParam}${endTimestampUrlQueryParam}${directionUrlQueryParam}${entryTypeFilterUrlQueryParam}`;

	return sendFetchRequest(
		apiPath,
		"GET",
		"cors",
		null,
		null
	).then(response => {
		if (!response.ok) {
			throw response;
		}
		return response.json();
	})
	.then(responseJson => {
		// Transform the response to look like a conversation entry received via a server-sent event.
		const transformedData = [];

		if (typeof responseJson !== "object") {
			throw new Error(`Expected to receive JSON response, instead received ${responseJson}.`);
		}
		if (!Array.isArray(responseJson.conversationEntries)) {
			throw new Error(`Expected entries to be an Array, instead was: ${responseJson.conversationEntries}.`);
		}
		responseJson.conversationEntries.forEach(conversationEntry => {
			conversationEntry.entryPayload = JSON.stringify(conversationEntry.entryPayload);
			transformedData.push({
				conversationId,
				conversationEntry
			});
		});

		return transformedData;
	});
}

/*
 * Publish a text message to a conversation.
 * 
 * Refer https://developer.salesforce.com/docs/service/messaging-api/references/miaw-api-reference?meta=sendMessage
 * 
 * @param {String} conversationId - ID of conversation to send a text message to.
 * @param {String} text - String content to send to conversation.
 * @param {String} messageId - ID of the conversation entry.
 * @param {String} inReplyToMessageId - ID of message this message is a response for.
 * @param {boolean} isNewMessagingSession - Optional. Whether this message should create a new session. Used by session pre-chat forms.
 * @param {Object} routingAttributes - Optional. Pre-chat data to be used while routing the new session request. Used by session pre-chat forms.
 * @param {String} language - Optional. TODO.
 * @returns {Promise}
 */
function sendTextMessage(conversationId, text, messageId, inReplyToMessageId, isNewMessagingSession, routingAttributes, language) {
	const messagingUrl = getSalesforceMessagingUrl();
	const esDeveloperName = getDeploymentDeveloperName();
	const apiPath = `${messagingUrl}/iamessage/api/v2/conversation/${conversationId}/message`;

	return sendFetchRequest(
		apiPath,
		"POST",
		"cors",
		null,
        {
			message: {
				...(inReplyToMessageId && { inReplyToMessageId }),
				id: messageId,
				messageType: CONVERSATION_CONSTANTS.MessageTypes.STATIC_CONTENT_MESSAGE,
				staticContent: {
					formatType: CONVERSATION_CONSTANTS.FormatTypes.TEXT,
					text
				},
			},
			...(routingAttributes && { routingAttributes }),
			...(isNewMessagingSession && { isNewMessagingSession }),
			esDeveloperName,
			...(language && { language })
        }
	).then(response => {
		if (!response.ok) {
			throw response;
		}
		response.json();
	});
}




function sendFileMessage(conversationId, text, messageId, inReplyToMessageId, isNewMessagingSession, routingAttributes, language) {
	const messagingUrl = getSalesforceMessagingUrl();
	const esDeveloperName = getDeploymentDeveloperName();
	const apiPath = `${messagingUrl}/iamessage/api/v2/conversation/${conversationId}/file`;

	return sendFetchRequest(
		apiPath,
		"POST",
		"cors",
		null,
        {
			message: {
				...(inReplyToMessageId && { inReplyToMessageId }),
				id: messageId,
				messageType: CONVERSATION_CONSTANTS.MessageTypes.STATIC_CONTENT_MESSAGE,
				staticContent: {
					formatType: CONVERSATION_CONSTANTS.FormatTypes.TEXT,
					text
				},
			},
			...(routingAttributes && { routingAttributes }),
			...(isNewMessagingSession && { isNewMessagingSession }),
			esDeveloperName,
			...(language && { language })
        }
	).then(response => {
		if (!response.ok) {
			throw response;
		}
		response.json();
	});
}

/**
 * Publish a started/stopped typing indicator entry to a conversation.
 *
 * @param {string} conversationId - ID of conversation to send a typing indicator to.
 * @param {string} typingIndicator - Indicate whether to typing started or stopped indicator.
 * @returns {Promise}
 */
function sendTypingIndicator(conversationId, typingIndicator) {
	const messagingUrl = getSalesforceMessagingUrl();
	const apiPath = `${messagingUrl}/iamessage/api/v2/conversation/${conversationId}/entry`;

    return sendFetchRequest(
        apiPath,
        "POST",
        "cors",
        null,
        {
            entryType: typingIndicator,
            id: util.generateUUID()
        }
    );
};

/**
 * Close conversation and clean up JWT:
 * - clear JWT variable on inAppService.
 * - remove JWT from web storage (if web storage is available).
 *
 * This endpoint is typically used for anonymous users.
 *
 * Refer https://developer.salesforce.com/docs/service/messaging-api/references/miaw-api-reference?meta=closeConversation
 *
 * @param {String} conversationId - ID of the conversation to close. Required.
 * @returns {Promise}
 */
function closeConversation(conversationId) {
    const messagingUrl = getSalesforceMessagingUrl();
	const esDeveloperName = getDeploymentDeveloperName();
	const apiPath = `${messagingUrl}/iamessage/api/v2/conversation/${conversationId}?esDeveloperName=${esDeveloperName}`;

    return sendFetchRequest(
        apiPath,
        "DELETE",
        "cors",
        null,
        null
    );
};

export { getUnauthenticatedAccessToken, createConversation, getContinuityJwt, listConversations, listConversationEntries, sendTextMessage, sendTypingIndicator, closeConversation };