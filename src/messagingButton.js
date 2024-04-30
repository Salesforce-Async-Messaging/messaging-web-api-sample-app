"use client";

import { useState } from 'react';
import './messagingButton.css';
import getConfigurationData from './messagingService';
 
export default function MessagingButton() {

    let [shouldDisableMessagingButton, setShouldDisableMessagingButton] = useState(true);

    getConfigurationData().then(() => {
        setShouldDisableMessagingButton(false);
    });

    function handleMessagingButtonClick(evt) {
        if (evt) {
            console.log("Messaging Button clicked.");
        }
    }
    
    return <button
                className="messagingButton"
                onClick={handleMessagingButtonClick}
                disabled={shouldDisableMessagingButton}>
                    Let's Chat
            </button>;
}