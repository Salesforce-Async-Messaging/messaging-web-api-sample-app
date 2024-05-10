// Store the Org Id in-memory for other components to use.
let orgId;
function setOrganizationId(organizationId) {
    orgId = organizationId;
}
function getOrganizationId() {
    return orgId;
}

// Store the Embedded Service Deployment Developer Name in-memory for other components to use.
let deploymentDevName;
function setDeploymentDeveloperName(devName) {
    deploymentDevName = devName;
}
function getDeploymentDeveloperName() {
    return deploymentDevName;
}

// Store the Salesforce Url from the Embedded Service Deployment in-memory for other components to use.
let messagingUrl;
function setSalesforceMessagingUrl(url) {
    messagingUrl = url;
}
function getSalesforceMessagingUrl() {
    return messagingUrl;
}

// Store the configuration settings of the Embedded Service Deployment in-memory for other components to use.
let deploymentConfiguration;
function setDeploymentConfiguration(configuration) {
    deploymentConfiguration = configuration;
}
function getDeploymentConfiguration() {
    return deploymentConfiguration;
}

// Store the latest last-event-id from the Access Token API response or from an Event Source (SSE) event in-memory.
let lastEventId;
function setLastEventId(id) {
    lastEventId = id;
}
function getLastEventId() {
    return lastEventId;
}

// Store the Salesforce Access Token (JWT) in-memory for other components to use.
let jwt;
function setJwt(JWT) {
    jwt = JWT;
}
function getJwt() {
    return jwt;
}

export {
    setOrganizationId,
    getOrganizationId,
    setDeploymentDeveloperName,
    getDeploymentDeveloperName,
    setSalesforceMessagingUrl,
    getSalesforceMessagingUrl,
    setDeploymentConfiguration,
    getDeploymentConfiguration,
    setLastEventId,
    getLastEventId,
    setJwt,
    getJwt
};