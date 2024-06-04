import { useState } from "react";

import "./messagingWindow.css";

// Import children components to render.
import Conversation from "../components/conversation";

export default function MessagingWindow(props) {
    let [uiReady, setUIReady] = useState(false);

    function setAppUIReady(isUIReady) {
        setUIReady(isUIReady);
        props.deactivateMessagingButton(isUIReady);
    }

    function generateMessagingWindowClassName() {
        const className = "messagingWindow";

        return className + `${uiReady ? "" : " hide"}`;
    }

    return(
        <div className={generateMessagingWindowClassName()}>
            <Conversation
                isExistingConversation={props.isExistingConversation}
                showMessagingWindow={props.showMessagingWindow}
                uiReady={setAppUIReady} />
        </div>
    );
}