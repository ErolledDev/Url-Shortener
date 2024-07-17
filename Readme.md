# URL Shortener

## Author
**ErolledDev**

**Email for Donations:** [villarin_cedrick@yahoo.com](mailto:villarin_cedrick@yahoo.com)

## Introduction
This project is a simple URL shortener that you can host as a static site using pure JavaScript. It allows you to input an original URL and generate a shortened URL without relying on external APIs, ensuring it is free of cost and entirely self-contained.

## Features
- **Static Site:** No server-side components required.
- **Pure JavaScript:** Uses only HTML, CSS, and JavaScript.
- **Local Storage:** Stores URLs in the browser's local storage.
- **Unique Identifier:** Generates a unique identifier for each URL.
- **Automatic Redirection:** Redirects to the original URL when the shortened URL is visited.

## How It Works
1. **Input URL:** User inputs the original URL.
2. **Generate Shortened URL:** A unique identifier is generated using base64 encoding.
3. **Store URL:** The original URL is stored in the browser's local storage with the unique identifier as the key.
4. **Display Shortened URL:** The shortened URL is displayed to the user.
5. **Redirection:** When the shortened URL is visited, the page checks the unique identifier and redirects to the original URL if found.

## Usage
1. **Open the Page:** Access the static site.
2. **Enter URL:** Input the URL you want to shorten.
3. **Get Shortened URL:** Click the button to generate and display the shortened URL.
4. **Visit Shortened URL:** Share or use the shortened URL to be automatically redirected to the original URL.

## Hosting
To host this as a static site, upload the HTML and JavaScript files to your preferred hosting provider, such as:
- **GitHub Pages**
- **Netlify**
- **Vercel**

## Note
This solution is purely client-side and suitable for personal or small-scale use. For production environments requiring security and scalability, consider implementing a server-side solution.

---

For more information or to donate, please contact [ErolledDev](mailto:villarin_cedrick@yahoo.com)
