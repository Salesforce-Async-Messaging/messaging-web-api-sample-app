import { useEffect, useState } from "react";

import "./prechat.css";

import { prechatUtil } from "../helpers/prechatUtil";
import { DEPLOYMENT_CONFIGURATION_CONSTANTS } from "../helpers/constants";

/**
 * Main Pre-Chat form component which holds the form fields.
 */
export default function Prechat(props) {
    let [visiblePrechatFields, setVisiblePrechatFields] = useState([]);
    let [hiddenPrechatFields, setHiddenPrechatFields] = useState([]);

    useEffect(() => {
        const prechatFormFields = prechatUtil.getPrechatFormFields();
        if (!prechatFormFields.length) {
            console.warn(`No Pre-Chat Form Fields configured.`);
        }

        visiblePrechatFields = prechatFormFields.filter(field => {
            return field.isHidden === false;
        });
        setVisiblePrechatFields([...visiblePrechatFields]);

        hiddenPrechatFields = prechatFormFields.filter(field => {
            return field.isHidden === true;
        });
        setHiddenPrechatFields([...hiddenPrechatFields]);
    }, []);

    /**
     * Handles gathering Pre-Chat fields and their corresponding values when the form is submitted. The data is passed on to the parent #conversation.js.
     * @param {event} event - Form submit event.
     */
    function handlePrechatFormSubmit(event) {
        if (event) {
            event.preventDefault();
            const formData = new FormData(event.target);
            const formFieldsValues = Object.fromEntries(formData);
            props.prechatSubmit(formFieldsValues);
        }
    }

    return (
        <div className="messagingPrechat">
            <form
                className="prechatForm"
                id="prechatForm"
                onSubmit={handlePrechatFormSubmit}>
                <FormFields
                    visiblePrechatFields={visiblePrechatFields} />
            </form>
            <button
                type="submit"
                className="startConversationButton"
                form="prechatForm">
                Start Conversation
            </button>
        </div>
    );
}

/**
 * Form Fields component which iterates and renders individual form field in Pre-Chat.
 */
function FormFields({visiblePrechatFields}) {
    if (!visiblePrechatFields.length) {
        return;
    }

    const fields = visiblePrechatFields.map(field => {
        return  <li className="prechatFormFieldContainer" key={field.name}>
                    <p className="prechatFormFieldName">{field.name}
                        {field.required && <span className="requiredFieldIndicator">*</span>}
                        <FormField
                            field={field} /></p>
                </li>;
    });

    return (
        <ul className="prechatFormFieldsListView">
            {fields}
        </ul>
    );
}

/**
 * Form Field component representing a single form field of type depending on the deployment configuration, such as Text, Number, Checkbox, Phone, Email, Dropdown etc.
 */
function FormField({field}) {
    let choiceListValues;

    if (field.type === DEPLOYMENT_CONFIGURATION_CONSTANTS.SUPPORTED_PRECHAT_FORM_FIELDS.CHOICELIST && field.choiceListId) {
        const choiceList = prechatUtil.getPrechatFormChoiceList(field.choiceListId);
        if (!choiceList || !choiceList.length || !choiceList[0].choiceListValues) {
            return;
        }

        choiceListValues = choiceList[0].choiceListValues;

        const options = choiceListValues.map(option => {
            return <option
                        value={option.choiceListValueName}
                        key={option.choiceListValueId}>
                        {option.choiceListValueName}
                    </option>
        });

        return (
            <select
                name={field.name}
                id={field.choiceListId}
                required={field.required}
                onClick={handleDropdownFieldClick}>
                {options}
            </select>
        );
    }

    /**
     * Handle a click event from the HTML select element.
     */
    function handleDropdownFieldClick(event) {
        if (event) {
            event.target.focus();
        }
    }

    let fieldInputType;
    let fieldPlaceholder;

    switch (field.type) {
        case DEPLOYMENT_CONFIGURATION_CONSTANTS.SUPPORTED_PRECHAT_FORM_FIELDS.TEXT:
        case DEPLOYMENT_CONFIGURATION_CONSTANTS.SUPPORTED_PRECHAT_FORM_FIELDS.EMAIL:
        case DEPLOYMENT_CONFIGURATION_CONSTANTS.SUPPORTED_PRECHAT_FORM_FIELDS.NUMBER:
        case DEPLOYMENT_CONFIGURATION_CONSTANTS.SUPPORTED_PRECHAT_FORM_FIELDS.CHECKBOX:
            fieldInputType = (field.type).toLowerCase();
            break;
        case DEPLOYMENT_CONFIGURATION_CONSTANTS.SUPPORTED_PRECHAT_FORM_FIELDS.PHONE:
            fieldInputType = "tel";
            fieldPlaceholder = "123-456-7890"
            break;
        default:
            fieldInputType = "text";
    }

    /**
     * Generate a class name for a Pre-Chat form field input element.
     */
    function generatePrechatFormFieldClassname() {
        return `prechatFormField ${field.type.toLowerCase()}`;
    }

    /**
     * Handle a click event from an input element to put focus on it.
     * @param {object} event
     */
    function handlePrechatFormFieldClick(event) {
        if (event) {
            if (event.target.type === "checkbox") {
                return;
            }
            event.target.focus();
        }
    }
    
    return (
        <input
            className={generatePrechatFormFieldClassname()}
            id={field.name}
            name={field.name}
            type={fieldInputType}
            placeholder={fieldPlaceholder}
            required={field.required}
            maxLength={field.maxLength}
            onClick={handlePrechatFormFieldClick} />
    );
}