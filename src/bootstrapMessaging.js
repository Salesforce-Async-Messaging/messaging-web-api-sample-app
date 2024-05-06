"use client";

import { useState } from "react";
import './bootstrapMessaging.css';
import MessagingButton from "./components/messagingButton";
import { getUnauthenticatedAccessToken, createConversation, closeConversation } from './services/messagingService';
import { setOrganizationId, setDeploymentDeveloperName, setScrt2Url, setDeploymentConfiguration, setLastEventId, setJwt } from './services/dataProvider';
import { initializeWebStorage, setItemInWebStorage, clearWebStorage } from './helpers/webstorageUtils';
import { STORAGE_KEYS } from './helpers/constants';
import { util } from "./helpers/common";
import MessagingWindow from "./components/messagingWindow";
import Draggable from "./ui-effects/draggable";

export default function BootstrapMessaging() {
    let [shouldShowMessagingButton, setShowMessagingButton] = useState(true);
    let [orgId, setOrgId] = useState('');
    let [deploymentDevName, setDeploymentDevName] = useState('');
    let [scrt2URL, setSCRT2URL] = useState('');
    let [shouldDisableMessagingButton, setShouldDisableMessagingButton] = useState(false);
    let [conversationId, setConversationId] = useState(undefined);
    let [shouldShowMessagingWindow, setShouldShowMessagingWindow] = useState(false);

    function initializeMessagingClient() {
        // Initialize helpers.
        // Store the Org Id in-memory for other components to use.
        setOrganizationId(orgId);
        // Store the Deployment Developer Name in-memory for other components to use.
        setDeploymentDeveloperName(deploymentDevName);
        // Store the SCRT2 Url for other components to use.
        setScrt2Url(scrt2URL);
        // Initialize Web Storage.
        initializeWebStorage(orgId);
        // Initialize a new conversation-id.
        setConversationId(util.generateUUID());
    }

    function handleDeploymentDetailsFormSubmit(evt) {
        if (evt) {
            if(typeof orgId !== "string" || orgId.length !== 15 || !orgId.includes("00D")) {
                alert(`Invalid OrganizationId Input Value: ${orgId}`);
                setShowMessagingButton(false);
                return;
            }
		    if(typeof deploymentDevName !== "string" || !deploymentDevName.length) {
                alert(`Expected a valid ESW Config Dev Name value to be a string but received: ${deploymentDevName}.`);
                setShowMessagingButton(false);
                return;
            }
		    if(typeof scrt2URL !== "string" || !scrt2URL.length || !scrt2URL.includes("https://")) {
                alert(`Expected a valid SCRT 2.0 URL value to be a string but received: ${scrt2URL}.`);
                setShowMessagingButton(false);
                return;
            }

            initializeMessagingClient();
            setShowMessagingButton(true);
        }
    }

    function shouldDisableFormSubmitButton() {
        // TODO: add more validtations around individual inputs below.
        return orgId.length === 0 || deploymentDevName.length === 0 || scrt2URL.length === 0;
    }

    function parseAccessTokenResponse(response) {
        if (typeof response === "object") {
            setJwt(response.accessToken);
            setItemInWebStorage(STORAGE_KEYS.JWT, response.accessToken);
            setLastEventId(response.lastEventId);
            setDeploymentConfiguration(response.context && response.context.configuration);
        }
    }

    function handleMessagingButtonClick(evt) {
        if (evt) {
            console.log("Messaging Button clicked.");

            getUnauthenticatedAccessToken()
            .then((response) => {
                console.log("Successfully fetched an Unautheticated access token.");
                // Disable Messaging Button once an access-token (JWT) is retrieved.
                setShouldDisableMessagingButton(true);
                // Parse the response object which includes access-token (JWT), configutation data.
                parseAccessTokenResponse(response);

                createConversation(conversationId)
                .then(() => {
                    console.log(`Successfully created a new conversation with conversation-id: ${conversationId}`);
                    setShouldShowMessagingWindow(true);
                })
                .catch((err) => {
                    console.error(`Something went wrong in creating a new conversation with conversation-id: ${conversationId}. ${err}`);
                    clearWebStorage();
                });
            })
            .catch((err) => {
                console.error(`Something went wrong in fetching an Unauthenticated access token: ${err}`);
                clearWebStorage();
            });
        }
    }

    function handleEndConversation(evt) {
        if (evt) {
            closeConversation(conversationId)
            .then(() => {
                console.log(`Successfully closed the conversation with conversation-id: ${conversationId}`);
                clearWebStorage();
            })
            .catch((err) => {
                console.error(`Something went wrong in closing the conversation with conversation-id: ${err}`);
                clearWebStorage();
            });
        }
    }

    return (
        <>
            <div className="deploymentDetailsForm">
                <h3>Input your Embedded Service API-type deployment details below</h3>
                <label>Org Id</label>
                <input
                    type="text"
                    // value={orgId}
                    defaultValue="00DSG000001NruH"
                    onChange={e => setOrgId(e.target.value.trim())}>
                </input>
                <label>Deployment Developer Name</label>
                <input
                    type="text"
                    // value={deploymentDevName}
                    defaultValue="Web1"
                    onChange={e => setDeploymentDevName(e.target.value.trim())}>
                </input>
                <label>SCRT2 Url</label>
                <input
                    type="text"
                    // value={scrt2URL}
                    defaultValue="https://sachinsdb6.test1.my.pc-rnd.salesforce-scrt.com"
                    onChange={e => setSCRT2URL(e.target.value.trim())}>
                </input>
                <button
                    className="deploymentDetailsFormSubmitButton"
                    onClick={handleDeploymentDetailsFormSubmit}
                    // disabled={shouldDisableFormSubmitButton()}
                >
                    Submit
                </button>
            </div>
            {shouldShowMessagingButton &&
                <MessagingButton
                    clickHandler={handleMessagingButtonClick}
                    disableButton={shouldDisableMessagingButton} />}
            {shouldShowMessagingWindow &&
                <Draggable intitialPosition={{ x: 1000, y: 500 }}>
                    <MessagingWindow conversationId={conversationId} />
                </Draggable>
            }
            <button onClick={handleEndConversation}>End Conversation</button>
        </>
    );
}