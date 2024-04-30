"use client";

import './bootstrapMessaging.css';
import { useState } from "react";
import MessagingButton from "./messagingButton";

export default function BootstrapMessaging() {
    let [shouldShowMessagingButton, setShowMessagingButton] = useState(false);
    let [orgId, setOrgId] = useState('');
    let [deploymentDevName, setDeploymentDevName] = useState('');
    let [scrt2URL, setScrt2URL] = useState('');

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
            setShowMessagingButton(true);
        }
    }

    return (
        <div className="deploymentDetailsForm">
            <h3>Input your Embedded Service API-type deployment details below</h3>
            <label>Org Id</label>
            <input type="text" value={orgId} onChange={e => setOrgId(e.target.value.trim())}></input>
            <label>Deployment Developer Name</label>
            <input type="text" value={deploymentDevName} onChange={e => setDeploymentDevName(e.target.value.trim())}></input>
            <label>SCRT2 Url</label>
            <input type="text" value={scrt2URL} onChange={e => setScrt2URL(e.target.value.trim())}></input>
            <button
                className="deploymentDetailsFormSubmitButton"
                onClick={handleDeploymentDetailsFormSubmit}
                disabled={orgId.length === 0 || deploymentDevName.length === 0 || scrt2URL.length === 0}>
                    Submit
            </button>
            {shouldShowMessagingButton && <MessagingButton />}
        </div>
    );
}