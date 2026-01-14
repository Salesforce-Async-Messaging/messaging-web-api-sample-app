import "./choiceMessage.css";
import { useState, useEffect } from "react";
import * as ConversationEntryUtil from "../helpers/conversationEntryUtil";
import { util } from "../helpers/common";
import { getConversationId } from '../services/dataProvider';

export default function MediaMessage(props={}) {
    const { conversationEntry, previewFile } = props
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

    const handleSendMessage = (data) => {
        // Required parameters.
        const conversationId = getConversationId();
        const messageId = util.generateUUID();
        const value = data;
        // Optional parameters.
        let inReplyToMessageId;
        let isNewMessagingSession;
        let routingAttributes;
        let language;

        props.sendTextMessage(conversationId, value, messageId, inReplyToMessageId, isNewMessagingSession, routingAttributes, language)
            .then(() => {
            });
    }
    
    return (
        <>
            

            <div className={generateMessageBubbleContainerClassName()} style={{display:'flex', flexDirection:"column", alignItems:"flex-end"}}>
                <div>
                {previewFile && <img src={previewFile?.[conversationEntry?.content?.staticContent?.attachments?.[0].name]} width={100}/>}
                |<br/>
                   {conversationEntry?.content?.staticContent?.text &&   <div className={generateMessageBubbleClassName()} >
                    <p className={generateMessageContentClassName()}>
                    {conversationEntry?.content?.staticContent?.text}
                    </p>
                </div>}
                </div>
         
            </div>
            <p className={generateMessageSenderContentClassName()}>{generateMessageAcknowledgementContentText()}{generateMessageSenderContentText()}</p>
        </>
    );
}