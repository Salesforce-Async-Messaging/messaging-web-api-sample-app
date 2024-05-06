import "./participantChange.css";
import * as ConversationEntryUtil from "../helpers/conversationEntryUtil";
import { util } from "../helpers/common";

export default function ParticipantChange({conversationEntry}) {
    function generateParticipantChangeText() {
        const participantName = ConversationEntryUtil.getParticipantChangeEventPartcipantName(conversationEntry);
        const hasParticipantJoined = ConversationEntryUtil.hasParticipantJoined(conversationEntry);
        const fullStyleFormattedDateTime = util.formatDateTime(conversationEntry.transcriptedTimestamp);
        const formattedTime = fullStyleFormattedDateTime.split(",")[1].trim();
        const participantChangeText = `${participantName} ${hasParticipantJoined ? `joined` : `left`} at ${formattedTime}`;

        return participantChangeText;
    }

    return (
        <p className="participantChangeText">{generateParticipantChangeText()}</p>
    );
}