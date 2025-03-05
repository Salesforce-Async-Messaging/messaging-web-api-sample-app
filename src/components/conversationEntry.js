import "./conversationEntry.css";
import * as ConversationEntryUtil from "../helpers/conversationEntryUtil";

// Import children components to plug in and render.
import TextMessage from "./textMessage";
import ChoiceMessage from "./choiceMessage";
import ParticipantChange from "./participantChange";
import MediaMessage from "./mediaMessage";

export default function ConversationEntry(props={}) {
    const {conversationEntry,previewFile} = props;

    return (
        <>
            <div className="conversationEntryContainer">
                {/* Render component for a conversation entry of type Text Message. */}
                {ConversationEntryUtil.isTextMessage(conversationEntry) && <TextMessage conversationEntry={conversationEntry} />}
                {
                    ConversationEntryUtil.isChoicesMessage(conversationEntry) && 
                    <ChoiceMessage conversationEntry={conversationEntry} sendTextMessage={props?.sendTextMessage} />
                }
                {
                    ConversationEntryUtil.isMediaMessage(conversationEntry) && 
                    <MediaMessage conversationEntry={conversationEntry} sendTextMessage={props?.sendTextMessage} previewFile={previewFile} />
                }
                {/* Render component for a conversation entry of type Participant Change. */}
                {ConversationEntryUtil.isParticipantChangeEvent(conversationEntry) && <ParticipantChange conversationEntry={conversationEntry} />}
            </div>
        </>
    );
}