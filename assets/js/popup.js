chrome.runtime.onMessage.addListener((request, sender) => {
  if (request.action === "getSource") {
    message.innerText = displayResults(request.results);
  }
});

function onWindowLoad() {
  var message = document.querySelector("#message");

  chrome.tabs.executeScript(
    null,
    {
      file: "assets/js/getPagesSource.js"
    },
    () => {
      if (chrome.runtime.lastError) {
        message.innerText =
          "There was an error to find the magnet links: " +
          chrome.runtime.lastError.message;
      }
    }
  );
}

displayResults = results => {
  results = JSON.parse(results);

  let resultsDiv = document.querySelector("#results");

  if (results.length === 0) {
    return "No magnet links have been found!";
  }

  results.forEach(result => {
    resultsDiv.innerHTML += `<a href="${
      result.magnet
    }" class="result" target="_blank">${result.title}</a>`;
  });

  // resultsDiv.innerHTML = results;
  return `We have found ${results.length} magnets available!`;
};

window.onload = onWindowLoad;
