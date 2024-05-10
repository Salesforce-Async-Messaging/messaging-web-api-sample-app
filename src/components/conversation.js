import { useEffect, useState } from "react";
import * as EventSourcePolyfill from "../helpers/eventsource-polyfill.js";

// Import children components to plug in and render.
import MessagingHeader from "./messagingHeader";
import MessagingBody from "./messagingBody";
import MessagingInputFooter from "./messagingInputFooter";

import { setLastEventId } from "../services/dataProvider";
import { subscribeToEventSource, closeEventSource } from '../services/eventSourceService';
import { sendTextMessage, closeConversation } from "../services/messagingService";
import * as ConversationEntryUtil from "../helpers/conversationEntryUtil";
import { CONVERSATION_CONSTANTS } from "../helpers/constants";
import { clearWebStorage } from "../helpers/webstorageUtils";

export default function Conversation(props) {
    // Initialize a list of conversation entries.
    let [conversationEntries, setConversationEntries] = useState([]);
    // Initialize the conversation status.
    let [conversationStatus, setConversationStatus] = useState(CONVERSATION_CONSTANTS.ConversationStatus.OPENED_CONVERSATION);

    useEffect(() => {
        if (conversationStatus === CONVERSATION_CONSTANTS.ConversationStatus.OPENED_CONVERSATION) {
            subscribeToEventSource({
                [CONVERSATION_CONSTANTS.EventTypes.CONVERSATION_MESSAGE]: handleConversationMessageServerSentEvent,
                [CONVERSATION_CONSTANTS.EventTypes.CONVERSATION_ROUTING_RESULT]: handleRoutingResultServerSentEvent,
                [CONVERSATION_CONSTANTS.EventTypes.CONVERSATION_PARTICIPANT_CHANGED]: handleParticipantChangedServerSentEvent,
                [CONVERSATION_CONSTANTS.EventTypes.CONVERSATION_CLOSE_CONVERSATION]: handleCloseConversationServerSentEvent
            })
            .then(console.log("Subscribed to the Event Source (SSE)."));
        }

        return () => {
            closeEventSource()
            .then(console.log("Closed the Event Source (SSE)."))
            .catch((err) => {
                console.error(`Something went wrong in closing the Event Source (SSE): ${err}`);
            });
        };
    }, []);

    /**
     * Generate a Conversation Entry object from the server sent event.
     * @param {object} event - Event data payload from server-sent event.
     * @returns {object|undefined}
     *
     * 1. Parse the server sent event.
     * 2. Create a Conversation Entry object from the parsed event data.
     * 3. Return the Conversation Entry if the conversationEntry is for the current conversation and undefined, otherwise.
     */
    function generateConversationEntryForCurrentConversation(serverSentEvent) {
        const parsedEventData = ConversationEntryUtil.parseServerSentEventData(serverSentEvent);
        const conversationEntry = ConversationEntryUtil.createConversationEntry(parsedEventData);

        // Handle server sent events only for the current conversation
        if (parsedEventData.conversationId === props.conversationId) {
            return conversationEntry;
        }
        console.log(`Current conversation-id: ${props.conversationId} does not match the conversation-id in server sent event: ${parsedEventData.conversationId}. Ignoring the event.`);
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

            const conversationEntry = generateConversationEntryForCurrentConversation(event);
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
            const conversationEntry = generateConversationEntryForCurrentConversation(event);
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
            const conversationEntry = generateConversationEntryForCurrentConversation(event);
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
            if (props.conversationId === parsedEventData.conversationId) {
                // Update state to conversation closed status.
                updateConversationStatus(CONVERSATION_CONSTANTS.ConversationStatus.CLOSED_CONVERSATION);
            }
        } catch (err) {
            console.error(`Something went wrong while handling conversation closed server sent event in conversation ${props.conversationId}: ${err}`);
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
            closeConversation(props.conversationId)
            .then(() => {
                console.log(`Successfully closed the conversation with conversation-id: ${props.conversationId}`);
                // Update state to conversation closed status.
                updateConversationStatus(CONVERSATION_CONSTANTS.ConversationStatus.CLOSED_CONVERSATION);
                clearWebStorage();
                closeEventSource()
                .then(console.log("Closed the Event Source (SSE)."))
                .catch((err) => {
                    console.error(`Something went wrong in closing Event Source (SSE): ${err}`);
                })
            })
            .catch((err) => {
                console.error(`Something went wrong in closing the conversation with conversation-id ${props.conversationId}: ${err}`);
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

    return (
        <>
            <MessagingHeader
                conversationId={props.conversationId}
                conversationStatus={conversationStatus}
                endConversation={endConversation}
                closeMessagingWindow={closeMessagingWindow} />
            <MessagingBody
                conversationEntries={conversationEntries}
                conversationStatus={conversationStatus} />
            <MessagingInputFooter
                conversationId={props.conversationId}
                conversationStatus={conversationStatus} 
                sendTextMessage={sendTextMessage} />
        </>
    );
}