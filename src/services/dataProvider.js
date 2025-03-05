import { setItemInWebStorage, getItemInWebStorageByKey } from "../helpers/webstorageUtils";
import { STORAGE_KEYS } from "../helpers/constants";

// Store the Org Id for other components to use.
function storeOrganizationId(organizationId) {
    setItemInWebStorage(STORAGE_KEYS.ORGANIZATION_ID, organizationId);
}
function getOrganizationId() {
    return getItemInWebStorageByKey(STORAGE_KEYS.ORGANIZATION_ID);
}

// Store the Embedded Service Deployment Developer Name for other components to use.
function storeDeploymentDeveloperName(deploymentDevName) {
    setItemInWebStorage(STORAGE_KEYS.DEPLOYMENT_DEVELOPER_NAME, deploymentDevName);
}
function getDeploymentDeveloperName() {
    return getItemInWebStorageByKey(STORAGE_KEYS.DEPLOYMENT_DEVELOPER_NAME);
}

// Store the Salesforce Url from the Embedded Service Deployment for other components to use.
function storeSalesforceMessagingUrl(messagingUrl) {
    setItemInWebStorage(STORAGE_KEYS.MESSAGING_URL, messagingUrl);
}
function getSalesforceMessagingUrl() {
    return getItemInWebStorageByKey(STORAGE_KEYS.MESSAGING_URL);
}

// Store the Salesforce Access Token (JWT) for other components to use.
function setJwt(jwt) {
    setItemInWebStorage(STORAGE_KEYS.JWT, jwt);
}
function getJwt() {
    return getItemInWebStorageByKey(STORAGE_KEYS.JWT);
}

// Store the configuration settings of the Embedded Service Deployment for other components to use.
function setDeploymentConfiguration(configuration) {
    setItemInWebStorage(STORAGE_KEYS.DEPLOYMENT_CONFIGURATION, JSON.stringify(configuration));
}
function getDeploymentConfiguration() {
    const configuration = getItemInWebStorageByKey(STORAGE_KEYS.DEPLOYMENT_CONFIGURATION);
    if (!configuration) {
        return;
    }
    return JSON.parse(getItemInWebStorageByKey(STORAGE_KEYS.DEPLOYMENT_CONFIGURATION));
}

// Store the latest last-event-id from the Access Token API response or from an Event Source (SSE) event in-memory.
let lastEventId;
function setLastEventId(id) {
    lastEventId = id;
}
function getLastEventId() {
    return lastEventId;
}

// Store the conversation-id for the current conversation in-memory for other components to use.
let conversationId;
function storeConversationId(convId) {
    conversationId = convId;
}
function getConversationId() {
    return conversationId;
}

// Clears the in-memory messaging data variables.
function clearInMemoryData() {
    conversationId = undefined;
    lastEventId = undefined;

}

export {
    storeOrganizationId,
    getOrganizationId,
    storeDeploymentDeveloperName,
    getDeploymentDeveloperName,
    storeSalesforceMessagingUrl,
    getSalesforceMessagingUrl,
    setDeploymentConfiguration,
    getDeploymentConfiguration,
    setLastEventId,
    getLastEventId,
    setJwt,
    getJwt,
    storeConversationId,
    getConversationId,
    clearInMemoryData
};