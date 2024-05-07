import "./textMessage.css";
import * as ConversationEntryUtil from "../helpers/conversationEntryUtil";
import { util } from "../helpers/common";

export default function TextMessage({conversationEntry}) {
    /**
     * Generates a classname for Text Message metadata such as sender text.
     * @returns {string}
     */
    function generateMessageSenderContentClassName() {
        const className = `textMessageSenderContent ${conversationEntry.isEndUserMessage ? `outgoing` : `incoming`}`;

        return className;
    }

    /**
     * Generates a classname for Text Message bubble container.
     * @returns {string}
     */
    function generateMessageBubbleContainerClassName() {
        const className = `textMessageBubbleContainer`;

        return className;
    }

    /**
     * Generates a classname for Text Message bubble ui.
     * @returns {string}
     */
    function generateMessageBubbleClassName() {
        const className = `textMessageBubble ${conversationEntry.isEndUserMessage ? `outgoing` : `incoming`}`;

        return className;
    }

    /**
     * Generates a classname for Text Message content (i.e. actual text).
     * @returns {string}
     */
    function generateMessageContentClassName() {
        const className = `textMessageContent`;

        return className;
    }

    /**
     * Generates a text with the message sender infomation.
     * @returns {string}
     */
    function generateMessageSenderContentText() {
        const formattedTime = util.getFormattedTime(conversationEntry.transcriptedTimestamp);

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