import { useState } from 'react';

import "./messagingInputFooter.css";

import { sendTextMessage } from '../services/messagingService';
import { util } from "../helpers/common";

export default function MessagingInputFooter(props) {
    const [textareaContent, setTextareaContent] = useState('');

    function handleTextareaContentChange(event) {
        if (event && event.target && event.target.value) {
            setTextareaContent(event.target.value);
        }
    }

    function handleTextareaKeyChange(event) {
        if (event.key === "Enter" && !event.altKey) {
            event.preventDefault();
            
            handleSendButtonClick();
        }
    }

    function clearMessageContent() {
        setTextareaContent("");
    }

    function shouldDisableSendButton() {
        return textareaContent.trim().length === 0;
    }

    function handleSendButtonClick() {
        if (!shouldDisableSendButton()) {
            handleSendMessage();
        }
    }

    function handleSendMessage() {
        // Required parameters.
        const conversationId = props.conversationId;
        const messageId = util.generateUUID();
        const value = textareaContent;
        // Optional parameters.
        let inReplyToMessageId;
        let isNewMessagingSession;
        let routingAttributes;
        let language;

        sendTextMessage(conversationId, value, messageId, inReplyToMessageId, isNewMessagingSession, routingAttributes, language)
            .then(() => {
                console.log(`Successfully sent message to conversation: ${conversationId}`);

                // Clear textarea value.
                clearMessageContent();
            })
            .catch(error => {
                console.error(`Something went wrong while sending message to conversation: ${error}`);
            });
    }

    return(
        <div className="messagingFooter">
            <textarea name="messagingInputTextarea" 
                placeholder="Type to send message"
                value={textareaContent}
                onChange={handleTextareaContentChange}
                onKeyDown={handleTextareaKeyChange}
                rows="2"/>
        
            <button className="sendButton"
                onClick={handleSendButtonClick}
                disabled={shouldDisableSendButton()}>Send</button>
        </div>
    );
}