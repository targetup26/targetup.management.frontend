/**
 * Copies text to clipboard with fallback for older browsers
 * @param {string} text - The text to copy
 * @returns {Promise<boolean>} - Success status
 */
export const copyToClipboard = async (text) => {
    if (!navigator.clipboard) {
        // Fallback for older browsers
        try {
            const textArea = document.createElement("textarea");
            textArea.value = text;

            // Avoid scrolling to bottom
            textArea.style.top = "0";
            textArea.style.left = "0";
            textArea.style.position = "fixed";

            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();

            const successful = document.execCommand('copy');
            document.body.removeChild(textArea);
            return successful;
        } catch (err) {
            console.error('Fallback: Oops, unable to copy', err);
            return false;
        }
    }

    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        console.error('Async: Could not copy text: ', err);
        return false;
    }
};
