/**
 * Messaging app's functional constants.
 * @type {Object}
 */
export const APP_CONSTANTS = {
    APP_CAPABILITIES_VERSION: "248",
    APP_PLATFORM: "Web"
};

/**
 * Web storage keys.
 * @type {Object}
 */
export const STORAGE_KEYS = {
    SCROLL_POSITION: "SCROLL_POSITION",
    JWT: "JWT"
};

/**
 * Constants concerning REST APIs used in the Messaging app.
 * @type {Object}
 */
export const MESSAGING_API_CONSTANTS = {
    LIST_CONVERSATION_API_NUM_CONVERSATIONS_LIMIT: 20
};

/**
 * Constants concerning a conversation in the Messaging app.
 * @type {Object}
 */
export const CONVERSATION_CONSTANTS = {
    /**
     * Status of a conversation in the chat client.
     * @type {String}
     */
    ConversationStatus: {
        NOT_STARTED_CONVERSATION: "NOT_STARTED",
        OPENED_CONVERSATION: "OPEN",
        CLOSED_CONVERSATION: "CLOSED"
    },
    /**
     * Types of events published by Conversation Service in SCRT 2.0.
     * See `ConversationEventType`: TODO: insert doc link
     * @type {String}
     */
    EventTypes: {
        CONVERSATION_MESSAGE: "CONVERSATION_MESSAGE",
        CONVERSATION_PARTICIPANT_CHANGED: "CONVERSATION_PARTICIPANT_CHANGED",
        CONVERSATION_ROUTING_RESULT: "CONVERSATION_ROUTING_RESULT",
        CONVERSATION_DELIVERY_ACKNOWLEDGEMENT: "CONVERSATION_DELIVERY_ACKNOWLEDGEMENT",
        CONVERSATION_READ_ACKNOWLEDGEMENT: "CONVERSATION_READ_ACKNOWLEDGEMENT",
        CONVERSATION_CLOSE_CONVERSATION: "CONVERSATION_CLOSE_CONVERSATION"
    },
    /**
     * Properties of a generic ConversationEntry class instance.
     * @type {String}
     */  
    ConversationEntryProperties: {
        CONVERSATION_ID: "conversationId",
        MESSAGE_ID: "messageId",
        CONTENT: "content",
        MESSAGE_TYPE: "messageType",
        ENTRY_TYPE: "entryType",
        SENDER: "sender",
        ACTOR_NAME: "actorName",
        ACTOR_TYPE: "actorType",
        TRANSCRIPTED_TIMESTAMP: "transcriptedTimestamp",
        MESSAGE_REASON: "messageReason"
    },
    /**
     * Types of conversation entries.
     * See `EntryType`: TODO: insert doc link
     * @type {String}
     */
    EntryTypes: {
        CONVERSATION_MESSAGE: "Message",
        PARTICIPANT_CHANGED: "ParticipantChanged",
        ROUTING_RESULT: "RoutingResult",
        DELIVERY_ACKNOWLEDGEMENT: "DeliveryAcknowledgement",
        READ_ACKNOWLEDGEMENT: "ReadAcknowledgement"
    },
    /**
     * The semantic type of a Message entry type, i.e. what a message does.
     * See `MessageType`: TODO: insert doc link
     * @type {String}
     */
    MessageTypes: {
        STATIC_CONTENT_MESSAGE: "StaticContentMessage"
    },
    /**
     * The rendering format of a Message entry type, i.e. how it looks.
     * See `FormatType`: TODO: insert doc link
     * @type {String}
     */
    FormatTypes: {
        TEXT: "Text"
    },
    /**
     * The role of the sender of events published by Conversation Service in SCRT 2.0.
     * See `ParticipantRole`: TODO: insert doc link
     * @type {String}
     */
    ParticipantRoles: {
        ENDUSER: "EndUser",
        AGENT: "Agent",
        CHATBOT: "Chatbot",
        SYSTEM: "System",
        ROUTER: "Router",
        SUPERVISOR: "Supervisor"
    },
    /**
     * The operation (i.e. join/leave) of the ParticipantChanged entry type.
     * See `ParticipantChangedOperation`: TODO: insert doc link
     * @type {String}
     */
    ParticipantChangedOperations: {
        ADD: "add",
        REMOVE: "remove"
    },
    /**
     * The routing type, set from the RoutingContext and sent in RoutingResult entries.
     * See `RoutingType`: TODO: insert doc link
     * @type {String}
     */
    RoutingTypes: {
        INITIAL: "Initial",
        TRANSFER: "Transfer"
    },
    /**
     * The current routing status of the conversation, returned from the ConversationStatus API.
     * See `RoutingStatus`: TODO: insert doc link
     * @type {String}
     */
    RoutingStatus: {
        ROUTED: "ROUTED",
        NEEDS_ROUTING: "NEEDS_ROUTING",
        INITIAL: "INITIAL",
        TRANSFER: "TRANSFER"
    },
    /**
     * How routing failed or succeeded, sent in RoutingResult entries.
     * See `RoutingFailureType`: TODO: insert doc link
     * @type {String}
     */
    RoutingFailureTypes: {
        NO_ERROR: "None",
        UNKNOWN_ERROR: "Unknown",
        SUBMISSION_ERROR: "SubmissionError",
        ROUTING_ERROR: "RoutingError"
    }
};