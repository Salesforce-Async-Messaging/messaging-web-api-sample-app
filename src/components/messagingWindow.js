import "./messagingWindow.css";

// Import children components to render.
import Conversation from "../components/conversation";

export default function MessagingWindow(props) {

    return(
        <div className="messagingWindow">
            <Conversation
                conversationId={props.conversationId}
                showMessagingWindow={props.showMessagingWindow} />
        </div>
    );
}