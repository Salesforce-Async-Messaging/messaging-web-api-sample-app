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
import { determineStorageType, initializeWebStorage, getItemInWebStorageByKey, getItemInPayloadByKey, setItemInWebStorage } from './helpers/webstorageUtils';
import { APP_CONSTANTS, STORAGE_KEYS } from './helpers/constants';
import {
    getContinuityJwt,
    listConversations
} from './services/messagingService'
import { storeConversationId, getConversationId, } from "./services/dataProvider";

export default function BootstrapMessaging() {

    const [isPageLoading, setPageLoading] = useState(true)

    const [orgId, setOrgId] = useState('');
    const [deploymentDevName, setDeploymentDevName] = useState('');
    const [messagingURL, setMessagingURL] = useState('');
    const [isExistingConversation, setIsExistingConversation] = useState(false);
    const [existingJwtToken, setExistingJwtToken] = useState("")


    const getListConversations = (jwt="", url="") => {
        return listConversations(false, jwt, url)
                .then((response) => {
                    console.log("getListConversations", jwt, url, response)
                    if (response && response.openConversationsFound > 0 && response.conversations.length) {
                        const openConversations = response.conversations;
                        if (openConversations.length > 1) {
				            console.warn(`Expected the user to be participating in 1 open conversation but instead found ${openConversations.length}. Loading the conversation with latest startTimestamp.`);
				            openConversations.sort((conversationA, conversationB) => conversationB.startTimestamp - conversationA.startTimestamp);
                        }
                        // Update conversation-id with the one from service.
                        storeConversationId(openConversations[0].conversationId);
                        // updateConversationStatus(CONVERSATION_CONSTANTS.ConversationStatus.OPENED_CONVERSATION);
                    }
                })
                .catch((err) => {
                    console.error(`Something went wrong in fetching a list of conversations: ${err && err.message ? err.message : err}`);
                });
    }

    const getUrlParams = async (url) => {
        const paramsData = url.match(/([^?=&]+)(=([^&]*))/g) || []
        // http://localhost:3000?orgId=00DNy0000000Hgn&devName=IOS_Mobile&url=https://bitkuber.my.salesforce-scrt.com
        const paramData = paramsData.reduce(
          (a, v) => ((a[v.slice(0, v.indexOf('='))] = v.slice(v.indexOf('=') + 1)), a),
          {}
        );
        console.log("paramData", paramData)
       let jwt = ""
        if(!isEmpty(paramData?.jwt) && !isEmpty(paramData?.url)) {
            // setIsExistingConversation(true);
            // setExistingJwtToken(paramData?.jwt)
            const data = await getContinuityJwt(paramData?.jwt, paramData?.url)
            .then((response) => {
                console.log("______data_____response --->",response, paramData?.jwt, paramData?.url)
                setIsExistingConversation(true);
                setExistingJwtToken(paramData?.jwt)
                jwt = paramData?.jwt
                // getListConversations(paramData?.jwt, paramData?.url)
                //     .then((res) => {
                //         console.log(`______data_____response res Successfully listed the conversations.`, res);
                //     })
                //     .catch(err => {
                //         console.log("koikokokoko")
                //         console.error(`${err}`);
                //     });
                // setJwt(response.accessToken);
                // setItemInWebStorage(STORAGE_KEYS.JWT, response.accessToken);
            })
            .catch((err) => {
                console.log("______data_____err",err)
                console.error(`Something went wrong in fetching a Continuation Access Token: ${err && err.message ? err.message : err}`);
                // handleMessagingErrors(err);
                // throw new Error("Failed to fetch a Continuation access token.");
            });

            console.log("______data_____", data)
            // setItemInWebStorage(STORAGE_KEYS.JWT, existingJwtToken);
        } else {
            setIsExistingConversation(false);
        }

        if(!isEmpty(paramData?.orgId)) {
            setOrgId(paramData?.orgId)
        }
        if(!isEmpty(paramData?.devName)) {
            setDeploymentDevName(paramData?.devName)
        }
        if(!isEmpty(paramData?.url)) {
            setMessagingURL(paramData?.url)
        }

        if(!isEmpty(paramData?.orgId) && !isEmpty(paramData?.devName) && !isEmpty(paramData?.url)) {
            initializeMessagingClient(paramData?.orgId, paramData?.devName, paramData?.url, jwt);
        }
    }


  

    useEffect(() => {
        getUrlParams(window.location.href)
        return () => {
            setPageLoading(true)
        }
    }, [window.location.href])
    useEffect(() => {
        getUrlParams(window.location.href)
        return () => {
            setPageLoading(true)
        }
    }, [window.location.href])

    /**
     * Initialize the messaging client by
     * 1. internally initializing the Embedded Service deployment paramaters in-memory.
     * 2. initializing Salesforce Organization Id in the browser web storage.
     */
    function initializeMessagingClient(ord_id, deployment_dev_name, messaging_url, jwt="") {
        // Initialize helpers.
        console.log("initializeMessagingClient", ord_id, deployment_dev_name, messaging_url, jwt)
        initializeWebStorage(ord_id || orgId);
        if(!isEmpty(jwt)) {
            setItemInWebStorage(STORAGE_KEYS.JWT, jwt);
        }
        storeOrganizationId(ord_id || orgId);
        storeDeploymentDeveloperName(deployment_dev_name || deploymentDevName);
        storeSalesforceMessagingUrl(messaging_url || messagingURL);
        setPageLoading(false)
    }

    function reInitializeMessagingClient(ord_id, deployment_dev_name, messaging_url) {
        // Initialize helpers.
        // setIsExistingConversation(false);
        // initializeWebStorage(ord_id || orgId);
        // storeOrganizationId(ord_id || orgId);
        // storeDeploymentDeveloperName(deployment_dev_name || deploymentDevName);
        // storeSalesforceMessagingUrl(messaging_url || messagingURL);
        // setTimeout(() => {
        //     setPageLoading(false)
        // }, 0)
    }



    /**
     * Determines whether to render the Messaging Window based on the supplied parameter.
     * @param {boolean} shouldShow - TRUE - render the Messaging WINDOW and FALSE - Do not render the Messaging Window & Messaging Button
     */
    function showMessagingWindow(shouldShow) {
        if (!shouldShow) {
            // Remove the spinner on the Messaging Button.
        }
    }

    /**
     * Handles the app UI readiness i.e. Messaging Button updates based on whether the Messaging Window UI is rendered.
     * @param {boolean} isReady - TRUE - disable the Messaging Button & remove the spinner and FALSE - otherwise.
     */
    function appUiReady(isReady) {
        // Remove the spinner on the Messaging Button if the app is UI ready.
    }

    const getLoadingState = () => {
        return <div className="loadingContainer">
            <div className="loadingHeader">
                <div className="loadingIcon">←</div>
                <span className="loadingChat-text">Chat</span>
            </div>
            <div className="loadingChat-body">
                {Array(15).fill(<><div className="loadingShimmerLeft"></div>
                    <div className="loadingShimmerRight"></div></>)}
            </div>
        </div>
    }

    return (
        <>
            {
                isPageLoading ?
                getLoadingState() : 
                <MessagingWindow
                    isExistingConversation={isExistingConversation}
                    showMessagingWindow={showMessagingWindow}
                    deactivateMessagingButton={appUiReady}
                    getLoadingState={getLoadingState}
                    reInitializeMessagingClient={reInitializeMessagingClient}
                />
            }
        </>
    );
}