"use client";

import { useState } from "react";

// Import children components to render.
import MessagingWindow from "./components/messagingWindow";
import MessagingButton from "./components/messagingButton";

import './bootstrapMessaging.css';

import { setOrganizationId, setDeploymentDeveloperName, setSalesforceMessagingUrl, setDeploymentConfiguration, setLastEventId, setJwt } from './services/dataProvider';
import { getUnauthenticatedAccessToken, createConversation } from './services/messagingService';
import { initializeWebStorage, setItemInWebStorage, clearWebStorage } from './helpers/webstorageUtils';
import { APP_CONSTANTS, STORAGE_KEYS } from './helpers/constants';
import { util } from "./helpers/common";

import Draggable from "./ui-effects/draggable";

export default function BootstrapMessaging() {
    let [shouldShowMessagingButton, setShowMessagingButton] = useState(false);
    let [orgId, setOrgId] = useState('');
    let [deploymentDevName, setDeploymentDevName] = useState('');
    let [messagingURL, setMessagingURL] = useState('');
    let [conversationId, setConversationId] = useState(undefined);
    let [shouldDisableMessagingButton, setShouldDisableMessagingButton] = useState(false);
    let [shouldShowMessagingWindow, setShouldShowMessagingWindow] = useState(false);
    let [showMessagingButtonSpinner, setShowMessagingButtonSpinner] = useState(false);

    /**
     * Initialize the messaging client by
     * 1. internally initializing the Embedded Service deployment paramaters in-memory.
     * 2. initializing Salesforce Organization Id in the browser web storage.
     * 3. generate a new unique conversation-id and initialize in-memory.
     */
    function initializeMessagingClient() {
        // Initialize helpers.
        setOrganizationId(orgId);
        setDeploymentDeveloperName(deploymentDevName);
        setSalesforceMessagingUrl(messagingURL);
        initializeWebStorage(orgId);

        // Initialize a new unique conversation-id in-memory.
        setConversationId(util.generateUUID());
    }

    /**
     * Validates whether the supplied string is a valid Salesforce Organization Id.
     * @returns {boolean}
     */
    function isValidOrganizationId(id) {
        return typeof id === "string" && (id.length === 18 || id.length === 15) && id.substring(0, 3) === APP_CONSTANTS.ORGANIZATION_ID_PREFIX;
    }

    /**
     * Validates whether the supplied string is a valid Salesforce Embedded Service Deployment Developer Name.
     * @returns {boolean}
     */
    function isValidDeploymentDeveloperName(name) {
        return typeof name === "string" && name.length > 0;
    }

    /**
     * Determines whether the supplied url is a Salesforce Url.
     * @returns {boolean}
     */
    function isSalesforceUrl(url) {
        try {
            return typeof url === "string" && url.length > 0 && url.slice(-19) === APP_CONSTANTS.SALESFORCE_MESSAGING_SCRT_URL;
        } catch (err) {
            console.error(`Something went wrong in validating whether the url is a Salesforce url: ${err}`);
            return false;
        }
    }

    /**
     * Validates whether the supplied string has a valid protocol and is a Salesforce Url.
     * @returns {boolean}
     */
    function isValidUrl(url) {
        try {
            const urlToValidate = new URL(url);
            return isSalesforceUrl(url) && urlToValidate.protocol === APP_CONSTANTS.HTTPS_PROTOCOL;
        } catch (err) {
            console.error(`Something went wrong in validating the url provided: ${err}`);
            return false;
        }
    }

    /**
     * Handle a click action from the Deployment-Details-Form Submit Button. If the inputted parameters are valid, initialize the Messaging Client and render the Messaging Button.
     * @param {object} evt - button click event
     */
    function handleDeploymentDetailsFormSubmit(evt) {
        if (evt) {
            if(!isValidOrganizationId(orgId)) {
                alert(`Invalid OrganizationId Input Value: ${orgId}`);
                setShowMessagingButton(false);
                return;
            }
		    if(!isValidDeploymentDeveloperName(deploymentDevName)) {
                alert(`Expected a valid Embedded Service Deployment Developer Name value to be a string but received: ${deploymentDevName}.`);
                setShowMessagingButton(false);
                return;
            }
		    if(!isValidUrl(messagingURL)) {
                alert(`Expected a valid Salesforce Messaging URL value to be a string but received: ${messagingURL}.`);
                setShowMessagingButton(false);
                return;
            }

            // Initialize the Messaging Client.
            initializeMessagingClient();
            // Render the Messaging Button.
            setShowMessagingButton(true);
        }
    }

    /**
     * Determines whether the Deployment-Details-Form Submit Button should be enabled/disabled.
     * @returns {boolean} TRUE - disabled the button and FALSE - otherwise
     */
    function shouldDisableFormSubmitButton() {
        return orgId.length === 0 || deploymentDevName.length === 0 || messagingURL.length === 0;
    }

    /**
     * Parse the unauthenticatedAccessToken REST endpoint response and initialize the
     * 1. Salesforce AccessToken(JWT) in-memory and Browser Web Storage.
     * 2. Last Event Id in-memory. The Id is used to help establish connections to server-sent events (SSE) to receive messages and events from the server.
     * 3. Embedded Service Deployment configuration settings im-memory.
     * @param {response|object}
     */
    function parseAccessTokenResponse(response) {
        if (typeof response === "object") {
            setJwt(response.accessToken);
            setItemInWebStorage(STORAGE_KEYS.JWT, response.accessToken);
            setLastEventId(response.lastEventId);
            setDeploymentConfiguration(response.context && response.context.configuration);
        }
    }

    /**
     * Handle a click action from the Messaging Button.
     * 1. Make a request to unauthenticatedAccessToken REST endpoint to get a Salesforce AccessToken(JWT), using which other Salesforce REST endpoint requests are made.
     * 2. If Salesforce AccessToken(JWT) is successfully retrieved, make a request to createConversation REST endpoint using the Salesforce JWT to create a new messaging conversation.
     * 3. If a conversation is created successfully, render the Messaging Window.
     * @param {object} evt - button click event
     */
    function handleMessagingButtonClick(evt) {
        if (evt) {
            console.log("Messaging Button clicked.");
            setShowMessagingButtonSpinner(true);

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
                    showMessagingWindow(true);
                    setShowMessagingButtonSpinner(false);
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

    /**
     * Determines whether to render the Messaging Window based on the supplied parameter.
     * TRUE - render the Messaging WINDOW and FALSE - Do not render the Messaging Window & Messaging Button
     * @param {object} evt - button click event
     */
    function showMessagingWindow(shouldShow) {
        setShouldShowMessagingWindow(Boolean(shouldShow));
        if (!shouldShow) {
            setShouldShowMessagingWindow(Boolean(shouldShow));
            // Enable Messaging Button again when Messaging Window is closed.
            setShouldDisableMessagingButton(false);
            // Hide Messaging Button to re-initialize the client with form submit.
            setShowMessagingButton(false);
        }
    }

    return (
        <>
            <h1>Messaging for Web - Sample App</h1>
            <div className="deploymentDetailsForm">
                <h4>Input your Embedded Service Custom Client-type deployment details below</h4>
                <label>Organization Id</label>
                <input
                    type="text"
                    value={orgId}
                    onChange={e => setOrgId(e.target.value.trim())}>
                </input>
                <label>Deployment Developer Name</label>
                <input
                    type="text"
                    value={deploymentDevName}
                    onChange={e => setDeploymentDevName(e.target.value.trim())}>
                </input>
                <label>Url</label>
                <input
                    type="text"
                    value={messagingURL}
                    onChange={e => setMessagingURL(e.target.value.trim())}>
                </input>
                <button
                    className="deploymentDetailsFormSubmitButton"
                    onClick={handleDeploymentDetailsFormSubmit}
                    disabled={shouldDisableFormSubmitButton()}
                >
                    Submit
                </button>
            </div>
            {shouldShowMessagingButton &&
                <MessagingButton
                    clickHandler={handleMessagingButtonClick}
                    disableButton={shouldDisableMessagingButton}
                    showSpinner={showMessagingButtonSpinner} />}
            {shouldShowMessagingWindow &&
                <Draggable intitialPosition={{ x: 1000, y: 500 }}>
                    <MessagingWindow
                        conversationId={conversationId}
                        showMessagingWindow={showMessagingWindow} />
                </Draggable>
            }
        </>
    );
}