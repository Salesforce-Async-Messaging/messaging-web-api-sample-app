import React, { useState } from 'react';

import "./messagingInputFooter.css";
import { VscSend } from "react-icons/vsc";
import CountdownTimer from "../helpers/countdownTimer";
import { util } from "../helpers/common";
import { CONVERSATION_CONSTANTS, CLIENT_CONSTANTS } from '../helpers/constants';
import { getConversationId } from '../services/dataProvider';

export default React.forwardRef(function MessagingInputFooter(props, ref) {
    const { handleFileChange, handleUpload, fileName, previewFile, discardFile } = props || {};
    // Initialize the Textarea value to empty.
    let [textareaContent, setTextareaContent] = useState('');

    // Initialize whether end user is actively typing. 
    // This holds a reference to a CountdownTimer object.
    let [typingIndicatorTimer, setTypingIndicatorTimer] = useState(undefined);

    /**
     * Handle 'change' event in Textarea to reactively update the Textarea value.
     * @param {object} event
     */
    function handleTextareaContentChange(event) {
        if (event && event.target && typeof event.target.value === "string") {
            setTextareaContent(event.target.value);
        }

        // Handle when end user is actively typing.
        if (textareaContent !== "" && textareaContent.length !== 0) {
            // If the end user has typed within the last 5 seconds, reset the timer for another 5 seconds.
            // Otherwise, send a new started typing indicator and start a new countdown.
            if (typingIndicatorTimer) {
                typingIndicatorTimer.reset(Date.now());
            } else {
                handleSendTypingIndicator(CONVERSATION_CONSTANTS.EntryTypes.TYPING_STARTED_INDICATOR);
                typingIndicatorTimer = new CountdownTimer(() => {
                    handleSendTypingIndicator(CONVERSATION_CONSTANTS.EntryTypes.TYPING_STOPPED_INDICATOR);
                    typingIndicatorTimer = undefined;
                }, CLIENT_CONSTANTS.TYPING_INDICATOR_DISPLAY_TIMEOUT, Date.now());
                typingIndicatorTimer.start();
            }
        }
    }

    /**
     * Handle 'key' event in Textarea. If the key is 'Enter', send a message.
     * @param {object} event
     */
    function handleTextareaKeyChange(event) {
        if (event.key === "Enter" && !event.altKey) {
            event.preventDefault();

            handleSendButtonClick();
        }
    }

    /**
     * Handle 'click' event in Textarea to put focus on Textarea.
     * @param {object} event
     */
    function handleTextareaClick(event) {
        if (event) {
            event.target.focus();
        }
    }

    /**
     * Clears the Textarea i.e. resets to empty.
     */
    function clearMessageContent() {
        setTextareaContent("");
    }

    /**
     * Determines whether to disable the Textarea.
     * TRUE - disables if the conversation is either closed or not started and FALSE - otherwise.
     */
    function shouldDisableTextarea() {
        return props.conversationStatus === CONVERSATION_CONSTANTS.ConversationStatus.CLOSED_CONVERSATION || props.conversationStatus === CONVERSATION_CONSTANTS.ConversationStatus.NOT_STARTED_CONVERSATION;
    }

    /**
     * Determines whether to disable the Send Button.
     * TRUE - disables if the Textarea is either empty or if the conversation is not open and FALSE - otherwise.
     */
    function shouldDisableSendButton(isFile) {
        if(fileName){
        return !previewFile?.[fileName]
        }else{
        return textareaContent.trim().length === 0 || props.conversationStatus !== CONVERSATION_CONSTANTS.ConversationStatus.OPENED_CONVERSATION;
        }
    }

    /**
     * Handle Send Button click. If the Button is enabled, send a message.
     */
    function handleSendButtonClick() {
        if(fileName && previewFile?.[fileName]){
            handleUpload(textareaContent)
        }else{
        handleSendMessage();
        }
        clearMessageContent();

    }

    /**
     * Handle sending a text message by generating a new unique message-id and invoke the parent's handler to send a message with the typed text.
     */
    function handleSendMessage() {
        // Required parameters.
        const conversationId = getConversationId();
        const messageId = util.generateUUID();
        const value = textareaContent;
        // Optional parameters.
        let inReplyToMessageId;
        let isNewMessagingSession;
        let routingAttributes;
        let language;

        props.sendTextMessage(conversationId, value, messageId, inReplyToMessageId, isNewMessagingSession, routingAttributes, language)
            .then(() => {
                // Clear textarea value.
                clearMessageContent();
            });
    }

    /**
     * Handle calling a sendTypingIndicator when the timer fires with started/stopped indicator.
     * @param {string} typingIndicator - whether to send a typing started or stopped indicator.
     */
    function handleSendTypingIndicator(typingIndicator) {
        const conversationId = getConversationId();

        props.sendTypingIndicator(conversationId, typingIndicator)
            .then(() => {
            })
            .catch(error => {
            });
    }

    return (
        <div className="messagingFooter">
            <div className='addMediaConatiner'>
                <div className='addMedia'>
                    <input type="file" id="fileInput" className="hidden" onChange={handleFileChange} style={{ display: 'none' }} ref={ref} />

                    <label htmlFor="fileInput" className='fileInputLabel'>
                        +
                    </label>
                </div>
            </div>
            {fileName && previewFile?.[fileName] && <div style={{ position: "relative", marginLeft:"5px"}}>
                <img src={previewFile?.[fileName] || ""}
                    width={50} height={50} style={{ border: "1px solid black" }} />
                <div style={{
                    position: "absolute", right: -5, top: -5, background: "red", width: 15, height: 15, fontSize: "smaller",
                    backgroundColor: "black",
                    borderRadius: 15,
                    fontSize: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }} onClick={() => discardFile(fileName)}>X</div>
            </div>}

            <textarea className="messagingInputTextarea"
                placeholder="Type to send a message"
                value={textareaContent}
                onChange={handleTextareaContentChange}
                onKeyDown={handleTextareaKeyChange}
                onClick={handleTextareaClick}
                disabled={shouldDisableTextarea()} />


            <button className="sendButton"
                onClick={handleSendButtonClick}
                disabled={shouldDisableSendButton(previewFile?.[fileName])}
                >
                <VscSend className="sendButtonIcon" />
            </button>
        </div>
    );
})