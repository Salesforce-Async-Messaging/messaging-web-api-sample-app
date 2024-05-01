import { APP_CAPABILITIES_VERSION, APP_PLATFORM, STORAGE_KEYS } from "../helpers/constants";
import { getOrganizationId, getDeploymentDeveloperName, getScrt2Url } from "./dataProvider";
import { getItemInWebStorageByKey } from "../helpers/webstorageUtils";

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
function sendFetchRequest(apiPath, method, mode, requestHeaders, requestBody) {
	const messagingJwt = getItemInWebStorageByKey(STORAGE_KEYS.JWT);
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
			//clearWebStorage();
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
 * TODO: insert api doc link
 *
 * @returns {Promise}
 */
function getUnauthenticatedAccessToken() {
	const orgId = getOrganizationId();
	const esDeveloperName = getDeploymentDeveloperName();
	const scrt2Url = getScrt2Url();
	const capabilitiesVersion = APP_CAPABILITIES_VERSION;
	const platform = APP_PLATFORM;
	const apiPath = `${scrt2Url}/iamessage/api/v2/authorization/unauthenticated/access-token`;

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
 * TODO: insert api doc link
 *
 * @param {Object} routingAttributes - Optional. Prechat data to be used while routing the conversation request.
 * @returns {Promise}
 */
function createConversation(conversationId, routingAttributes) {
	const esDeveloperName = getDeploymentDeveloperName();
	const scrt2Url = getScrt2Url();
	const apiPath = `${scrt2Url}/iamessage/api/v2/conversation`;

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
		//response.json(); // v2 endpoint not returning any data unlike v1
	});
}

export { getUnauthenticatedAccessToken, createConversation };