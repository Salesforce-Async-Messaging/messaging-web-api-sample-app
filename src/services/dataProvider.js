let orgId;
function setOrganizationId(organizationId) {
    orgId = organizationId;
}
function getOrganizationId() {
    return orgId;
}

let deploymentDevName;
function setDeploymentDeveloperName(devName) {
    deploymentDevName = devName;
}
function getDeploymentDeveloperName() {
    return deploymentDevName;
}

let scrt2Url;
function setScrt2Url(url) {
    scrt2Url = url;
}
function getScrt2Url() {
    return scrt2Url;
}

let deploymentConfiguration;
function setDeploymentConfiguration(configuration) {
    deploymentConfiguration = configuration;
}
function getDeploymentConfiguration() {
    return deploymentConfiguration;
}

let lastEventId;
function setLastEventId(id) {
    lastEventId = id;
}
function getLastEventId() {
    return lastEventId;
}

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
    setScrt2Url,
    getScrt2Url,
    setDeploymentConfiguration,
    getDeploymentConfiguration,
    setLastEventId,
    getLastEventId,
    setJwt,
    getJwt
};