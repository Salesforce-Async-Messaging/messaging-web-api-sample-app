import { APP_CONSTANTS } from './constants';

// storageKey holds top level storage key in the browser storage.
export let storageKey;
let storageName;

/**
 * True if this browser session allows access to local storage. Some users may have stricter browser security settings. Do nothing on error.
 */
export const isLocalStorageAvailable = () => {
    /*
    try {
        // Test getting an item to see if this triggers an error
        window.localStorage.getItem("test");

        if (window.localStorage && typeof window.localStorage === "object") {
            storageName = "localStorage";
            return true;
        }
    } catch {
        // localStorage is not available. User chat sessions continue only in a single-page view and not across multiple pages.
        console.log("localStorage not available.");
        return false;
    }
    // We should never reach this return statement, it exists to make the linter happy.
    return false;
    */

    /**
     * localStorage data spans across tabs in a browser and sessionStorage is unique per tab.
     * Currently hardcoded to disable localStorage internally in the app by returning FALSE.
     * If the app's support (e.g. Messaging Session Continuation) is required to be enabled across tabs in a browser, uncomment the code block above and remove the hardcoded 'return false' statement.
     */
    return false;
};

/**
 * True if this browser session allows access to session storage. Some users may have stricter browser security settings. Do nothing on error.
 */
export const isSessionStorageAvailable = () => {
    try {
        // Test getting an item to see if this triggers an error
        window.sessionStorage.getItem("test");

        if (window.sessionStorage && typeof window.sessionStorage === "object") {
            storageName = "sessionStorage";
            return true;
        }
    } catch {
        // sessionStorage is not available. User chat sessions end after a web page refresh or across browser tabs and windows.
        return false;
    }
    // We should never reach this return statement, it exists to make the linter happy.
    return false;
};

/**
 * Determine the type of web storage (local vs. session) to be used
 * It will prioritize localStorage if specified, otherwise sessionStorage
 */
export const determineStorageType = (inLocalStorage = false) => {
    return isLocalStorageAvailable() && inLocalStorage ? localStorage : isSessionStorageAvailable() ? sessionStorage : undefined;
};

/**
 * Get item from web storage object payload.
 *
 * @param payload - Storage object as string
 * @param key - Storage Key
 * @returns {*} - Item if found, undefined otherwise.
 */
export const getItemInPayloadByKey = (payload, key) => {
    let item;

    if (payload) {
        const storageObj = JSON.parse(payload) || {};
        item = storageObj[key];
    }

    return item;
};

/**
 * Initialize Browser Web Storage (i.e. localStorage and/or sessionStorage) with a storage key including the Salesforce Organization Id.
 */
export const initializeWebStorage = (organizationId) => {
    storageKey = `${APP_CONSTANTS.WEB_STORAGE_KEY}${organizationId}`;

    const storageObj = JSON.stringify({});

    // Initialize the web storage object
    if (isLocalStorageAvailable() && !localStorage.getItem(storageKey)) {
        localStorage.setItem(storageKey, storageObj);
    }
    if (isSessionStorageAvailable() && !sessionStorage.getItem(storageKey)) {
        sessionStorage.setItem(storageKey, storageObj);
    }

};

/**
 * Returns the item in web storage by the key in this current conversation.
 * It prioritizes getting the object in localStorage if exists in both
 * Returns undefined if not found
 */
export const getItemInWebStorageByKey = (key, inLocalStorage = true) => {
    let item;
    const storage = determineStorageType(inLocalStorage);

    if (storage) {
        const storageObj = (storage.getItem(storageKey) && JSON.parse(storage.getItem(storageKey))) || {};
        item = storageObj[key];
    }

    return item;
};

/**
 * Set the item in web storage by the key in this current conversation.
 * If inLocalStorage is true, then first try to store in localStorage, otherwise sessionStorage
 */
export const setItemInWebStorage = (key, value, inLocalStorage = true) => {
    const storage = determineStorageType(inLocalStorage);

    if (storage) {
        const storageObj = (storage.getItem(storageKey) && JSON.parse(storage.getItem(storageKey))) || {};
        storageObj[key] = value;
        storage.setItem(storageKey, JSON.stringify(storageObj));
    }
};

/**
 * Remove item from both localStorage and sessionStorage that match that given key
 * As well as item that was originally stored in fallback location
 */
export const removeItemInWebStorage = (key) => {
    if (isLocalStorageAvailable() && localStorage.getItem(storageKey)) {
        const storageObj = JSON.parse(localStorage.getItem(storageKey)) || {};
        delete storageObj[key];
        localStorage.setItem(storageKey, JSON.stringify(storageObj));
    }
    if (isSessionStorageAvailable() && sessionStorage.getItem(storageKey)) {
        const storageObj = JSON.parse(sessionStorage.getItem(storageKey)) || {};
        delete storageObj[key];
        sessionStorage.setItem(storageKey, JSON.stringify(storageObj));
    }

};

/**
 * Clear all client side stored item in both localStorage & sessionStorage
 */
export const clearWebStorage = () => {
    if (isLocalStorageAvailable()) {
        localStorage.removeItem(storageKey);
    }
    if (isSessionStorageAvailable()) {
        sessionStorage.removeItem(storageKey);
    }

};