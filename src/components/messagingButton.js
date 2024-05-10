import './messagingButton.css';
 
export default function MessagingButton(props) {
    
    return (
        <>
            <button
                className="messagingButton"
                onClick={props.clickHandler}
                disabled={props.disableButton}>
                    Let's Chat
                {props.showSpinner && <span className="messagingButtonLoadingUI loadingBalls"></span>}
            </button>
        </>
    );
}