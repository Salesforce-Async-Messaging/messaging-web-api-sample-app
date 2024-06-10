import { getDeploymentConfiguration } from "../services/dataProvider";
import { DEPLOYMENT_CONFIGURATION_CONSTANTS } from "./constants";

export const prechatUtil = {
    /**
     * Check whether Pre-Chat is enabled in the deployment.
     * @returns {boolean} TRUE is the Pre-Chat is enabled and FALSE otherwise.
     */
    isPrechatEnabled() {
        const configuration = getDeploymentConfiguration();
        return configuration && configuration.forms && configuration.forms.length;
    },

    /**
     * Get Pre-Chat form data from the configuration.
     * @returns {Array}
     */
    getPrechatFormData() {
        if (!this.isPrechatEnabled()) {
            return undefined;
        }
        const configuration = getDeploymentConfiguration();
        return configuration && configuration.forms;
    },

    /**
     * Get Pre-Chat form fields from the form data. Sort the form fields based on the 'order' attribute.
     * @returns {Array}
     */
    getPrechatFormFields() {
        if (!this.isPrechatEnabled()) {
            return undefined;
        }
        const prechatFormData = this.getPrechatFormData();
        const formFields = prechatFormData.length && prechatFormData[0].formFields;
        return formFields.sort((fieldA, fieldB) => fieldA.order - fieldB.order);
    },

    /**
     * Get Pre-Chat form Choice List data from the configuration for the configured Dropdown field.
     * @param {choiceListId} - Identifier of the Dropdown field for getting the corresponding Choice List data.
     * @returns {object} - Object containing the corresponding choiceListId and its Dropdown options.
     */
    getPrechatFormChoiceList(choiceListId) {
        if (!this.isPrechatEnabled()) {
            return undefined;
        }
        const configuration = getDeploymentConfiguration();
        const choiceListConfig = configuration && configuration.choiceListConfig;
        const choiceList = choiceListConfig && choiceListConfig.choiceList && choiceListConfig.choiceList.length && choiceListConfig.choiceList.filter(choiceList => {
            return choiceList.choiceListId === choiceListId;
        });
        return choiceList;
    },

    /**
     * Get the configured Pre-Chat display frequency.
     * @returns {string} - 'Conversation' or 'Session'.
     */
    getPrechatDisplayFrequency() {
        if (!this.isPrechatEnabled()) {
            return undefined;
        }
        const prechatFormData = this.getPrechatFormData();
        return prechatFormData && prechatFormData.length && prechatFormData[0] && prechatFormData[0].displayContext;
    },

    /**
     * Check whether the Pre-Chat form should be displayed.
     * @returns {boolean} - TRUE if Pre-Chat is enabled and at least one visible form field is configured, FALSE otherwise.
     */
    shouldDisplayPrechatForm() {
        const prechatFormFields = this.getPrechatFormFields();
        const visiblePrechatFormFields = prechatFormFields && prechatFormFields.filter(field => {
            return field.isHidden === false;
        });
        return visiblePrechatFormFields && visiblePrechatFormFields.length > 0;
    },

    /**
     * Check whether the Pre-Chat form should be display once per conversation or for every messaging session.
     * @returns {boolean} - TRUE if the Pre-Chat form is configured to be displayed for every messaging session and FALSE otherwise.
     */
    shouldDisplayPrechatEveryMessagingSession() {
        if (!this.isPrechatEnabled()) {
            return undefined;
        }
        return this.getPrechatDisplayFrequency() === DEPLOYMENT_CONFIGURATION_CONSTANTS.PRECHAT_DISPLAY_EVERY_SESSION;
    }
};