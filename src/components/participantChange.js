import "./participantChange.css";
import * as ConversationEntryUtil from "../helpers/conversationEntryUtil";
import { util } from "../helpers/common";

export default function ParticipantChange({conversationEntry}) {
    /**
     * Generates a text with the participant change operation infomation.
     * @returns {string}
     */
    function generateParticipantChangeText() {
        const participantName = ConversationEntryUtil.getParticipantChangeEventPartcipantName(conversationEntry);
        const hasParticipantJoined = ConversationEntryUtil.hasParticipantJoined(conversationEntry);
        const formattedTime = util.getFormattedTime(conversationEntry.transcriptedTimestamp);
        const participantChangeText = `${participantName} ${hasParticipantJoined ? `has joined` : `left`} at ${formattedTime}`;

        return participantChangeText;
    }

    return (
        <div className="container">
        <div className="line"></div>
        <p className="participantChangeText">{conversationEntry?.isEndUserMessage?"":"🤖"} {generateParticipantChangeText()}</p>
        <div className="line"></div>
       </div>
    );
}