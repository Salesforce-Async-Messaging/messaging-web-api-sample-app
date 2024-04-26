import './messagingButton.css';
 
export default function MessagingButton() {
    function handleMessagingButtonClick(evt) {
        if (evt) {
            console.log("Messaging Button clicked.");
        }
    }
    
    return <button
                className="messagingButton"
                onClick={handleMessagingButtonClick}>
                    Let's Chat
            </button>;
}