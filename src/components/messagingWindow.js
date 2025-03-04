import { useState } from "react";

import "./messagingWindow.css";

// Import children components to render.
import Conversation from "../components/conversation";

export default function MessagingWindow(props) {
    let [uiReady, setUIReady] = useState(false);

    /**
     * Sets the app's ui ready status based on the communication from the child Conversation component..
     * Propogates the same upto the parent BootstrapMessaging component for Messaging Button reactive ui updates.
     * @param {boolean}
     */
    function setAppUIReady(isUIReady) {
        setUIReady(isUIReady);
        props.deactivateMessagingButton(isUIReady);
    }

    /**
     * Generates a classname for the parent div that holds the messaging window ui.
     * Hides the parent div if the app is not ui ready.
     * @returns {string}
     */
    function generateMessagingWindowClassName() {
        const className = "messagingWindow";

        return className + `${uiReady ? "" : " hide"}`;
    }

    return(
        <>
        {!uiReady && props?.getLoadingState()}
      <div className={generateMessagingWindowClassName()}>
            <Conversation
                isExistingConversation={props.isExistingConversation}
                showMessagingWindow={props.showMessagingWindow}
                uiReady={setAppUIReady}
                reInitializeMessagingClient={props.reInitializeMessagingClient}
            />
        </div>
        </>
    );
}