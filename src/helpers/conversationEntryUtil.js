import { CONVERSATION_CONSTANTS } from "./constants";

/**
 * Parses JSON data from a server-sent event.
 * @param {Object} event - Server-sent event.
 * @returns {Object} - Parsed server-sent event data.
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

export function createConversationEntry(data) {
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
    }
};

//============================================================== STATIC TEXT MESSAGE functions ==============================================================
export function isConversationEntryAMessage(conversationEntry) {
    if (conversationEntry) {
        return conversationEntry.entryType === CONVERSATION_CONSTANTS.EntryTypes.CONVERSATION_MESSAGE;
    }
    return false;
};

export function isMessageFromEndUser(conversationEntry) {
    if (isConversationEntryAMessage(conversationEntry)) {
        return conversationEntry.actorType === CONVERSATION_CONSTANTS.ParticipantRoles.ENDUSER;
    }
    return false;
}

export function isConversationEntryAStaticContentMessage(conversationEntry) {
    if (isConversationEntryAMessage(conversationEntry)) {
        return conversationEntry.content && conversationEntry.content.messageType === CONVERSATION_CONSTANTS.MessageTypes.STATIC_CONTENT_MESSAGE;
    }
    return false;
}

export function getStaticContentPayload(conversationEntry) {
    if (isConversationEntryAStaticContentMessage(conversationEntry)) {
        return conversationEntry.content && conversationEntry.content.staticContent;
    }
    return undefined;
}

export function isTextMessage(conversationEntry) {
    if (isConversationEntryAStaticContentMessage(conversationEntry)) {
        return getStaticContentPayload(conversationEntry).formatType === CONVERSATION_CONSTANTS.FormatTypes.TEXT;
    }
}

export function getTextMessageContent(conversationEntry) {
    if (isTextMessage(conversationEntry)) {
        return getStaticContentPayload(conversationEntry).text;
    }
    return undefined;
}
//============================================================== PARTICIPANT CHANGE functions ==============================================================
export function isParticipantChangeEvent(conversationEntry) {
    return conversationEntry.entryType === CONVERSATION_CONSTANTS.EntryTypes.PARTICIPANT_CHANGED;
}

export function hasParticipantJoined(conversationEntry) {
    return isParticipantChangeEvent(conversationEntry) && conversationEntry.content.entries[0].operation === CONVERSATION_CONSTANTS.ParticipantChangedOperations.ADD;
}

export function getParticipantChangeEventPartcipantName(conversationEntry) {
    return isParticipantChangeEvent(conversationEntry) && (conversationEntry.content.entries[0].displayName || conversationEntry.content.entries[0].participant.role);
}