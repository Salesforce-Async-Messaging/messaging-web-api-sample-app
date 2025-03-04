import "./textMessage.css";
import { useState, useEffect } from "react";
import * as ConversationEntryUtil from "../helpers/conversationEntryUtil";
import { util } from "../helpers/common";

export default function TextMessage({conversationEntry}) {
    // Initialize acknowledgement status.
    let [isSent, setIsSent] = useState(false);
    let [isDelivered, setIsDelivered] = useState(false);
    let [isRead, setIsRead] = useState(false);
    let [acknowledgementTimestamp, setAcknowledgementTimestamp] = useState('');

    useEffect(() => {
        if (conversationEntry.isRead) {
            setIsRead(conversationEntry.isRead);
            setAcknowledgementTimestamp(conversationEntry.readAcknowledgementTimestamp);
        } else if (conversationEntry.isDelivered) {
            setIsDelivered(conversationEntry.isDelivered);
            setAcknowledgementTimestamp(conversationEntry.deliveryAcknowledgementTimestamp);
        } else if (conversationEntry.isSent) {
            setIsSent(conversationEntry.isSent);
            setAcknowledgementTimestamp(conversationEntry.transcriptedTimestamp);
        }
    }, [conversationEntry]);

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

    /**
     * Generates text content with the message acknowledgement infomation.
     * @returns {string}
     */
    function generateMessageAcknowledgementContentText() {
        const formattedAcknowledgementTimestamp = util.getFormattedTime(acknowledgementTimestamp);

        if (conversationEntry.isEndUserMessage) {
            if (isRead) {
                return `Read at ${formattedAcknowledgementTimestamp} • `;
            } else if (isDelivered) {
                return `Delivered at ${formattedAcknowledgementTimestamp} • `;
            } else if (isSent) {
                return `Sent • `;
            } else {
                return ``;
            }
        }
    }

    return (
        <>
            <div className={generateMessageBubbleContainerClassName()} style={!conversationEntry.isEndUserMessage?{ display: "flex", width: "max-content"}:{}}>
                <div style={ !conversationEntry.isEndUserMessage?{display: "flex",justifyContent: "center",alignItems: "flex-end"}:{}}>
                <span style={{marginRight:"2px"}}>{!conversationEntry.isEndUserMessage?"🤖":""}</span> 
                <div className={generateMessageBubbleClassName()}>
                    <p className={generateMessageContentClassName()}>{ConversationEntryUtil.getTextMessageContent(conversationEntry)}</p>
                </div>
                </div>
            </div>
            <p className={generateMessageSenderContentClassName()}>{generateMessageAcknowledgementContentText()}{generateMessageSenderContentText()}</p>
        </>
    );
}