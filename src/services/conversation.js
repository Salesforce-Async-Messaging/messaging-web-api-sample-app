import { useEffect, useState } from "react";
import * as EventSourcePolyfill from "../helpers/eventsource-polyfill";
import MessagingBody from "../components/messagingBody";
import { getJwt, setLastEventId } from "./dataProvider";
import { subscribeToEventSource, closeEventSource } from './eventSourceService';
import * as ConversationEntryUtil from "../helpers/conversationEntryUtil";
import { CONVERSATION_CONSTANTS } from "../helpers/constants";

export default function Conversation({ conversationId }) {
    let [conversationEntries, setConversationEntries] = useState([]);

    useEffect(() => {
        subscribeToEventSource({
            [CONVERSATION_CONSTANTS.EventTypes.CONVERSATION_MESSAGE]: handleConversationMessageServerSentEvent,
            [CONVERSATION_CONSTANTS.EventTypes.CONVERSATION_ROUTING_RESULT]: handleRoutingResultServerSentEvent,
            [CONVERSATION_CONSTANTS.EventTypes.CONVERSATION_PARTICIPANT_CHANGED]: handleParticipantChangedServerSentEvent
        })
        .then(console.log("Subscribed to the Event Source (SSE)."));

        if (getJwt()) {
            // Messaging JWT (i.e. Acess Token) exists in the web storage -> Existing conversation
        } else {
            // Messaging JWT (i.e. Access Token) does not exist in the web storage -> New conversation
        }

        return () => {
            closeEventSource().then(console.log("Closed the Event Source (SSE)."));
        };
    }, []);

    function generateConversationEntryForCurrentConversation(serverSentEvent) {
        const parsedEventData = ConversationEntryUtil.parseServerSentEventData(serverSentEvent);
        console.log(parsedEventData);
        const conversationEntry = ConversationEntryUtil.createConversationEntry(parsedEventData);

        // Handle server sent events only for the current conversation
        if (parsedEventData.conversationId === conversationId) {
            return conversationEntry;
        }
        console.log(`Current conversation-id: ${conversationId} does not match the conversation-id in server sent event: ${parsedEventData.conversationId}. Ignoring the event.`);
        return undefined;
    }

    function addConversationEntry(conversationEntry) {
        conversationEntries.push(conversationEntry);
        setConversationEntries([...conversationEntries]);
    }

    function handleConversationMessageServerSentEvent(event) {
        try {
            console.log(`Successfully handling conversation message server sent event`);
            // Update in-memory to the latest lastEventId
            if (event && event.lastEventId) {
                setLastEventId(event.lastEventId);
            }

            const conversationEntry = generateConversationEntryForCurrentConversation(event);
            if (!conversationEntry) {
                return;
            }

            if (conversationEntry.isMessageFromEndUser) {
                conversationEntry.isEndUserMessage = true;
                console.log(`You sent a message successfully`);
            } else {
                conversationEntry.isEndUserMessage = false;
                console.log(`Successfully recieved a message from ${conversationEntry.actorType}`);
            }
            addConversationEntry(conversationEntry);
        } catch(err) {
            console.error(`Something went wrong in handling conversation message server sent event: ${err}`);
        }
    }

    function handleRoutingResultServerSentEvent(event) {
        try {
            console.log(`Successfully handling routing result server sent event`);
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

    function handleParticipantChangedServerSentEvent(event) {
        try {
            console.log(`Successfully handling participant changed server sent event`);
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

    return (
        <>
            <MessagingBody conversationEntries={conversationEntries} />
        </>
    );
}