/**
 * Send an HTTP request using fetch with a specified path, and method.
 * @returns {Promise}
 */
function sendXhrRequest(apiPath, method, caller) {
	const startTime = performance.now();

	return new Promise((resolve, reject) => {
		const xhr = new XMLHttpRequest();

		xhr.open(method, apiPath, true);

		xhr.onreadystatechange = (response) => {
			const state = response.target;

			// DONE === The operation is complete, per https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/readyState.
			// Business hours return 204 if no business hours is associated with the deployment.
			if(state && (state.readyState === state.DONE || state.status === 204)) {
				const timeElapsed = ((performance.now() - startTime) / 1000).toFixed(3); // Read the timeElapsed in seconds and round the value to 3 decimal places.

				if(state.status === 200 || state.status === 204) {
					const responseJson = state.responseText ? JSON.parse(state.responseText) : state.responseText;

					resolve(responseJson);
				} else {
					reject(state.status);
				}
				console.log(`${caller ? caller : apiPath} took ${timeElapsed} seconds and returned with the status code ${state.status}`);
			}
		};
		xhr.send();
	});
}

/**
 * Load the config settings from SCRT 2.0 stack.
 */
function getConfigurationData() {
	const configURL = "https://sachinsdb6.test1.my.pc-rnd.salesforce-scrt.com/embeddedservice/v1/embedded-service-config?orgId=00DSG000001NruH&esConfigName=Web1&language=en";

	return sendXhrRequest(configURL, "GET", "getConfigurationData");
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