chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "fetchUsernames") {
      fetch(request.url, {
        method: 'GET',
        headers: {
          'Referer': request.referer
        }
      })
      .then(response => response.json())
      .then(data => sendResponse({ success: true, data }))
      .catch(error => sendResponse({ success: false, error }));
  
      // Keep the message channel open for sendResponse
      return true;
    }
  });
  