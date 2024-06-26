import { CONVERSATION_CONSTANTS } from "./constants";

/**
 * Parses JSON data from a server-sent event.
 * @param {object} event - Server-sent event.
 * @returns {object} - Parsed server-sent event data.
 * @throws {Error} if event data is invalid.
 */
export function parseServerSentEventData(event) {
    if (event && event.data && typeof event.data === "string") {
        const data = JSON.parse(event.data);

        if (!data || typeof data !== "object") {
            throw new Error(`Error parsing data in server sent event.`);
        } else {
            return data;
        }
    } else {
        throw new Error(`Invalid data in server sent event.`);
    }
};

/**
 * Parses JSON entry payload field from a server-sent event data.
 * @param {object} data - Server-sent event.
 * @returns {object} - Parsed server-sent event data.
 * @throws {Error} if event data is invalid.
 */
export function createConversationEntry(data) {
    try {
        if (typeof data === "object") {
            const entryPayload = JSON.parse(data.conversationEntry.entryPayload);
    
            return {
                conversationId: data.conversationId,
                messageId: data.conversationEntry.identifier,
                content: entryPayload.abstractMessage || entryPayload,
                messageType: entryPayload.abstractMessage ? entryPayload.abstractMessage.messageType : (entryPayload.routingType || entryPayload.entries[0].operation) ,
                entryType: entryPayload.entryType,
                sender: data.conversationEntry.sender,
                actorName: data.conversationEntry.senderDisplayName ? (data.conversationEntry.senderDisplayName || data.conversationEntry.sender.role) : (entryPayload.entries[0].displayName || entryPayload.entries[0].participant.role),
                actorType: data.conversationEntry.sender.role,
                transcriptedTimestamp: data.conversationEntry.transcriptedTimestamp,
                messageReason: entryPayload.messageReason
            };
        } else {
            throw new Error(`Expected an object to create a new conversation entry but instead, received ${data}`);
        }
    } catch (err) {
        throw new Error(`Something went wrong while creating a conversation entry: ${err}`);
    }
    
};

//============================================================== STATIC TEXT MESSAGE functions ==============================================================
/**
 * Validates whether the supplied object is a conversation-entry with entry type as CONVERSATION_MESSAGE.
 * @param {object} conversationEntry
 * @returns {boolean} - TRUE - if the conversation-entry is a CONVERSATION_MESSAGE and FALSE - otherwise.
 */
export function isConversationEntryMessage(conversationEntry) {
    if (conversationEntry) {
        return conversationEntry.entryType === CONVERSATION_CONSTANTS.EntryTypes.CONVERSATION_MESSAGE;
    }
    return false;
};

/**
 * Validates whether the supplied CONVERSATION_MESSAGE is originating from an end-user participant.
 * @param {object} conversationEntry
 * @returns {boolean} - TRUE - if the CONVERSATION_MESSAGE is sent by the end-user participant and FALSE - otherwise.
 */
export function isMessageFromEndUser(conversationEntry) {
    if (isConversationEntryMessage(conversationEntry)) {
        return conversationEntry.actorType === CONVERSATION_CONSTANTS.ParticipantRoles.ENDUSER;
    }
    return false;
};

/**
 * Validates whether the supplied CONVERSATION_MESSAGE is a STATIC_CONTENT_MESSAGE (i.e. messageType === "STATIC_CONTENT_MESSAGE").
 * @param {object} conversationEntry
 * @returns {boolean} - TRUE - if the CONVERSATION_MESSAGE is a STATIC_CONTENT_MESSAGE and FALSE - otherwise.
 */
export function isConversationEntryStaticContentMessage(conversationEntry) {
    if (isConversationEntryMessage(conversationEntry)) {
        return conversationEntry.content && conversationEntry.content.messageType === CONVERSATION_CONSTANTS.MessageTypes.STATIC_CONTENT_MESSAGE;
    }
    return false;
};

/**
 * Gets the supplied STATIC_CONTENT_MESSAGE's payload.
 * @param {object} conversationEntry
 * @returns {object|undefined}
 */
export function getStaticContentPayload(conversationEntry) {
    if (isConversationEntryStaticContentMessage(conversationEntry)) {
        return conversationEntry.content && conversationEntry.content.staticContent;
    }
    return undefined;
};

/**
 * Validates whether the supplied STATIC_CONTENT_MESSAGE is a Text Message (i.e. formatType === "Text").
 * @param {object} conversationEntry
 * @returns {boolean} - TRUE - if the STATIC_CONTENT_MESSAGE is a Text Message and FALSE - otherwise.
 */
export function isTextMessage(conversationEntry) {
    if (isConversationEntryStaticContentMessage(conversationEntry)) {
        return getStaticContentPayload(conversationEntry).formatType === CONVERSATION_CONSTANTS.FormatTypes.TEXT;
    }
};

/**
 * Gets the supplied Text Message's text.
 * @param {object} conversationEntry
 * @returns {string}
 */
export function getTextMessageContent(conversationEntry) {
    if (isTextMessage(conversationEntry)) {
        return getStaticContentPayload(conversationEntry).text;
    }
    return "";
};
//============================================================== PARTICIPANT CHANGE functions ==============================================================
/**
 * Validates whether the supplied object is a conversation-entry with entry type as PARTICIPANT_CHANGED.
 * @param {object} conversationEntry
 * @returns {boolean} - TRUE - if the conversation-entry is a PARTICIPANT_CHANGED event and FALSE - otherwise.
 */
export function isParticipantChangeEvent(conversationEntry) {
    return conversationEntry.entryType === CONVERSATION_CONSTANTS.EntryTypes.PARTICIPANT_CHANGED;
};

/**
 * Validates whether the supplied PARTICIPANT_CHANGED conversation-entry's participant joined the conversation. 
 * @param {object} conversationEntry
 * @returns {boolean} - TRUE - if the participant joined and FALSE - if the participant left.
 */
export function hasParticipantJoined(conversationEntry) {
    return isParticipantChangeEvent(conversationEntry) && conversationEntry.content.entries[0].operation === CONVERSATION_CONSTANTS.ParticipantChangedOperations.ADD;
};

/**
 * Gets the supplied PARTICIPANT_CHANGED conversation-entry's participant name.
 * @param {object} conversationEntry
 * @returns {string}
 */
export function getParticipantChangeEventPartcipantName(conversationEntry) {
    return isParticipantChangeEvent(conversationEntry) && (conversationEntry.content.entries[0].displayName || conversationEntry.content.entries[0].participant.role);
};