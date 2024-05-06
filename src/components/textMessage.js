import "./textMessage.css";
import * as ConversationEntryUtil from "../helpers/conversationEntryUtil";
import { util } from "../helpers/common";

export default function TextMessage({conversationEntry}) {
    function generateMessageSenderContentClassName() {
        const className = `textMessageSenderContent ${conversationEntry.isEndUserMessage ? `outgoing` : `incoming`}`;

        return className;
    }

    function generateMessageBubbleContainerClassName() {
        const className = `textMessageBubbleContainer`;

        return className;
    }

    function generateMessageBubbleClassName() {
        const className = `textMessageBubble ${conversationEntry.isEndUserMessage ? `outgoing` : `incoming`}`;

        return className;
    }

    function generateMessageContentClassName() {
        const className = `textMessageContent`;

        return className;
    }

    function generateMessageSenderContentText() {
        const fullStyleFormattedDateTime = util.formatDateTime(conversationEntry.transcriptedTimestamp);
        const formattedTime = fullStyleFormattedDateTime.split(",")[1].trim();

        return `${conversationEntry.isEndUserMessage ? `You` : conversationEntry.actorName} at ${formattedTime}`;
    }

    return (
        <>
            <div className={generateMessageBubbleContainerClassName()}>
                <div className={generateMessageBubbleClassName()}>
                    <p className={generateMessageContentClassName()}>{ConversationEntryUtil.getTextMessageContent(conversationEntry)}</p>
                </div>
            </div>
            <p className={generateMessageSenderContentClassName()}>{generateMessageSenderContentText()}</p>
        </>
    );
}