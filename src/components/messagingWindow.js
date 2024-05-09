import "./messagingWindow.css";
import Conversation from "./conversation";

export default function MessagingWindow({ conversationId }) {

    return(
        <div className="messagingWindow">
            <Conversation conversationId={conversationId} />
        </div>
    );
}