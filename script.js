function shortenURL() {
    const originalURL = document.getElementById('original-url').value;
    const resultDiv = document.getElementById('result');
    const copyButton = document.getElementById('copy-button');

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

    // Display the original URL in an alert
    alert(`Original URL: ${originalURL}`);

    // Display the shortened URL
    resultDiv.innerHTML = `Shortened URL: <a href="${shortenedURL}" target="_blank">${shortenedURL}</a>`;

    // Show the copy button
    copyButton.style.display = 'block';
    copyButton.setAttribute('data-url', shortenedURL);
}

function copyToClipboard() {
    const copyButton = document.getElementById('copy-button');
    const shortenedURL = copyButton.getAttribute('data-url');

    // Create a temporary input element to copy the URL
    const tempInput = document.createElement('input');
    document.body.appendChild(tempInput);
    tempInput.value = shortenedURL;
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);

    alert('Shortened URL copied to clipboard');
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
}
