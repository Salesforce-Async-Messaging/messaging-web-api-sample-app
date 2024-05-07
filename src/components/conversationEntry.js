import "./conversationEntry.css";
import * as ConversationEntryUtil from "../helpers/conversationEntryUtil";
import ParticipantChange from "./participantChange";
import TextMessage from "./textMessage";

export default function ConversationEntry({conversationEntry}) {

    return (
        <>
            <div className="conversationEntryContainer">
                {/* Render component for a conversation entry of type Text Message. */}
                {ConversationEntryUtil.isTextMessage(conversationEntry) && <TextMessage conversationEntry={conversationEntry} />}
                {/* Render component for a conversation entry of type Participant Change. */}
                {ConversationEntryUtil.isParticipantChangeEvent(conversationEntry) && <ParticipantChange conversationEntry={conversationEntry} />}
            </div>
        </>
    );
}