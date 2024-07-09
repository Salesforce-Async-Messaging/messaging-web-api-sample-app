/**
 * Class for representing the timer used to start and stop showing typing indicators on the async web client.
 */
export default class CountdownTimer {
    _timer; // Identifier returned when setTimeout() executes.
    _finished; // Whether the timer finished executing.
    _endTimerCallback; // Callback method after timer ends.
    _durationInMillis; // Time left (ms) on the timer.
    _lastReceivedTimestamp; // Timestamp of the most recent event.

    constructor(endTimerCallback, durationInMillis, timestamp) {
        this._timer = null;
        this._finished = false;
        this._endTimerCallback = endTimerCallback;
        this._durationInMillis = durationInMillis;
        this._lastReceivedTimestamp = timestamp;
    }

    /**
     * Starts a CountdownTimer. Invoke any callbacks when a timer starts/ends.
     */
    start() {
        // Clears the active timeout, if any.
        this.clear();

        this._finished = false;
        this._timer = setTimeout(() => {
            this._finished = true;
            // Invoke callback after timer ends.
            this._endTimerCallback();
            // Clear existing timer.
            this.clear();
        }, this._durationInMillis);
    }

    /**
     * Clears a CountdownTimer.
     */
    clear() {
        if (this._timer) {
            clearTimeout(this._timer);
        } else {
            // No-op. No timer set to clear.
        }
    }

    /**
     * Extends the CountdownTimer by clearing the active timeout (if any) and setting another timeout.
     *
     * @param currentEventTimestamp
     */
    reset(currentEventTimestamp) {
        // No-op if the current event is older than previously received event.
        if (currentEventTimestamp < this._lastReceivedTimestamp) {
            return;
        }

        // Update stored timestamp to latest.
        this._lastReceivedTimestamp = currentEventTimestamp;
        // Delete identifier of last executed timeout.
        if (this._finished) {
            this._timer = undefined;
        }

        // Restart the timer.
        this.start();
    }
}