import { useEffect, useRef, useState } from "react";
import * as EventSourcePolyfill from "../helpers/eventsource-polyfill.js";

// Import children components to plug in and render.
import MessagingHeader from "./messagingHeader";
import MessagingBody from "./messagingBody";
import MessagingInputFooter from "./messagingInputFooter";

import { setJwt, setLastEventId, storeConversationId, getConversationId, getJwt, clearInMemoryData, setDeploymentConfiguration } from "../services/dataProvider";
import { subscribeToEventSource, closeEventSource } from '../services/eventSourceService';
import { sendTypingIndicator, sendTextMessage, getContinuityJwt, listConversations, listConversationEntries, closeConversation, getUnauthenticatedAccessToken, createConversation } from "../services/messagingService";
import * as ConversationEntryUtil from "../helpers/conversationEntryUtil";
import { CONVERSATION_CONSTANTS, STORAGE_KEYS, CLIENT_CONSTANTS } from "../helpers/constants";
import { setItemInWebStorage, clearWebStorage, getItemInWebStorageByKey } from "../helpers/webstorageUtils";
import { util } from "../helpers/common";
import { prechatUtil } from "../helpers/prechatUtil.js";
import Prechat from "./prechat.js";
import CountdownTimer from "../helpers/countdownTimer.js";
import { getContentType, writeBlobBodyParameter } from "./HttpFormBuilder";

export default function Conversation(props) {
    const inputRef= useRef(null)
    // Initialize a list of conversation entries.
    let [conversationEntries, setConversationEntries] = useState([]);
    // Initialize the conversation status.
    let [conversationStatus, setConversationStatus] = useState(CONVERSATION_CONSTANTS.ConversationStatus.NOT_STARTED_CONVERSATION);
    // Tracks whether Pre-Chat form should be shown.
    let [showPrechatForm, setShowPrechatForm] = useState(false);
    // Tracks the most recent conversation message that was failed to send.
    let [failedMessage, setFailedMessage] = useState(undefined);

    // Initialize current participants that are actively typing (except end user).
    // Each key is the participant's `senderName` or `role` and each value is a reference to a CountdownTimer object.
    let [currentTypingParticipants, setCurrentTypingParticipants] = useState({});
    // Initialize whether at least 1 participant (not including end user) is typing.
    let [isAnotherParticipantTyping, setIsAnotherParticipantTyping] = useState(false);

    // eyJraWQiOiI1MmQ1OWRmNDE3M2MzZjA5ZGMxNWRjNzMzNWY5YWFkYjFhMDVjNzY4ZmZjMzBiMTllMDkxMGFiNmVlZTQyYjExIiwidHlwIjoiSldUIiwiYWxnIjoiUlMyNTYifQ.eyJzdWIiOiJ2Mi9pYW1lc3NhZ2UvVU5BVVRIL05BL3VpZDoyYzQzMTUxYi0yOTRmLTRlMDMtODRhMi1mMDI3ODc1MjJjMTEiLCJjbGllbnRJZCI6InYxL0lPU19Nb2JpbGUvNmM0MmQ5MDctZmYwNy00ODY0LWFmZDQtNTYzMTU2ZWM4MmMyIiwiZmFsY29uQ2VsbCI6InNjcnQwMSIsImNoYW5uZWxBZGRJZCI6ImU2ZGQyODI3LWRhZGEtNDlhMS1hYjQ0LTQ0NjUyYWYwY2NlMCIsImlzcyI6ImlhbWVzc2FnZSIsImZhbGNvbkZEIjoidWVuZ2FnZTEiLCJkZXZpY2VJZCI6Ink0ZEMzTWxYVFBhQllQdjltTFk1OTNkOWFRUXpDMUgwa0tWNnoxM1NiOFo5L3grVTJZOWpsZldhclkvRWxQMXpiVVZ1OTVST3hLb0JpNWJ5QjdpbDdRPT0iLCJjYXBhYmlsaXRpZXNWZXJzaW9uIjoiMjQ4Iiwib3JnSWQiOiIwMEROeTAwMDAwMDBIZ24iLCJkZXZpY2VJbmZvIjoie30iLCJwbGF0Zm9ybSI6IldlYiIsImZhbGNvbkZJSGFzaCI6InkzN2h6bSIsImp3dElkIjoiNTFNaEplUmVXallOb2Nlb3h1MTdTLSIsImNsaWVudFNlc3Npb25JZCI6ImQ1NTIzOWE2LTg5ZTItNGFlZC04YTVmLTU2MjljYzVlNDU5MCIsImF1ZCI6IlVTRVIiLCJldnRLZXkiOiJzY3J0LnByb2QuZXZlbnRyb3V0ZXJfX2F3cy5hd3MtcHJvZDItYXBzb3V0aDEudWVuZ2FnZTEuYWpuYWxvY2FsMV9fcHVibGljLmV2ZW50cy5zY3J0MDE6NjMiLCJhcGlWZXJzaW9uIjoidjIiLCJzY29wZSI6InB1YmxpYyIsImp3a3NfdXJpIjoiaHR0cHM6Ly9zY3J0MDEudWVuZ2FnZTEuc2ZkYy15Mzdoem0uc3ZjLnNmZGNmYy5uZXQvaWFtZXNzYWdlL3YxLy53ZWxsLWtub3duL2p3a3MuanNvbj9rZXlJZD01MmQ1OWRmNDE3M2MzZjA5ZGMxNWRjNzMzNWY5YWFkYjFhMDVjNzY4ZmZjMzBiMTllMDkxMGFiNmVlZTQyYjExIiwiZXNEZXBsb3ltZW50VHlwZSI6IkFQSSIsImV4cCI6MTc0MDA3OTM3MCwiaWF0IjoxNzQwMDU3NzcwfQ.IskpRu-_BjPKPWSE3WAKO_eSsYyVsN9PdUoU1rxce3FzTKVVowQ3eZ71uuIQs0q0y07_NCvFvqmwys0SfjqfBKCuLlAyaude2Q873EgluegU7gC0EJqHw2MBlKORirJl-Of8CZGEZBrWRKbUgoJSZ3UbuLwkOFXBkcxoVuknoAHP8SC520krlMhfhOj2Jepfxbc-OaSk3e6Y7GXQq94xg2R5hlHk4C5zt_FxIyOoH_y9BBLuY0wc8zB2F2UtaBjx4D-yX0WkAMcIttU9PL2_eWeItkHiAyOaqJw88RnlYADG2mcit8Slg4W3KDh0Q-VkKCMMCSJu1FSazyQfZ64oNQ
    useEffect(() => {
        let conversationStatePromise;

        conversationStatePromise = props.isExistingConversation ? handleExistingConversation() : handleNewConversation();
        conversationStatePromise
        .then(() => {
            handleSubscribeToEventSource()
            .then(props.uiReady(true)) // Let parent (i.e. MessagingWindow) know the app is UI ready so that the parent can decide to show the actual Messaging window UI.
            .catch(() => {
                props.showMessagingWindow(false);
            })
        });

        return () => {
            conversationStatePromise
            .then(() => {
                cleanupMessagingData();
            });
        };
    }, []);

    /**
     * Update conversation status state based on the event from a child component i.e. MessagingHeader.
     * Updating conversation status state re-renders the current component as well as the child components and the child components can reactively use the updated conversation status to make any changes.
     *
     * @param {string} status - e.g. CLOSED.
     */
    function updateConversationStatus(status) {
        setConversationStatus(status);
    }

    /**
     * Handles a new conversation.
     *
     * 1. Fetch an Unauthenticated Access Token i.e. Messaging JWT.
     * 2. Create a new conversation.
     * @returns {Promise}
     */
    function handleNewConversation() {
        return handleGetUnauthenticatedJwt()
                .then(() => {
                    if (prechatUtil.shouldDisplayPrechatForm()) {
                        console.log("Pre-Chat is enabled. Continuing to render a Pre-Chat form.");
                        setShowPrechatForm(true);
                        return;
                    }
                    console.log("Pre-Chat is not enabled. Continuing to create a new conversation.");
                    return handleCreateNewConversation({"Name":"sardhak","Emai_cus":"a@f.com","Mobile":"aaaaa","UUID":"ssss"})
                            .then(() => {
                                console.log(`Completed initializing a new conversation with conversationId: ${getConversationId()}`);
                            })
                            .catch(err => {
                                console.error(`${err}`);
                            });
                })
                .catch(err => {
                    console.error(`${err}`);
                });
    }

    /**
     * Handles an existing conversation.
     *
     * 1. Fetch a Continuation Access Token i.e. Messaging JWT.
     * 2. Lists the available conversations and loads the current (also most-recent) conversation that is OPEN.
     * 3. Fetch the entries for the current conversation.
     * @returns {Promise}
     */
    function handleExistingConversation() {
        return handleGetContinuityJwt()
                .then(() => {
                    return handleListConversations()
                            .then(() => {
                                console.log(`Successfully listed the conversations.`);
                                handleListConversationEntries()
                                .then(console.log(`Successfully retrieved entries for the current conversation: ${getConversationId()}`))
                                .catch(err => {
                                    console.log("koikokokoko")
                                    console.error(`${err}`);
                                });
                            })
                            .catch(err => {
                                console.log("koikokokoko")
                                console.error(`${err}`);
                            });
                })
                .catch(err => {
                    console.error(`handleExistingConversation ${err}`);
                });
    }

    /**
     * Handles fetching an Unauthenticated Access Token i.e. Messaging JWT.
     *
     * 1. If a JWT already exists, simply return.
     * 2. Makes a request to Unauthenticated Access Token endpoint.
     * 3. Updates the web storage with the latest JWT.
     * 4. Performs a cleanup - clears messaging data and closes the Messaging Window, if the request is unsuccessful.
     * @returns {Promise}
     */
    function handleGetUnauthenticatedJwt() {
        if (getJwt()) {
            console.warn("Messaging access token (JWT) already exists in the web storage. Discontinuing to create a new Unauthenticated access token.");
            return handleExistingConversation()
        }

        return getUnauthenticatedAccessToken()
                .then((response) => {
                    console.log("Successfully fetched an Unauthenticated access token.", response);
                    // Parse the response object which includes access-token (JWT), configutation data.
                    if (typeof response === "object") {
                        setJwt(response.accessToken);
                        setItemInWebStorage(STORAGE_KEYS.JWT, response.accessToken);
                        setLastEventId(response.lastEventId);
                        setDeploymentConfiguration(response.context && response.context.configuration && response.context.configuration.embeddedServiceConfig);
                    }    
                })
                .catch((err) => {
                    console.error(`Something went wrong in fetching an Unauthenticated access token: ${err && err.message ? err.message : err}`);
                    handleMessagingErrors(err);
                    cleanupMessagingData();
                    // props.reInitializeMessagingClient()
                    props.showMessagingWindow(false);
                    throw new Error("Failed to fetch an Unauthenticated access token.");
                });
    }

    /**
     * Handles creating a new conversation.
     *
     * 1. If a conversation is already open, simply return.
     * 2. Generate a new unique conversation-id and initialize in-memory.
     * 3. Makes a request to Create Conversation endpoint.
     * 4. Updates the conversation status internally to OPENED, for the associated components to reactively update.
     * 5. Performs a cleanup - clears messaging data and closes the Messaging Window, if the request is unsuccessful.
     * @returns {Promise}
     */
    function handleCreateNewConversation(routingAttributes) {
        if (conversationStatus === CONVERSATION_CONSTANTS.ConversationStatus.OPENED_CONVERSATION) {
            console.warn("Cannot create a new conversation while a conversation is currently open.");
            return Promise.reject(new Error(`Cannot create a new conversation while a conversation is currently open.`));
        }

        // Initialize a new unique conversation-id in-memory.
        storeConversationId(util.generateUUID());
        return createConversation(getConversationId(), routingAttributes)
                .then(() => {
                    console.log(`Successfully created a new conversation with conversation-id: ${getConversationId()}`);
                    updateConversationStatus(CONVERSATION_CONSTANTS.ConversationStatus.OPENED_CONVERSATION);
                    props.showMessagingWindow(true);
                })
                .catch((err) => {
                    console.error(`Something went wrong in creating a new conversation with conversation-id: ${getConversationId()}: ${err && err.message ? err.message : err}`);
                    handleMessagingErrors(err);
                    cleanupMessagingData();
                    // props.reInitializeMessagingClient()
                    props.showMessagingWindow(false);
                    throw new Error("Failed to create a new conversation.");
                });
    }

    /**
     * Handles fetching a Continuation Access Token i.e. Messaging JWT.
     *
     * 1. Makes a request to Continuation Access Token endpoint.
     * 2. Updates the web storage with the latest JWT.
     * 3. Performs a cleanup - clears messaging data and closes the Messaging Window, if the request is unsuccessful.
     * @returns {Promise}
     */
    function handleGetContinuityJwt() {
        return getContinuityJwt()
                .then((response) => {
                    setJwt(response.accessToken);
                    setItemInWebStorage(STORAGE_KEYS.JWT, response.accessToken);
                })
                .catch((err) => {
                    console.error(`Something went wrong in fetching a Continuation Access Token: ${err && err.message ? err.message : err}`);
                    handleMessagingErrors(err);
                    throw new Error("Failed to fetch a Continuation access token.");
                });
    }

    /**
     * Handles fetching a list of all conversations available. This returns only conversations which are OPEN, unless otherwise specified in the request.
     *
     * 1. Makes a request to List Conversations endpoint.
     * 2. If there are multiple OPEN conversations, loads the conversation with the most-recent start time.
     * 3. Performs a cleanup - clears messaging data and closes the Messaging Window, if the request is unsuccessful.
     * @returns {Promise}
     */
    function handleListConversations() {
        return listConversations()
                .then((response) => {
                    if (response && response.openConversationsFound > 0 && response.conversations.length) {
                        const openConversations = response.conversations;
                        if (openConversations.length > 1) {
				            console.warn(`Expected the user to be participating in 1 open conversation but instead found ${openConversations.length}. Loading the conversation with latest startTimestamp.`);
				            openConversations.sort((conversationA, conversationB) => conversationB.startTimestamp - conversationA.startTimestamp);
                        }
                        // Update conversation-id with the one from service.
                        storeConversationId(openConversations[0].conversationId);
                        updateConversationStatus(CONVERSATION_CONSTANTS.ConversationStatus.OPENED_CONVERSATION);
                        props.showMessagingWindow(true);
                    } else {
                        // No open conversations found.
                        cleanupMessagingData();
                        // props.reInitializeMessagingClient()
                        props.showMessagingWindow(false);
                    }
                })
                .catch((err) => {
                    console.error(`Something went wrong in fetching a list of conversations: ${err && err.message ? err.message : err}`);
                    handleMessagingErrors(err);
                    throw new Error("Failed to list the conversations.");
                });
    }

    /**
     * Handles fetching a list of all conversation entries for the current conversation.
     *
     * 1. Makes a request to List Conversation Entries endpoint.
     * 2. Renders the conversation entries based on their Entry Type.
     * @returns {Promise}
     */
    function handleListConversationEntries() {
        return listConversationEntries(getConversationId())
                .then((response) => {
                    if (Array.isArray(response)) {
                        response.reverse().forEach(entry => {
                            const conversationEntry = generateConversationEntryForCurrentConversation(entry);
                            if (!conversationEntry) {
                                return;
                            }
    
                            switch (conversationEntry.entryType) {
                                case CONVERSATION_CONSTANTS.EntryTypes.CONVERSATION_MESSAGE:
                                    conversationEntry.isEndUserMessage = ConversationEntryUtil.isMessageFromEndUser(conversationEntry);
                                    addConversationEntry(conversationEntry);
                                    break;
                                case CONVERSATION_CONSTANTS.EntryTypes.PARTICIPANT_CHANGED:
                                case CONVERSATION_CONSTANTS.EntryTypes.ROUTING_RESULT:
                                    addConversationEntry(conversationEntry);
                                    break;
                                default:
                                    console.log(`Unrecognized conversation entry type: ${conversationEntry.entryType}.`);
                            }
                        });
                    } else {
                        console.error(`Expecting a response of type Array from listConversationEntries but instead received: ${response}`);
                    }
                })
                .catch((err) => {
                    console.error(`Something went wrong while processing entries from listConversationEntries response:  ${err && err.message ? err.message : err}`);
                    handleMessagingErrors(err);
                    throw new Error("Failed to list the conversation entries for the current conversation.");
                });
    }

    /**
     * Handles establishing a connection to the EventSource i.e. SSE.
     * Selectively listens to the supported events in the app by adding the corresponding event listeners.
     * Note: Update the list of events/event-listeners to add/remove support for the available events. Refer https://developer.salesforce.com/docs/service/messaging-api/references/about/server-sent-events-structure.html
     * @returns {Promise}
     */
    function handleSubscribeToEventSource() {
        return subscribeToEventSource({
                    [CONVERSATION_CONSTANTS.EventTypes.CONVERSATION_MESSAGE]: handleConversationMessageServerSentEvent,
                    [CONVERSATION_CONSTANTS.EventTypes.CONVERSATION_ROUTING_RESULT]: handleRoutingResultServerSentEvent,
                    [CONVERSATION_CONSTANTS.EventTypes.CONVERSATION_PARTICIPANT_CHANGED]: handleParticipantChangedServerSentEvent,
                    [CONVERSATION_CONSTANTS.EventTypes.CONVERSATION_TYPING_STARTED_INDICATOR]: handleTypingStartedIndicatorServerSentEvent,
                    [CONVERSATION_CONSTANTS.EventTypes.CONVERSATION_TYPING_STOPPED_INDICATOR]: handleTypingStoppedIndicatorServerSentEvent,
                    [CONVERSATION_CONSTANTS.EventTypes.CONVERSATION_DELIVERY_ACKNOWLEDGEMENT]: handleConversationDeliveryAcknowledgementServerSentEvent,
                    [CONVERSATION_CONSTANTS.EventTypes.CONVERSATION_READ_ACKNOWLEDGEMENT]: handleConversationReadAcknowledgementServerSentEvent,
                    [CONVERSATION_CONSTANTS.EventTypes.CONVERSATION_CLOSE_CONVERSATION]: handleCloseConversationServerSentEvent
                })
                .then(() => {
                    console.log("Subscribed to the Event Source (SSE).");
                })
                .catch((err) => {
                    handleMessagingErrors(err);
                    throw new Error(err);
                });
    }

    /**
     * Generate a Conversation Entry object from the server sent event.
     *
     * 1. Create a Conversation Entry object from the parsed event data.
     * 2. Return the Conversation Entry if the conversationEntry is for the current conversation and undefined, otherwise.
     * @param {object} event - Event data payload from server-sent event.
     * @returns {object|undefined}
     */
    function generateConversationEntryForCurrentConversation(parsedEventData) {
        const conversationEntry = ConversationEntryUtil.createConversationEntry(parsedEventData);

        // Handle server sent events only for the current conversation
        if (parsedEventData.conversationId === getConversationId()) {
            return conversationEntry;
        }
        console.log(`Current conversation-id: ${getConversationId()} does not match the conversation-id in server sent event: ${parsedEventData.conversationId}. Ignoring the event.`);
        return undefined;
    }

    /**
     * Adds a Conversation Entry object to the list of conversation entries. Updates the state of the list of conversation entries for the component(s) to be updated in-turn, reactively.
     * @param {object} conversationEntry - entry object for the current conversation.
     */
    function addConversationEntry(conversationEntry) {
        conversationEntries.push(conversationEntry);
        setConversationEntries([...conversationEntries]);
    }

    /**
     * Handle a CONVERSATION_MESSAGE server-sent event.
     *
     * This includes:
     *  1. Parse, populate, and create ConversationEntry object based on its entry type
     *      NOTE: Skip processing CONVERSATION_MESSAGE if the newly created ConversationEntry is undefined or invalid or not from the current conversation.
     *  2. Updates in-memory list of conversation entries and the updated list gets reactively passed on to MessagingBody.
     * @param {object} event - Event data payload from server-sent event.
     */
    function handleConversationMessageServerSentEvent(event) {
        try {
            console.log(`Successfully handling conversation message server sent event.`);
            // Update in-memory to the latest lastEventId
            if (event && event.lastEventId) {
                setLastEventId(event.lastEventId);
            }

            const parsedEventData = ConversationEntryUtil.parseServerSentEventData(event);
            const conversationEntry = generateConversationEntryForCurrentConversation(parsedEventData);
            if (!conversationEntry) {
                return;
            }

            if (ConversationEntryUtil.isMessageFromEndUser(conversationEntry)) {
                conversationEntry.isEndUserMessage = true;

                // Since message is echoed back by the server, mark the conversation entry as sent.
                conversationEntry.isSent = true;

                console.log(`End user successfully sent a message.`);
            } else {
                conversationEntry.isEndUserMessage = false;
                console.log(`Successfully received a message from ${conversationEntry.actorType}, ${JSON.stringify(conversationEntry)}`);
            }

            addConversationEntry(conversationEntry);
        } catch(err) {
            console.error(`Something went wrong in handling conversation message server sent event: ${err}`);
        }
    }

    /**
     * Handle a ROUTING_RESULT server-sent event.
     *
     * This includes:
     *  1. Parse, populate, and create ConversationEntry object based on its entry type.
     *      NOTE: Skip processing ROUTING_RESULT if the newly created ConversationEntry is undefined or invalid or not from the current conversation.
     *  2. Updates in-memory list of conversation entries and the updated list gets reactively passed on to MessagingBody.
     *
     *  NOTE: Update the chat client based on the latest routing result. E.g. if the routing type is transfer, set an internal flag like `isTransferring` to 'true' and use that to show a transferring indicator in the ui.
     * @param {object} event - Event data payload from server-sent event.
     */
    function handleRoutingResultServerSentEvent(event) {
        try {
            console.log(`Successfully handling routing result server sent event.`);
            // Update in-memory to the latest lastEventId
            if (event && event.lastEventId) {
                setLastEventId(event.lastEventId);
            }

            const parsedEventData = ConversationEntryUtil.parseServerSentEventData(event);
            const conversationEntry = generateConversationEntryForCurrentConversation(parsedEventData);
            if (!conversationEntry) {
                return;
            }

            if (conversationEntry.messageType === CONVERSATION_CONSTANTS.RoutingTypes.INITIAL) {
                // Render reasonForNotRouting when initial routing fails.
                switch (conversationEntry.content.failureType) {
                    case CONVERSATION_CONSTANTS.RoutingFailureTypes.NO_ERROR:
                    case CONVERSATION_CONSTANTS.RoutingFailureTypes.SUBMISSION_ERROR:
                    case CONVERSATION_CONSTANTS.RoutingFailureTypes.ROUTING_ERROR:
                    case CONVERSATION_CONSTANTS.RoutingFailureTypes.UNKNOWN_ERROR:
                        addConversationEntry(conversationEntry);
                        break;
                    default:
                        console.error(`Unrecognized initial routing failure type: ${conversationEntry.content.failureType}`);
                }
                // Handle when a conversation is being transferred.
            } else if (conversationEntry.messageType === CONVERSATION_CONSTANTS.RoutingTypes.TRANSFER) {
                switch (conversationEntry.content.failureType) {
                    case CONVERSATION_CONSTANTS.RoutingFailureTypes.NO_ERROR:
                        // Render transfer timestamp when transfer is requested successfully.
                        // TODO: Add a transfer state ui update.
                        addConversationEntry(conversationEntry);
                        break;
                    case CONVERSATION_CONSTANTS.RoutingFailureTypes.SUBMISSION_ERROR:
                    case CONVERSATION_CONSTANTS.RoutingFailureTypes.ROUTING_ERROR:
                    case CONVERSATION_CONSTANTS.RoutingFailureTypes.UNKNOWN_ERROR:
                        break;
                    default:
                        console.error(`Unrecognized transfer routing failure type: ${conversationEntry.content.failureType}`);
                }
            } else {
                console.error(`Unrecognized routing type: ${conversationEntry.messageType}`);
            }
        } catch (err) {
            console.error(`Something went wrong in handling routing result server sent event: ${err}`);
        }
    }

    /**
     * Handle a PARTICIPANT_CHANGED server-sent event.
     *
     * This includes:
     *  1. Parse, populate, and create ConversationEntry object based on its entry type.
     *      NOTE: Skip processing PARTICIPANT_CHANGED if the newly created ConversationEntry is undefined or invalid or not from the current conversation.
     *  2. Updates in-memory list of conversation entries and the updated list gets reactively passed on to MessagingBody.
     * @param {object} event - Event data payload from server-sent event.
     */
    function handleParticipantChangedServerSentEvent(event) {
        try {
            console.log(`Successfully handling participant changed server sent event.`);
            // Update in-memory to the latest lastEventId
            if (event && event.lastEventId) {
                setLastEventId(event.lastEventId);
            }

            const parsedEventData = ConversationEntryUtil.parseServerSentEventData(event);
            const conversationEntry = generateConversationEntryForCurrentConversation(parsedEventData);
            if (!conversationEntry) {
                return;
            }
            addConversationEntry(conversationEntry);
        } catch (err) {
            console.error(`Something went wrong in handling participant changed server sent event: ${err}`);
        }
    }

    /**
     * Handle a TYPING_STARTED_INDICATOR server-sent event.
     * @param {object} event - Event data payload from server-sent event.
     */
    function handleTypingStartedIndicatorServerSentEvent(event) {
        try {
            // Update in-memory to the latest lastEventId
            if (event && event.lastEventId) {
                setLastEventId(event.lastEventId);
            }

            const parsedEventData = ConversationEntryUtil.parseServerSentEventData(event);
            // Handle typing indicators only for the current conversation
            if (getConversationId() === parsedEventData.conversationId) {
                const senderName = ConversationEntryUtil.getSenderDisplayName(parsedEventData) || ConversationEntryUtil.getSenderRole(parsedEventData);
                const typingParticipantTimer = currentTypingParticipants[senderName] && currentTypingParticipants[senderName].countdownTimer;

                // If we have received typing indicator from this sender within the past 5 seconds, reset the timer
                // Otherwise, start a new timer
                if (ConversationEntryUtil.getSenderRole(parsedEventData) !== CONVERSATION_CONSTANTS.ParticipantRoles.ENDUSER) {
                    console.log(`Successfully handling typing started indicator server sent event.`);

                    if (typingParticipantTimer) {
                        typingParticipantTimer.reset(Date.now());
                    } else {
                        currentTypingParticipants[senderName] = {
                            countdownTimer: new CountdownTimer(() => {
                                delete currentTypingParticipants[senderName];

                                if (!Object.keys(currentTypingParticipants).length) {
                                    setIsAnotherParticipantTyping(false);
                                }
                            }, CLIENT_CONSTANTS.TYPING_INDICATOR_DISPLAY_TIMEOUT, Date.now()),
                            role: parsedEventData.conversationEntry.sender.role
                        };

                        currentTypingParticipants[senderName].countdownTimer.start();
                    }

                    setIsAnotherParticipantTyping(true);
                }
            }
        } catch (err) {
            console.error(`Something went wrong in handling typing started indicator server sent event: ${err}`);
        }
    }

    /**
     * Handle a TYPING_STOPPED_INDICATOR server-sent event.
     * @param {object} event - Event data payload from server-sent event.
     */
    function handleTypingStoppedIndicatorServerSentEvent(event) {
        try {
            // Update in-memory to the latest lastEventId
            if (event && event.lastEventId) {
                setLastEventId(event.lastEventId);
            }           

            const parsedEventData = ConversationEntryUtil.parseServerSentEventData(event);
            // Handle typing indicators only for the current conversation
            if (getConversationId() === parsedEventData.conversationId) {
                const senderName = ConversationEntryUtil.getSenderDisplayName(parsedEventData) || ConversationEntryUtil.getSenderRole(parsedEventData);
    
                delete currentTypingParticipants[senderName];

                if (!Object.keys(currentTypingParticipants).length) {
                    setIsAnotherParticipantTyping(false);
                }
            }
        } catch (err) {
            console.error(`Something went wrong in handling typing stopped indicator server sent event: ${err}`);
        }
    }

    /**
     * Handle a server-sent event CONVERSATION_DELIVERY_ACKNOWLEDGEMENT:
     * - Parse server-sent event and update a conversation entry (if it exists) with data from the event.
     * - Store delivery acknowledgement timestamp on conversation entry to show receipt timestamp.
     * @param {object} event - Event data payload from server-sent event.
     */
    function handleConversationDeliveryAcknowledgementServerSentEvent(event) {
        try {
            console.log(`Successfully handling conversation delivery acknowledgement server sent event.`);
            // Update in-memory to the latest lastEventId
            if (event && event.lastEventId) {
                setLastEventId(event.lastEventId);
            }

            const parsedEventData = ConversationEntryUtil.parseServerSentEventData(event);
            // Handle delivery acknowledgements only for the current conversation
            if (getConversationId() === parsedEventData.conversationId) {
                if (parsedEventData.conversationEntry && parsedEventData.conversationEntry.relatedRecords.length && parsedEventData.conversationEntry.entryPayload.length) {
                    // Store acknowledgement timestamp and identifier of message that was delivered.
                    const deliveredMessageId = parsedEventData.conversationEntry.relatedRecords[0];
                    const deliveryAcknowledgementTimestamp = JSON.parse(parsedEventData.conversationEntry.entryPayload).acknowledgementTimestamp;

                    // Make deep copy of conversation entries to find matching messageId. 
                    util.createDeepCopy(conversationEntries).filter((conversationEntry) => {
                        if (conversationEntry.messageId === deliveredMessageId) {
                            conversationEntry.isDelivered = true;
                            conversationEntry.deliveryAcknowledgementTimestamp = deliveryAcknowledgementTimestamp;
                        }
                    });
                }
            }
        } catch (err) {
            console.error(`Something went wrong in handling conversation delivery acknowledgement server sent event: ${err}`);
        }
    }

    /**
     * Handle a server-sent event CONVERSATION_READ_ACKNOWLEDGEMENT:
     * - Parse server-sent event and update a conversation entry (if it exists) with data from the event.
     * - Store read acknowledgement timestamp on conversation entry to show receipt timestamp.
     * @param {object} event - Event data payload from server-sent event.
     */
    function handleConversationReadAcknowledgementServerSentEvent(event) {
        try {
            console.log(`Successfully handling conversation read acknowledgement server sent event.`);
            // Update in-memory to the latest lastEventId
            if (event && event.lastEventId) {
                setLastEventId(event.lastEventId);
            }

            const parsedEventData = ConversationEntryUtil.parseServerSentEventData(event);
            // Handle read acknowledgements only for the current conversation
            if (getConversationId() === parsedEventData.conversationId) {
                if (parsedEventData.conversationEntry && parsedEventData.conversationEntry.relatedRecords.length && parsedEventData.conversationEntry.entryPayload.length) {
                    // Store acknowledgement timestamp and identifier of message that was read.
                    const readMessageId = parsedEventData.conversationEntry.relatedRecords[0];
                    const readAcknowledgementTimestamp = JSON.parse(parsedEventData.conversationEntry.entryPayload).acknowledgementTimestamp;

                    // Make deep copy of conversation entries to find matching messageId. 
                    util.createDeepCopy(conversationEntries).filter((conversationEntry) => {
                        if (conversationEntry.messageId === readMessageId) {
                            conversationEntry.isRead = true;
                            conversationEntry.readAcknowledgementTimestamp = readAcknowledgementTimestamp;
                        }
                    });
                }
            }
        } catch (err) {
            console.error(`Something went wrong in handling conversation read acknowledgement server sent event: ${err}`);
        }
    }

    /**
     * Handle a CONVERSATION_CLOSED server-sent event.
     *
     * @param {object} event - Event data payload from server-sent event.
     */
    function handleCloseConversationServerSentEvent(event) {
        try {
            console.log(`Successfully handling close conversation server sent event.`);
            // Update in-memory to the latest lastEventId
            if (event && event.lastEventId) {
                setLastEventId(event.lastEventId);
            }

            const parsedEventData = ConversationEntryUtil.parseServerSentEventData(event);

            // Do not render conversation ended text if the conversation entry is not for the current conversation.
            if (getConversationId() === parsedEventData.conversationId) {
                // Update state to conversation closed status.
                updateConversationStatus(CONVERSATION_CONSTANTS.ConversationStatus.CLOSED_CONVERSATION);
            }
        } catch (err) {
            console.error(`Something went wrong while handling conversation closed server sent event in conversation ${getConversationId()}: ${err}`);
        }
    }

    /**
     * Handle sending a static text message in a conversation.
     * @param {string} conversationId - Identifier of the conversation.
     * @param {string} value - Actual text of the message.
     * @param {string} messageId - Unique identifier of the message.
     * @param {string} inReplyToMessageId - Identifier of another message where this message is being replied to.
     * @param {boolean} isNewMessagingSession - Whether it is a new messaging session.
     * @param {object} routingAttributes - Pre-Chat fields and its values, if configured.
     * @param {object} language - language code.
     * 
     * @returns {Promise}
     */
    function handleSendTextMessage(conversationId, value, messageId, inReplyToMessageId, isNewMessagingSession, routingAttributes, language) {
        return sendTextMessage(conversationId, value, messageId, inReplyToMessageId, isNewMessagingSession, routingAttributes, language)
                .catch((err) => {
                    console.error(`Something went wrong while sending a message to conversation ${conversationId}: ${err}`);
                    setFailedMessage(Object.assign({}, {messageId, value, inReplyToMessageId, isNewMessagingSession, routingAttributes, language}));
                    handleMessagingErrors(err);
                });
    }

    /**
     * Close messaging window handler for the event from a child component i.e. MessagingHeader.
     * When such event is received, invoke the parent's handler to close the messaging window if the conversation status is closed or not yet started.
     */
    function endConversation() {
        if (conversationStatus === CONVERSATION_CONSTANTS.ConversationStatus.OPENED_CONVERSATION) {
            // End the conversation if it is currently opened.
            return closeConversation(getConversationId())
                .then(() => {
                    console.log(`Successfully closed the conversation with conversation-id: ${getConversationId()}`);
                })
                .catch((err) => {
                    console.error(`Something went wrong in closing the conversation with conversation-id ${getConversationId()}: ${err}`);
                })
                .finally(() => {
                    cleanupMessagingData();
                });
        }
    }

    /**
     * Close messaging window handler for the event from a child component i.e. MessagingHeader.
     * When such event is received, invoke the parent's handler to close the messaging window if the conversation status is closed or not yet started.
     */
    function closeMessagingWindow() {
        if (conversationStatus === CONVERSATION_CONSTANTS.ConversationStatus.CLOSED_CONVERSATION || conversationStatus === CONVERSATION_CONSTANTS.ConversationStatus.NOT_STARTED_CONVERSATION) {
            props.showMessagingWindow(false);
        }
    }

    /**
     * Performs a cleanup in the app.
     * 1. Closes the EventSource connection.
     * 2. Clears the web storage.
     * 3. Clears the in-memory messaging data.
     * 4. Update the internal conversation status to CLOSED.
     */
    function cleanupMessagingData() {
        closeEventSource()
        .then(console.log("Closed the Event Source (SSE)."))
        .catch((err) => {
            console.error(`Something went wrong in closing the Event Source (SSE): ${err}`);
        });

        clearWebStorage();
        clearInMemoryData();

        // Update state to conversation closed status.
        updateConversationStatus(CONVERSATION_CONSTANTS.ConversationStatus.CLOSED_CONVERSATION);
    }

    /**
     * Handles the errors from messaging endpoint requests.
     * If a request is failed due to an Unauthorized error (i.e. 401), peforms a cleanup and resets the app and console logs otherwise.
     */
    function handleMessagingErrors(err) {
        console.log("inside handleMessagingErrors", err)
        if (typeof err === "object") {
            if (err.status) {
                switch (err.status) {
                    case 401:
                        console.error(`Unauthenticated request: ${err.message}`);
                        cleanupMessagingData();
                        props.showMessagingWindow(false);
                        // props.reInitializeMessagingClient()
                        break;
                    case 400:
                        console.error(`Invalid request parameters. Please check your data before retrying: ${err.message}`);
                        break;
                    case 404:
                        console.error(`Resource not found. Please check your data before retrying: ${err.message}`);
                        break;
                    case 429:
                        console.warn(`Too many requests issued from the app. Try again in sometime: ${err.message}`);
                        break;
                    /**
                     * HTTP error code returned by the API(s) when a message is sent and failed because no messaging session exists. This error indicates client
                     * to surface the Pre-Chat form if configured to show for every new messaging session and then retry the failed message with routingAttributes.
                     */
                    case 417:
                        if (prechatUtil.shouldDisplayPrechatForm() && prechatUtil.shouldDisplayPrechatEveryMessagingSession()) {
                            console.log("Pre-Chat configured to show for every new messaging session. Continuing to display the Pre-Chat form.");
                            setShowPrechatForm(true);
                        }
                    case 500:
                        console.error(`Something went wrong in the request, please try again: ${err.message}`);
                        break;
                    default:
                        console.error(`Unhandled/Unknown http error: ${err}`);
                        cleanupMessagingData();
                        props.showMessagingWindow(false);
                        // props.reInitializeMessagingClient()
                }
                return;
            }
            console.error(`Something went wrong handleMessagingErrors: ${err && err.message ? err.message : err}`);
        }
        return;
    }

    /**
     * Handles submitting a Pre-Chat form to either start a new conversation or a new messaging session.
     * @param {object} prechatData - Object containing key-value pairs of Pre-Chat form fields and their corresponding values.
     */
    function handlePrechatSubmit(prechatData) {
        let prechatSubmitPromise;
        console.log(`Pre-Chat fields values on submit: ${prechatData}. --stre${JSON.stringify(prechatData)}`);

        // If there is a failed message being tracked while submitting Pre-Chat form, consider it is an existing conversation but a new messaging session. Resend the failed message with the routing attributes to begin a new messaging session.
        if (failedMessage) {
            prechatSubmitPromise = handleSendTextMessage(getConversationId(), failedMessage.value, failedMessage.messageId, failedMessage.inReplyToMessageId, true, prechatData, failedMessage.language);
        } else {
            // If there is no failed message being tracked while submitting Pre-Chat form, create a new conversation.
            prechatSubmitPromise = handleCreateNewConversation(prechatData);
        }
        prechatSubmitPromise
        .then(() => {
            setShowPrechatForm(false);
        });
    }

    const [file, setFile] = useState(null);
    const [fileName, setFileName] = useState("");
    const [previewFile, setPreviewFile] = useState(null);

    const handleFileChange = (event) => {
        console.log("handleFileChange",event.target.files);
        if(event.target.files?.length>0){
      setFile(event.target.files?.[0] || null);
      setFileName(event.target.files?.[0]?.name || "");
      setPreviewFile((prev)=>({ ...prev,[event.target.files[0]?.name]: event.target.files?.[0]? URL.createObjectURL(event.target.files?.[0]):""}));
        }

    };

    const uploadFileToSalesforce = async (conversationId, file, accessToken,msg) => {
        const apiUrl = `https://bitkuber.my.salesforce-scrt.com/iamessage/api/v2/conversation/${conversationId}/file`;
      
        // Prepare the JSON payload for the messageEntry part
        const messageEntry = {
          esDeveloperName: "IOS_Mobile",
          message: {
            id: util.generateUUID(),
            fileId: util.generateUUID(),
            text: msg,
            inReplyToMessageId: "a133c185-73a7-4adf-b6d9"
          },
          routingAttributes: {
            _firstName: ""
          },
          isNewMessagingSession: true,
          language: "en_US"
        };
      
        // Use FormData to construct the multipart/form-data request
        const formData = new FormData();
        // Append messageEntry as a Blob so that its Content-Type is application/json
        formData.append(
          "messageEntry",
          new Blob([JSON.stringify(messageEntry)], { type: "application/json" })
        );
        // Append the file directly. The browser will handle the binary data.
        formData.append("fileData", file, file.name);
      
        try {
          const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${accessToken}`,
            },
            body: formData,
          });
      
          if (!response.ok) {
            throw new Error(`Upload failed: ${response.statusText}`);
          }
          setFile(null);
          setFileName("");
          inputRef.current.value= null;
        } catch (error) {
          console.error("Upload Error:", error);
        }
      };
      
  
    const handleUpload = (msg) => {
      uploadFileToSalesforce(getConversationId(), file, getJwt(), msg);
    };
    const discardFile=(name)=>{
        
        setFile(null)
        setFileName("")
        setPreviewFile((prevData)=>{
            const data= {...prevData};
            delete data?.[name];
            return {...data}
        })
        inputRef.current.value= null;
    }


    return (
        <>
            <MessagingHeader
                conversationStatus={conversationStatus}
                endConversation={endConversation}
                closeMessagingWindow={closeMessagingWindow} 
            />

            {!showPrechatForm &&
            <>
                <MessagingBody
                    conversationEntries={conversationEntries}
                    conversationStatus={conversationStatus} 
                    typingParticipants={currentTypingParticipants}
                    showTypingIndicator={isAnotherParticipantTyping} 
                    sendTextMessage={handleSendTextMessage} 
                    previewFile={previewFile}
                />
                <MessagingInputFooter
                    conversationStatus={conversationStatus} 
                    sendTextMessage={handleSendTextMessage} 
                    sendTypingIndicator={sendTypingIndicator}
                    handleFileChange={handleFileChange}
                    handleUpload={handleUpload}
                    fileName={fileName}
                    previewFile={previewFile}
                    discardFile={discardFile}
                    ref={inputRef}
                     />
            </>
            }
            {
                showPrechatForm &&
                <Prechat prechatSubmit={handlePrechatSubmit} />
            }
            {/* <input type="file" onChange={handleFileChange} />
            <button onClick={handleUpload} disabled={!file}>Upload to Salesforce</button> */}
        </>
    );
}