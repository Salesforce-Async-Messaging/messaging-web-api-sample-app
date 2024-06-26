import { CONVERSATION_CONSTANTS } from "../helpers/constants";

import "./typingIndicator.css";

export default function TypingIndicator(props) {
    /**
     * Generates a classname for Typing Indicator metadata using list of active participants.
     * @returns {string}
     */
    function getTypingIndicatorText() {
        if (props.typingParticipants) {
            const nameList = Object.keys(props.typingParticipants);

            if (props.typingParticipants.length > 1) {
                return `Multiple people are typing`;
            } else if (props.typingParticipants[nameList[0]].role === CONVERSATION_CONSTANTS.ParticipantRoles.AGENT || props.typingParticipants[nameList[0]].role === CONVERSATION_CONSTANTS.ParticipantRoles.CHATBOT) {
                return `${nameList[0]} is typing`;
            }
        }

        return '';
    }

    return (
        <>
            <div className="typingIndicatorContainer">
                <div className="typingIndicatorBubbleContainer">
                    <div className="typingIndicatorBubble">
                        <span className="loadingBall first"></span>
                        <span className="loadingBall second"></span>
                        <span className="loadingBall third"></span>
                    </div>
                </div>
                <p className="typingIndicatorSenderContent">{getTypingIndicatorText()}</p>
            </div>
        </>
    );
}