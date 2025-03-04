import { useEffect, useRef } from "react";
import "./messagingBody.css";
import { util } from "../helpers/common";
import { CONVERSATION_CONSTANTS } from "../helpers/constants";

// Import children components to plug in and render.
import ConversationEntry from "./conversationEntry";
import TypingIndicator from "./typingIndicator";

export default function MessagingBody({ conversationEntries, conversationStatus, typingParticipants, showTypingIndicator, sendTextMessage, previewFile }) {
    const chatEndRef = useRef(null);
    useEffect(() => {
        if (conversationStatus === CONVERSATION_CONSTANTS.ConversationStatus.CLOSED_CONVERSATION) {
            // Render conversation closed message.

            // Remove typing indicator.
            typingParticipants = [];
            showTypingIndicator = false;
        }
    }, [conversationStatus]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, [conversationEntries]);

    /**
     * Builds a list of conversation entries where each conversation-entry represents an object of type defined in constants#CONVERSATION_CONSTANTS.EntryTypes.
     * @returns {string}
     */
    const conversationEntriesListView = conversationEntries.map(conversationEntry =>
        <ConversationEntry
            key={conversationEntry.messageId}
            conversationEntry={conversationEntry}
            sendTextMessage={sendTextMessage}
            previewFile={previewFile}
        />
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
            const conversationStartTimeText = `${startDate} at ${startTime}`;
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
            <div className="topDiv"></div>
            {conversationEntries.length > 0 &&
                <div class="container">
                    <div class="line"></div>
                    <span class="text">{generateConversationStartTimeText()}</span>
                    <div class="line"></div>
                </div>
            }
            <ul className="conversationEntriesListView">
                {conversationEntriesListView}
            </ul>
            <div ref={chatEndRef} className="lastDiv"></div>
            {showTypingIndicator && <TypingIndicator typingParticipants={typingParticipants} />}
            {conversationStatus === CONVERSATION_CONSTANTS.ConversationStatus.CLOSED_CONVERSATION && <p className="conversationEndTimeText">{generateConversationEndTimeText()}</p>}
        </div>
    );
}