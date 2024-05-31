import { useEffect, useState } from "react";
import * as EventSourcePolyfill from "../helpers/eventsource-polyfill.js";

// Import children components to plug in and render.
import MessagingHeader from "./messagingHeader";
import MessagingBody from "./messagingBody";
import MessagingInputFooter from "./messagingInputFooter";

import { setJwt, setLastEventId, storeConversationId, getConversationId } from "../services/dataProvider";
import { subscribeToEventSource, closeEventSource } from '../services/eventSourceService';
import { sendTextMessage, getContinuityJwt, listConversations, listConversationEntries, closeConversation } from "../services/messagingService";
import * as ConversationEntryUtil from "../helpers/conversationEntryUtil";
import { CONVERSATION_CONSTANTS, STORAGE_KEYS } from "../helpers/constants";
import { setItemInWebStorage, clearWebStorage } from "../helpers/webstorageUtils";

export default function Conversation(props) {
    // Initialize a list of conversation entries.
    let [conversationEntries, setConversationEntries] = useState([]);
    // Initialize the conversation status.
    let [conversationStatus, setConversationStatus] = useState(CONVERSATION_CONSTANTS.ConversationStatus.OPENED_CONVERSATION);

    useEffect(() => {
        let conversationStatePromise;

        if (props.isExistingConversation) {
            // Handle existing conversation.
            conversationStatePromise = handleExistingConversation();
        } else {
            // Handle new conversation.
            conversationStatePromise = handleNewConversation();
        }
        conversationStatePromise
        .then(() => {
            //if (conversationStatus === CONVERSATION_CONSTANTS.ConversationStatus.OPENED_CONVERSATION) {
                handleSubscribeToEventSource();
            //}
        });

        return () => {
            conversationStatePromise
            .then(() => {
                closeEventSource()
                .then(console.log("Closed the Event Source (SSE)."))
                .catch((err) => {
                    console.error(`Something went wrong in closing the Event Source (SSE): ${err}`);
                });
            });
        };
    }, []);

    function handleNewConversation() {
        return Promise.resolve();
    }

    function handleExistingConversation() {
        return handleGetContinuityJwt()
                .then(() => {
                    return handleListConversations()
                    .then(() => {
                        console.log(`Successfully listed the conversations.`);
                    })
                    .catch((err) => {
                        handleMessagingErrors(err);
                    });
                })
                .catch((err) => {
                    handleMessagingErrors(err);
                });
    }

    function handleSubscribeToEventSource() {
        return subscribeToEventSource({
                    [CONVERSATION_CONSTANTS.EventTypes.CONVERSATION_MESSAGE]: handleConversationMessageServerSentEvent,
                    [CONVERSATION_CONSTANTS.EventTypes.CONVERSATION_ROUTING_RESULT]: handleRoutingResultServerSentEvent,
                    [CONVERSATION_CONSTANTS.EventTypes.CONVERSATION_PARTICIPANT_CHANGED]: handleParticipantChangedServerSentEvent,
                    [CONVERSATION_CONSTANTS.EventTypes.CONVERSATION_CLOSE_CONVERSATION]: handleCloseConversationServerSentEvent
                })
                .then(() => {
                    console.log("Subscribed to the Event Source (SSE).");
                    if (props.isExistingConversation) {
                        handleListConversationEntries()
                        .then(console.log(`Successfully retrieved entries for the current conversation: ${getConversationId()}`));
                    }
                });
    }

    /**
     * Generate a Conversation Entry object from the server sent event.
     * @param {object} event - Event data payload from server-sent event.
     * @returns {object|undefined}
     *
     * 1. Parse the server sent event.
     * 2. Create a Conversation Entry object from the parsed event data.
     * 3. Return the Conversation Entry if the conversationEntry is for the current conversation and undefined, otherwise.
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
     */
    function addConversationEntry(conversationEntry) {
        conversationEntries.push(conversationEntry);
        setConversationEntries([...conversationEntries]);
    }

    /**
     * Handle a CONVERSATION_MESSAGE server-sent event.
     * @param {object} event - Event data payload from server-sent event.
     *
     * This includes:
     *  1. Parse, populate, and create ConversationEntry object based on its entry type
     *      NOTE: Skip processing CONVERSATION_MESSAGE if the newly created ConversationEntry is undefined or invalid or not from the current conversation.
     *  2. Updates in-memory list of conversation entries and the updated list gets reactively passed on to MessagingBody.
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
                console.log(`End user successfully sent a message.`);
            } else {
                conversationEntry.isEndUserMessage = false;
                console.log(`Successfully received a message from ${conversationEntry.actorType}`);
            }

            addConversationEntry(conversationEntry);
        } catch(err) {
            console.error(`Something went wrong in handling conversation message server sent event: ${err}`);
        }
    }

    /**
     * Handle a ROUTING_RESULT server-sent event.
     * @param {object} event - Event data payload from server-sent event.
     *
     * This includes:
     *  1. Parse, populate, and create ConversationEntry object based on its entry type.
     *      NOTE: Skip processing ROUTING_RESULT if the newly created ConversationEntry is undefined or invalid or not from the current conversation.
     *  2. Updates in-memory list of conversation entries and the updated list gets reactively passed on to MessagingBody.
     *
     *  NOTE: Update the chat client based on the latest routing result. E.g. if the routing type is transfer, set an internal flag like `isTransferring` to 'true' and use that to show a transferring indicator in the ui.
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
     * @param {object} event - Event data payload from server-sent event.
     *
     * This includes:
     *  1. Parse, populate, and create ConversationEntry object based on its entry type.
     *      NOTE: Skip processing PARTICIPANT_CHANGED if the newly created ConversationEntry is undefined or invalid or not from the current conversation.
     *  2. Updates in-memory list of conversation entries and the updated list gets reactively passed on to MessagingBody.
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
     * Update conversation status state based on the event from a child component i.e. MessagingHeader.
     * Updating conversation status state re-renders the current component as well as the child components and the child components can reactively use the updated conversation status to make any changes.
     *
     * @param {string} status - e.g. CLOSED.
     */
    function updateConversationStatus(status) {
        setConversationStatus(status);
    }

    /**
     * Close messaging window handler for the event from a child component i.e. MessagingHeader.
     * When such event is received, invoke the parent's handler to close the messaging window if the conversation status is closed or not yet started.
     */
    function endConversation() {
        if (conversationStatus === CONVERSATION_CONSTANTS.ConversationStatus.OPENED_CONVERSATION) {
            // End the conversation if it is currently opened.
            closeConversation(getConversationId())
            .then(() => {
                console.log(`Successfully closed the conversation with conversation-id: ${getConversationId()}`);
                // Update state to conversation closed status.
                updateConversationStatus(CONVERSATION_CONSTANTS.ConversationStatus.CLOSED_CONVERSATION);
                cleanupMessagingData();
            })
            .catch((err) => {
                console.error(`Something went wrong in closing the conversation with conversation-id ${getConversationId()}: ${err}`);
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

    function handleGetContinuityJwt() {
        return getContinuityJwt()
                .then((response) => {
                    setJwt(response.accessToken);
                    setItemInWebStorage(STORAGE_KEYS.JWT, response.accessToken);
                });
    }

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
                    } else {
                        // No open conversations found.
                        cleanupMessagingData();
                    }
                });
    }

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
                    console.error(`Something went wrong while processing entries from listConversationEntries response: ${err}`);
                });
    }

    function cleanupMessagingData() {
        clearWebStorage();

        closeEventSource()
        .then(console.log("Closed the Event Source (SSE)."))
        .catch((err) => {
            console.error(`Something went wrong in closing the Event Source (SSE): ${err}`);
        });
    }

    function handleMessagingErrors(err) {
        if (typeof err === "object") {
            console.log(`Something went wrong: ${err && err.message ? err.message : err}`);
            switch (err.status) {
                case 401:
                    updateConversationStatus(CONVERSATION_CONSTANTS.ConversationStatus.CLOSED_CONVERSATION);
                    cleanupMessagingData();
                    break;
                case 400:
                    console.error(`Invalid request parameters: ${err.message}`);
                    break;
            }
        }
    }

    return (
        <>
            <MessagingHeader
                conversationStatus={conversationStatus}
                endConversation={endConversation}
                closeMessagingWindow={closeMessagingWindow} />
            <MessagingBody
                conversationEntries={conversationEntries}
                conversationStatus={conversationStatus} />
            <MessagingInputFooter
                conversationStatus={conversationStatus} 
                sendTextMessage={sendTextMessage} />
        </>
    );
}