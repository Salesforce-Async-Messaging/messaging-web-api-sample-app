/**
 * Web storage keys.
 * @type {Object}
 */
export const STORAGE_KEYS = {
    JWT: "JWT",
    ORGANIZATION_ID: "ORGANIZATION_ID",
    DEPLOYMENT_DEVELOPER_NAME: "DEPLOYMENT_DEVELOPER_NAME",
    MESSAGING_URL: "MESSAGING_URL",
    DEPLOYMENT_CONFIGURATION: "DEPLOYMENT_CONFIGURATION"
};

/**
 * Constants concerning REST APIs used in the Messaging app.
 * @type {Object}
 */
export const MESSAGING_API_CONSTANTS = {
    // Optional parameter to listConversations API: The maximum number of conversations to retrieve. Default is 20, Max is 50.
    LIST_CONVERSATION_API_NUM_CONVERSATIONS_LIMIT: 20,
    // Optional parameter to listConversationEntries API: The maximum number of entries to retrieve. Default is 20, Max is 50.
    LIST_CONVERSATION_ENTRIES_API_ENTRIES_LIMIT: 50
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
     * Refer https://developer.salesforce.com/docs/service/messaging-api/references/about/server-sent-events-structure.html
     * @type {String}
     */
    EventTypes: {
        CONVERSATION_MESSAGE: "CONVERSATION_MESSAGE",
        CONVERSATION_PARTICIPANT_CHANGED: "CONVERSATION_PARTICIPANT_CHANGED",
        CONVERSATION_ROUTING_RESULT: "CONVERSATION_ROUTING_RESULT",
        CONVERSATION_TYPING_STARTED_INDICATOR: "CONVERSATION_TYPING_STARTED_INDICATOR",
        CONVERSATION_TYPING_STOPPED_INDICATOR: "CONVERSATION_TYPING_STOPPED_INDICATOR",
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
     * @type {String}
     */
    EntryTypes: {
        CONVERSATION_MESSAGE: "Message",
        PARTICIPANT_CHANGED: "ParticipantChanged",
        ROUTING_RESULT: "RoutingResult",
        DELIVERY_ACKNOWLEDGEMENT: "DeliveryAcknowledgement",
        READ_ACKNOWLEDGEMENT: "ReadAcknowledgement",
        TYPING_STARTED_INDICATOR: "TypingStartedIndicator",
        TYPING_STOPPED_INDICATOR: "TypingStoppedIndicator"
    },
    /**
     * The semantic type of a Message entry type, i.e. what a message does.
     * Refer https://developer.salesforce.com/docs/service/messaging-api/references/about/message-types-format-types.html#message-types
     * @type {String}
     */
    MessageTypes: {
        STATIC_CONTENT_MESSAGE: "StaticContentMessage",
        CHOICES_MESSAGE: "ChoicesMessage",
        CHOICES_RESPONSE_MESSAGE: "ChoicesResponseMessage"
    },
    /**
     * The rendering format of a Message entry type, i.e. how it looks.
     * Refer https://developer.salesforce.com/docs/service/messaging-api/references/about/message-types-format-types.html#format-types
     * @type {String}
     */
    FormatTypes: {
        TEXT: "Text",
        BUTTONS: "Buttons",
        QUICK_REPLIES: "QuickReplies",
        SELECTIONS: "Selections"
    },
    /**
     * The role of the sender of events published by Conversation Service in SCRT 2.0.
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
     * @type {String}
     */
    ParticipantChangedOperations: {
        ADD: "add",
        REMOVE: "remove"
    },
    /**
     * The routing type, set from the RoutingContext and sent in RoutingResult entries.
     * @type {String}
     */
    RoutingTypes: {
        INITIAL: "Initial",
        TRANSFER: "Transfer"
    },
    /**
     * The current routing status of the conversation, returned from the ConversationStatus API.
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
     * @type {String}
     */
    RoutingFailureTypes: {
        NO_ERROR: "None",
        UNKNOWN_ERROR: "Unknown",
        SUBMISSION_ERROR: "SubmissionError",
        ROUTING_ERROR: "RoutingError"
    }
};

/**
 * Update this list to add/remove support for Entry types in the app. This can be used to render supported conversation entries, to be retrived from listConversationEntries API etc.
 * @type {Array}
 */
export const SUPPORTED_ENTRY_TYPES = [CONVERSATION_CONSTANTS.EntryTypes.CONVERSATION_MESSAGE, CONVERSATION_CONSTANTS.EntryTypes.PARTICIPANT_CHANGED, CONVERSATION_CONSTANTS.EntryTypes.ROUTING_RESULT];

/**
 * Messaging app's functional constants.
 * @type {Object}
 */
export const APP_CONSTANTS = {
    APP_CAPABILITIES_VERSION: "1",
    APP_PLATFORM: "Web",
    ORGANIZATION_ID_PREFIX: "00D",
    SALESFORCE_MESSAGING_SCRT_URL: "salesforce-scrt.com",
    HTTPS_PROTOCOL: "https:",
    // The storage key name under which messaging data is stored in local/session storage.
    WEB_STORAGE_KEY: "MESSAGING_SAMPLE_APP_WEB_STORAGE_"
};

/**
 * Constants related to Embedded Service Deployment configuration.
 * @type {object}
 */
export const DEPLOYMENT_CONFIGURATION_CONSTANTS = {
    PRECHAT_DISPLAY_EVERY_CONVERSATION: "Conversation",
    PRECHAT_DISPLAY_EVERY_SESSION: "Session",
    SUPPORTED_PRECHAT_FORM_FIELDS: {
        TEXT: "Text",
        EMAIL: "Email",
        NUMBER: "Number",
        PHONE: "Phone",
        CHECKBOX: "Checkbox",
        CHOICELIST: "ChoiceList"
    }
};

/**
 * Messaging app's client-side constants.
 * @type {Object}
 */
export const CLIENT_CONSTANTS = {
    TYPING_INDICATOR_DISPLAY_TIMEOUT: 5000
};