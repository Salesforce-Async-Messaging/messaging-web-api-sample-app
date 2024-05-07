import "./messagingBody.css";
import ConversationEntry from "./conversationEntry";
import { util } from "../helpers/common";

export default function MessagingBody({ conversationEntries }) {
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
    function generateConversationStartTime() {
        if (conversationEntries.length) {
            const conversationStartTimestamp = conversationEntries[0].transcriptedTimestamp;
            const startDate = util.getFormattedDate(conversationStartTimestamp);
            const startTime = util.getFormattedTime(conversationStartTimestamp);
            const conversationStartTimeText = `Conversation started: ${startDate} at ${startTime}`;
            return conversationStartTimeText;
        }
        return "";
    }

    return (
        <div className="messagingBody">
            {conversationEntries.length > 0 && <p className="conversationStartTimeText">{generateConversationStartTime()}</p>}
            <ul className="conversationEntriesListView">
                {conversationEntriesListView}
            </ul>
        </div>
    );
}