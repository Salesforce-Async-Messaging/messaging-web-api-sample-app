import "./messagingBody.css";
import ConversationEntry from "./conversationEntry";
import { util } from "../helpers/common";

export default function MessagingBody({ conversationEntries }) {
    const conversationEntriesListView = conversationEntries.map(conversationEntry =>
        <ConversationEntry
            key={conversationEntry.messageId} 
            conversationEntry={conversationEntry} />
    );

    function generateConversationStartTime() {
        if (conversationEntries.length) {
            const conversationStartTimestamp = conversationEntries[0].transcriptedTimestamp;
            const conversationStartFormattedDatetime = util.formatDateTime(conversationStartTimestamp);
            const formattedText = `${conversationStartFormattedDatetime.split(",")[0]} at ${conversationStartFormattedDatetime.split(",")[1].trim()}`;
            return formattedText;
        }
        return undefined;
    }

    return (
        <div className="messagingBody">
            {conversationEntries.length > 0 && <p className="conversationStartTimeText">{generateConversationStartTime()}</p>}
            <ul className="conversationEntriesListView">
                {conversationEntriesListView}
            </ul>
        </div>
    );
}