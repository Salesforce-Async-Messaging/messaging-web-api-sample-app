import { useEffect } from "react";
import "./messagingBody.css";
import { util } from "../helpers/common";
import { CONVERSATION_CONSTANTS } from "../helpers/constants";

// Import children components to plug in and render.
import ConversationEntry from "./conversationEntry";

export default function MessagingBody({ conversationEntries, conversationStatus }) {

    useEffect(() => {
        if (conversationStatus === CONVERSATION_CONSTANTS.ConversationStatus.CLOSED_CONVERSATION) {
            // Render conversation closed message.
        }
    }, [conversationStatus]);

    /**
     * Builds a list of conversation entries where each conversation-entry represents an object of type defined in constants#CONVERSATION_CONSTANTS.EntryTypes.
     * @returns {string}
     */
    const conversationEntriesListView = conversationEntries.map(conversationEntry =>
        <ConversationEntry
            key={conversationEntry.messageId} 
            conversationEntry={conversationEntry} />
    );

    /**
     * Generates a text with conversation start date and time.
     * @returns {string}
     */
    function generateConversationStartTimeText() {
        if (conversationEntries.length) {
            const conversationStartTimestamp = conversationEntries[0].transcriptedTimestamp;
            const startDate = util.getFormattedDate(conversationStartTimestamp);
            const startTime = util.getFormattedTime(conversationStartTimestamp);
            const conversationStartTimeText = `Conversation started: ${startDate} at ${startTime}`;
            return conversationStartTimeText;
        }
        return "";
    }

    /**
     * Generates a text with conversation end date and time.
     * @returns {string}
     */
    function generateConversationEndTimeText() {
        const conversationEndTimestamp = Date.now();
        const endDate = util.getFormattedDate(conversationEndTimestamp);
        const endTime = util.getFormattedTime(conversationEndTimestamp);
        const conversationEndTimeText = `Conversation ended: ${endDate} at ${endTime}`;

        return conversationEndTimeText;
    }

    return (
        <div className="messagingBody">
            {conversationEntries.length > 0 && <p className="conversationStartTimeText">{generateConversationStartTimeText()}</p>}
            <ul className="conversationEntriesListView">
                {conversationEntriesListView}
            </ul>
            {conversationStatus === CONVERSATION_CONSTANTS.ConversationStatus.CLOSED_CONVERSATION && <p className="conversationEndTimeText">{generateConversationEndTimeText()}</p>}
        </div>
    );
}