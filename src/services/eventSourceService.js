import { getOrganizationId, getSalesforceMessagingUrl, getJwt, getLastEventId } from './dataProvider';

/**
 * Instance of an EventSourcePolyfill object to add or remove event listeners on.
 */
let eventSource;

/**
 * Configuration for reconnection behavior
 */
const RECONNECT_CONFIG = {
    maxAttempts: 10,
    initialDelay: 1000, // 1 second
    maxDelay: 30000, // 30 seconds
    backoffMultiplier: 1.5
};

/**
 * Get the request headers for connecting to SSE.
 */
const getEventSourceParams = () => {
    return {
        headers: {
            "Authorization": "Bearer " + getJwt(),
            "X-Org-ID": getOrganizationId(),
            "Last-Event-ID": getLastEventId()
        },
        heartbeatTimeout: 90000
    };
};

/**
 * Add event listeners on an EventSourcePolyfill object.
 *
 * @param {String} listenerOperationName - Name of the operator to act on an instance of EventSourcePolyfill, either "addEventListener" or "removeEventListener".
 * @param {Object} eventListenerMap - Map of event names and corresponding handlers for server-sent events. Shape of object is { eventName: eventHandler }.
 */
const handleEventSourceListeners = (listenerOperationName, eventListenerMap) => {
    if (typeof eventSource !== "object") {
        throw new Error(`Expected EventSource object to be a valid object, but received: ${eventSource}`);
    }
    if (typeof listenerOperationName !== "string" || !listenerOperationName.length) {
        throw new Error(`Expected a valid string to either add or remove event listeners, but received: ${listenerOperationName}`);
    }

    Object.entries(eventListenerMap).forEach(entry => {
        const [eventName, eventHandler] = entry;

        if (typeof eventName !== "string") {
            throw new Error(`Expected event listener name parameter to be a valid string, but received: ${eventName}.`);
        }
        if (eventName.trim().length < 1) {
            throw new Error(`Expected event listener name parameter to be a string with length greater than 0, but received: ${eventName}.`);
        }
        if (typeof eventHandler !== "function") {
            throw new Error(`Expected event listener handler parameter to be a function, but received: ${eventHandler}.`);
        }

        // Perform event listener operation (add or remove) on eventSource.
        eventSource[listenerOperationName](eventName, eventHandler);
    });
};

/**
 * Calculate the delay for the next reconnection attempt using exponential backoff.
 *
 * @param {Number} attemptNumber - The current attempt number (0-indexed)
 * @returns {Number} Delay in milliseconds
 */
const calculateReconnectDelay = (attemptNumber) => {
    const delay = RECONNECT_CONFIG.initialDelay * Math.pow(RECONNECT_CONFIG.backoffMultiplier, attemptNumber);
    return Math.min(delay, RECONNECT_CONFIG.maxDelay);
};

/**
 * Establish the EventSource object with handlers for onopen and onerror.
 *
 * @param {String} fullApiPath - The full API path endpoint to request server-sent events.
 * @param {Object} eventListenerMap - Map of event handlers for server-sent events. Shape of object is { eventName: eventHandler }.
 * @returns {Promise}
 */
export const createEventSource = (fullApiPath, eventListenerMap) => {
    if (!window.EventSourcePolyfill || typeof window.EventSourcePolyfill !== "function") {
        throw new Error(`EventSourcePolyfill is not a constructor.`);
    }
    if (typeof fullApiPath !== "string" || !fullApiPath.length) {
        throw new Error(`Expected full API path parameter to be a valid string, but received: ${fullApiPath}.`);
    }
    if (typeof eventListenerMap !== "object") {
        throw new Error(`Expected event listener map parameter to be a valid object map, but received: ${eventListenerMap}.`);
    }

    /**
     * Create a closure here to isolate `reconnectAttempts` and reconnect logic to a single invocation of `createEventSource`.
     * All calls to `resolveEventSource` within a call to `createEventSource` share the same `reconnectAttempts` value.
     *
     * @param {Promise.resolve} resolve - Event source opened.
     * @param {Promise.reject} reject - Attempted to reconnect to event source too many times.
     */
    const resolveEventSource = (resolve, reject) => {
        let reconnectAttempts = 0;
        let reconnectTimeoutId = null;

        /**
         * Attempts to create a new EventSource connection.
         * This function is called initially and on each reconnection attempt.
         */
        const attemptConnection = () => {
            try {
                // Close existing eventSource if it exists
                if (eventSource) {
                    try {
                        eventSource.close();
                    } catch (closeError) {
                        // Ignore errors when closing, as the connection may already be closed
                        console.warn("Error closing existing EventSource:", closeError);
                    }
                }

                // Create new EventSource with timestamp to avoid caching
                const apiPathWithTimestamp = `${fullApiPath}${fullApiPath.includes('?') ? '&' : '?'}_ts=${Date.now()}`;
                eventSource = new window.EventSourcePolyfill(apiPathWithTimestamp, getEventSourceParams());

                eventSource.onopen = () => {
                    // Reset reconnect attempts on successful connection
                    reconnectAttempts = 0;
                    if (reconnectTimeoutId) {
                        clearTimeout(reconnectTimeoutId);
                        reconnectTimeoutId = null;
                    }
                    handleEventSourceListeners("addEventListener", eventListenerMap);
                    resolve();
                };

                eventSource.onerror = (error) => {
                    // Check if EventSource is in CLOSED state (readyState === 2)
                    // This indicates a fatal error that requires reconnection
                    if (eventSource && eventSource.readyState === eventSource.CLOSED) {
                        reconnectAttempts++;
                        
                        if (reconnectAttempts <= RECONNECT_CONFIG.maxAttempts) {
                            const delay = calculateReconnectDelay(reconnectAttempts - 1);
                            console.log(`EventSource connection error. Attempting to reconnect (${reconnectAttempts}/${RECONNECT_CONFIG.maxAttempts}) in ${delay}ms...`);
                            
                            reconnectTimeoutId = setTimeout(() => {
                                attemptConnection();
                            }, delay);
                        } else {
                            console.error(`EventSource connection failed after ${RECONNECT_CONFIG.maxAttempts} reconnection attempts.`);
                            if (reconnectTimeoutId) {
                                clearTimeout(reconnectTimeoutId);
                                reconnectTimeoutId = null;
                            }
                            reject(new Error(`Failed to establish EventSource connection after ${RECONNECT_CONFIG.maxAttempts} attempts`));
                        }
                    } else if (eventSource && eventSource.readyState === eventSource.CONNECTING) {
                        // EventSource is still connecting, wait for it to either open or close
                        // This is a transient state, so we don't need to take action yet
                        console.log("EventSource is connecting...");
                    }
                };
            } catch (error) {
                reconnectAttempts++;
                
                if (reconnectAttempts <= RECONNECT_CONFIG.maxAttempts) {
                    const delay = calculateReconnectDelay(reconnectAttempts - 1);
                    console.log(`Error creating EventSource. Attempting to reconnect (${reconnectAttempts}/${RECONNECT_CONFIG.maxAttempts}) in ${delay}ms...`);
                    
                    reconnectTimeoutId = setTimeout(() => {
                        attemptConnection();
                    }, delay);
                } else {
                    console.error(`Failed to create EventSource after ${RECONNECT_CONFIG.maxAttempts} attempts.`);
                    if (reconnectTimeoutId) {
                        clearTimeout(reconnectTimeoutId);
                        reconnectTimeoutId = null;
                    }
                    reject(error);
                }
            }
        };

        // Start the initial connection attempt
        attemptConnection();
    };

    return new Promise(resolveEventSource);
};

/**
 * Subscribe to EventSource by providing authorization and org details.
 *
 * @param {Object} eventListenerMap - Map of event handlers for server-sent events. Shape of object is { eventName: eventHandler }.
 * @returns {Promise}
 */
export const subscribeToEventSource = (eventListenerMap) => {
    const messagingUrl = getSalesforceMessagingUrl();

    if (!messagingUrl) {
        return Promise.reject(new Error(`Expected a valid Messaging URL to establish a connection to the Event Source, but instead received ${messagingUrl}`));
    }

    return new Promise((resolve, reject) => {
        try {
            /**
             * Directly connect to event router endpoint on Salesforce Messaging domain instead of going through ia-message.
             */
            createEventSource(
                getSalesforceMessagingUrl().concat(`/eventrouter/v1/sse?_ts=${Date.now()}`),
                eventListenerMap
            ).then(
                resolve,
                error => {
                    /**
                     * If this reject function is called, there are likely three possibilities:
                     * 1. a syntactic error in creating the EventSource
                     * 2. too many reconnect attempts
                     * 3. JWT has expired
                     */
                    reject(error);
                }
            ).catch(error => {
                reject(error);
            });
        } catch (error) {
            reject(error);
        }
    });
};

/**
 * Close the event source to end event stream.
 * @returns {Promise}
 */
export const closeEventSource = () => {
    return new Promise((resolve, reject) => {
        try {
            if (eventSource) {
                eventSource.close();
            }
            resolve();
        } catch (error) {
            reject(error);
        }
    });
};