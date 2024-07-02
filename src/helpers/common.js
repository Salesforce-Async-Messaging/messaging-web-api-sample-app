export const util = {
    /**
     * Generate a UUID.
     */
    generateUUID() {
        const hexDigits = "0123456789abcdef";
        const valueArray = new Uint32Array(32);
        crypto.getRandomValues(valueArray);

        let res = '';
        for (let i = 0; i < 32; i++) {
            if (i === 8 || i === 12 || i === 16 || i === 20) {
                res += '-';
            }
            if (i === 12) {
                res += '4'; // UUID version
            } else if (i === 16) {
                res += hexDigits.charAt((valueArray[i] & 0x3) | 0x8); // Bits need to start with 10
            } else {
                res += hexDigits.charAt(valueArray[i] & 0xf);
            }
        }

        return res;
    },

    /**
     * Generates a full style formatted date and time (e.g. 01/01/2024, 10:00:00 AM).
     */
    formatDateTime(timestamp) {
        return new Intl.DateTimeFormat('en-US', {year: 'numeric', month: '2-digit',day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit'}).format(timestamp);
    },

    getFormattedDate(timestamp) {
        const formattedDateTime = this.formatDateTime(timestamp);

        return formattedDateTime.split(",")[0].trim();
    },

    getFormattedTime(timestamp) {
        const formattedDateTime = this.formatDateTime(timestamp);

        return formattedDateTime.split(",")[1].trim();
    },

    /**
     * Creates deep copy of conversationEntries for searching.
     */
    createDeepCopy(conversationEntries) {
        return JSON.parse(JSON.stringify(conversationEntries));
    }
};