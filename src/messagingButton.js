import './messagingButton.css';
import getConfigurationData from './messagingService';
 
export default function MessagingButton() {
    function handleMessagingButtonClick(evt) {
        if (evt) {
            console.log("Messaging Button clicked.");
            getConfigurationData();
        }
    }
    
    return <button
                className="messagingButton"
                onClick={handleMessagingButtonClick}>
                    Let's Chat
            </button>;
}