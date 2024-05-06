import "./participantChange.css";
import * as ConversationEntryUtil from "../helpers/conversationEntryUtil";

export default function ParticipantChange({conversationEntry}) {
    function generateParticipantChangeText() {
        const participantName = ConversationEntryUtil.getParticipantChangeEventPartcipantName(conversationEntry);
        const participantJoined = ConversationEntryUtil.hasParticipantJoined(conversationEntry);
        const participantChangeText = `${participantName} ${participantJoined ? `joined` : `left`}`;

        return participantChangeText;
    }

    return (
        <p className="participantChangeText">{generateParticipantChangeText()}</p>
    );
}