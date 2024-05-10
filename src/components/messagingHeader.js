import "./messagingHeader.css";
import { FaCircleXmark } from "react-icons/fa6";

import { CONVERSATION_CONSTANTS } from "../helpers/constants";

export default function MessagingHeader(props) {
    /**
     * Handle Close ('X') button click based on the current conversation status.
     * If the conversation is open, invoke the parent's handlers to end the current conversation.
     * If the conversation is either closed or not yet started, invoke the parent's handler to close the messaging window.
     * @param {object} evt - click event from the Close ('X') button
     */
    function handleCloseButtonClick(evt) {
        if (evt) {
            if (props.conversationStatus === CONVERSATION_CONSTANTS.ConversationStatus.OPENED_CONVERSATION) {
                // End the conversation if it is currently opened.
                props.endConversation();
            } else if (props.conversationStatus === CONVERSATION_CONSTANTS.ConversationStatus.CLOSED_CONVERSATION || props.conversationStatus === CONVERSATION_CONSTANTS.ConversationStatus.NOT_STARTED_CONVERSATION) {
                // Close the messaging window if the conversation is in closed state or not yet started.
                props.closeMessagingWindow();
            }
        }
    }

    /**
     * Generates a title text for the header Close ('X') button based on the current conversation status.
     * @returns {string}
     */
    function generateCloseButtonTitle() {
        return `${props.conversationStatus === CONVERSATION_CONSTANTS.ConversationStatus.OPENED_CONVERSATION ? `End conversation` : `Close window`}`;
    }

    return (
        <div className="messagingHeader">
            <button
                className="messagingHeaderCloseButton"
                title={generateCloseButtonTitle()}
                onClick={handleCloseButtonClick}>
                <FaCircleXmark className="messagingHeaderCloseButtonIcon"/>
            </button>
        </div>
    )
}