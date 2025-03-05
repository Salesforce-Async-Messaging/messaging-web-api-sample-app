"use client";

import { useState, useEffect } from "react";
import {
    isEmpty
} from 'lodash'
// Import children components to render.
import MessagingWindow from "./components/messagingWindow";
import MessagingButton from "./components/messagingButton";

import './bootstrapMessaging.css';

import { storeOrganizationId, storeDeploymentDeveloperName, storeSalesforceMessagingUrl } from './services/dataProvider';
import { determineStorageType, initializeWebStorage, getItemInWebStorageByKey, getItemInPayloadByKey } from './helpers/webstorageUtils';
import { APP_CONSTANTS, STORAGE_KEYS } from './helpers/constants';

import Draggable from "./ui-effects/draggable";

export default function BootstrapMessaging() {
    let [shouldShowMessagingButton, setShowMessagingButton] = useState(false);
    let [orgId, setOrgId] = useState('');
    let [deploymentDevName, setDeploymentDevName] = useState('');
    let [messagingURL, setMessagingURL] = useState('');
    let [shouldDisableMessagingButton, setShouldDisableMessagingButton] = useState(false);
    let [shouldShowMessagingWindow, setShouldShowMessagingWindow] = useState(false);
    let [showMessagingButtonSpinner, setShowMessagingButtonSpinner] = useState(false);
    let [isExistingConversation, setIsExistingConversation] = useState(false);

    const getUrlParams = url => {
        const paramsData = url.match(/([^?=&]+)(=([^&]*))/g) || []
        // http://localhost:3000?orgId=00DNy0000000Hgn&devName=IOS_Mobile&url=https://bitkuber.my.salesforce-scrt.com
        const paramData = paramsData.reduce(
          (a, v) => ((a[v.slice(0, v.indexOf('='))] = v.slice(v.indexOf('=') + 1)), a),
          {}
        );
        if(!isEmpty(paramData?.orgId)) {
            setOrgId(paramData?.orgId)
        }
        if(!isEmpty(paramData?.devName)) {
            setDeploymentDevName(paramData?.devName)
        }
        if(!isEmpty(paramData?.url)) {
            setMessagingURL(paramData?.url)
        }
        handleDeploymentDetailsFormSubmit({})
        showMessagingWindow(true);
      }


    useEffect(() => {
        const storage = determineStorageType();
        if (!storage) {
            console.error(`Cannot initialize the app. Web storage is required for the app to function.`);
            return;
        }

        const messaging_webstorage_key = Object.keys(storage).filter(item => item.startsWith(APP_CONSTANTS.WEB_STORAGE_KEY))[0];

        if (messaging_webstorage_key) {
            const webStoragePayload = storage.getItem(messaging_webstorage_key);
            const orgId = getItemInPayloadByKey(webStoragePayload, STORAGE_KEYS.ORGANIZATION_ID);
            const deploymentDevName = getItemInPayloadByKey(webStoragePayload, STORAGE_KEYS.DEPLOYMENT_DEVELOPER_NAME);
            const messagingUrl = getItemInPayloadByKey(webStoragePayload, STORAGE_KEYS.MESSAGING_URL);

            if (!isValidOrganizationId(orgId)) {
                console.warn(`Invalid organization id exists in the web storage: ${orgId}. Cleaning up the invalid object from the web storage.`);
                storage.removeItem(messaging_webstorage_key);
                // New conversation.
                setIsExistingConversation(false);
                return;
            }
            
            // Re-Initialize state variables from the values in the web storage. This also re-populates app's deployment parameters input form fields with the previously entered data, in case of a messaging session continuation (e.g. page reload).
            setOrgId(orgId);
            setDeploymentDevName(deploymentDevName);
            setMessagingURL(messagingUrl);

            // Initialize messaging client.
            initializeMessagingClient(orgId, deploymentDevName, messagingUrl);

            const messagingJwt = getItemInWebStorageByKey(STORAGE_KEYS.JWT);
            if (messagingJwt) {
                // Existing conversation.
                setIsExistingConversation(true);
                setShowMessagingButton(true);
                setShouldDisableMessagingButton(true);
                setShouldShowMessagingWindow(true);
            } else {
                // New conversation.
                setIsExistingConversation(false);
            }
        } else {
            // New conversation.
            setIsExistingConversation(false);
        }

        return () => {
            showMessagingWindow(false);
        };
    }, []);

    useEffect(() => {
        getUrlParams(window.location.href)
    }, [window.location.href])

    /**
     * Initialize the messaging client by
     * 1. internally initializing the Embedded Service deployment paramaters in-memory.
     * 2. initializing Salesforce Organization Id in the browser web storage.
     */
    function initializeMessagingClient(ord_id, deployment_dev_name, messaging_url) {
        // Initialize helpers.
        initializeWebStorage(ord_id || orgId);
        storeOrganizationId(ord_id || orgId);
        storeDeploymentDeveloperName(deployment_dev_name || deploymentDevName);
        storeSalesforceMessagingUrl(messaging_url || messagingURL);
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
            // New conversation.
            setIsExistingConversation(false);
            // Render the Messaging Button.
            setShowMessagingButton(true);
        }
    }

    /**
     * Determines whether the Deployment-Details-Form Submit Button should be enabled/disabled.
     * @returns {boolean} TRUE - disabled the button and FALSE - otherwise
     */
    function shouldDisableFormSubmitButton() {
        return (orgId && orgId.length === 0) || (deploymentDevName && deploymentDevName.length === 0) || (messagingURL && messagingURL.length === 0);
    }

    /**
     * Handle a click action from the Messaging Button.
     * @param {object} evt - button click event
     */
    function handleMessagingButtonClick(evt) {
        if (evt) {
            setShowMessagingButtonSpinner(true);
            showMessagingWindow(true);
        }
    }

    /**
     * Determines whether to render the Messaging Window based on the supplied parameter.
     * @param {boolean} shouldShow - TRUE - render the Messaging WINDOW and FALSE - Do not render the Messaging Window & Messaging Button
     */
    function showMessagingWindow(shouldShow) {
        setShouldShowMessagingWindow(Boolean(shouldShow));
        if (!shouldShow) {
            // Enable Messaging Button again when Messaging Window is closed.
            setShouldDisableMessagingButton(false);
            // Remove the spinner on the Messaging Button.
            setShowMessagingButtonSpinner(false);
            // Hide Messaging Button to re-initialize the client with form submit.
            setShowMessagingButton(false);
        }
    }

    /**
     * Handles the app UI readiness i.e. Messaging Button updates based on whether the Messaging Window UI is rendered.
     * @param {boolean} isReady - TRUE - disable the Messaging Button & remove the spinner and FALSE - otherwise.
     */
    function appUiReady(isReady) {
        // Disable Messaging Button if the app is UI ready.
        setShouldDisableMessagingButton(isReady);
        // Remove the spinner on the Messaging Button if the app is UI ready.
        setShowMessagingButtonSpinner(!isReady);
    }

    return (
        <>
            {/* <h1>LOADING</h1> */}
            {/* <div className="deploymentDetailsForm">
                <h4>Input your Embedded Service (Custom Client) deployment details below</h4>
                <label>Organization ID</label>
                <input
                    type="text"
                    value={orgId || ""}
                    onChange={e => setOrgId(e.target.value.trim())}
                    disabled={shouldShowMessagingButton}>
                </input>
                <label>Developer Name</label>
                <input
                    type="text"
                    value={deploymentDevName || ""}
                    onChange={e => setDeploymentDevName(e.target.value.trim())}
                    disabled={shouldShowMessagingButton}>
                </input>
                <label>URL</label>
                <input
                    type="text"
                    value={messagingURL || ""}
                    onChange={e => setMessagingURL(e.target.value.trim())}
                    disabled={shouldShowMessagingButton}>
                </input>
                <button
                    className="deploymentDetailsFormSubmitButton"
                    onClick={handleDeploymentDetailsFormSubmit}
                    disabled={shouldDisableFormSubmitButton()}
                >
                    Submit
                </button>
            </div> */}
            {/* {shouldShowMessagingButton &&
                <MessagingButton
                    clickHandler={handleMessagingButtonClick}
                    disableButton={shouldDisableMessagingButton}
                    showSpinner={showMessagingButtonSpinner} />} */}
            {/* {shouldShowMessagingWindow &&
                <Draggable intitialPosition={{ x: 0, y: 500 }}>
                    <MessagingWindow
                        isExistingConversation={isExistingConversation}
                        showMessagingWindow={showMessagingWindow}
                        deactivateMessagingButton={appUiReady} />
                </Draggable>
            } */}
        </>
    );
}