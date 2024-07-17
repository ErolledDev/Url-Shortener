function shortenURL() {
    const originalURL = document.getElementById('original-url').value;
    const resultDiv = document.getElementById('result');

    if (!originalURL) {
        resultDiv.innerHTML = 'Please enter a valid URL.';
        return;
    }

    // Generate a unique identifier for the URL
    const uniqueID = btoa(originalURL).slice(-6);

    // Construct the shortened URL (For this example, we're using the current domain)
    const shortenedURL = `${window.location.origin}/?id=${uniqueID}`;

    // Store the original URL in local storage (key: uniqueID, value: originalURL)
    localStorage.setItem(uniqueID, originalURL);

    resultDiv.innerHTML = `Shortened URL: <a href="${shortenedURL}" target="_blank">${shortenedURL}</a>`;
}

// Check if there's an ID in the URL parameters and redirect if it exists
window.onload = function() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (id) {
        const originalURL = localStorage.getItem(id);
        if (originalURL) {
            window.location.href = originalURL;
        } else {
            document.getElementById('result').innerHTML = 'Invalid or expired URL.';
        }
    }
