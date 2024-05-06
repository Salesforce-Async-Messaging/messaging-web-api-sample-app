import "./conversationEntry.css";
import * as ConversationEntryUtil from "../helpers/conversationEntryUtil";
import ParticipantChange from "./participantChange";
import TextMessage from "./textMessage";

export default function ConversationEntry({conversationEntry}) {

    return (
        <>
            <div className="conversationEntryContainer">
                {ConversationEntryUtil.isTextMessage(conversationEntry) && <TextMessage conversationEntry={conversationEntry} />}
                {ConversationEntryUtil.isParticipantChangeEvent(conversationEntry) && <ParticipantChange conversationEntry={conversationEntry} />}
            </div>
        </>
    );
}