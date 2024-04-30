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
	const headers = requestHeaders ?
		requestHeaders :
		{
			"Content-Type": "application/json"
			//...(messagingJwt && { "Authorization": "Bearer " + messagingJwt })
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
 * Load the config settings from SCRT 2.0 stack.
 */
function getConfigurationData() {
	const apiPath = "https://sachinsdb6.test1.my.pc-rnd.salesforce-scrt.com/embeddedservice/v1/embedded-service-config?orgId=00DSG000001NruH&esConfigName=Web1&language=en";

	return sendFetchRequest(
		apiPath,
		"GET",
		"cors",
		{},
		null
	).then(response => {
		if (!response.ok) {
			throw response;
		}
		return response.json();
	});
}

export default getConfigurationData;
    
    // // Load config settings from SCRT 2.0.
	// const configPromise = getConfigurationData().then(
	// 	response => {
	// 	    console.log(`Successfully retrieved configuration settings: ${response}`);	
	// 	},
	// 	responseStatus => {
	// 		console.log(`Failed to retrieve configuration settings. Retrying the request`);
	// 		// Retry one more time to load config settings from SCRT 2.0 if the first attempt fails.
	// 		return new Promise((resolve, reject) => {
	// 			getConfigurationData().then(resolve, reject);
	// 		});
	// 	}
	// ).catch(() => {
	// 	throw new Error("Unable to load Embedded Messaging configuration.");
	// });