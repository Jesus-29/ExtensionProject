const slider = document.getElementById("myRange");
const valueDisplay = document.getElementById("sliderValue");
const toggleButton = document.getElementById("modeToggle");

// Load saved volume when popup opens
document.addEventListener("DOMContentLoaded", function () {
  chrome.storage.local.get(["volume"], function (result) {
    if (result.volume !== undefined) {
      slider.value = result.volume;
      valueDisplay.textContent = result.volume;

      // Apply saved volume immediately
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: "setVolume",
          value: result.volume,
        });
      });
    }
  });
});

// Update volume when slider moves
slider.addEventListener("input", function () {
  const value = slider.value;
  valueDisplay.textContent = value;

  // Save to storage
  chrome.storage.local.set({ volume: value }, function () {
    console.log("Volume saved:", value);
  });

  // Send message to content script
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {
      action: "setVolume",
      value: value,
    });
  });
});

// Dark mode toggle functionality (unchanged)
toggleButton.addEventListener("click", toggleMode);

function toggleMode() {
  const body = document.body;
  if (body.classList.contains("dark-mode")) {
    body.classList.remove("dark-mode");
    toggleButton.textContent = "Dark";
  } else {
    body.classList.add("dark-mode");
    toggleButton.textContent = "Light";
  }
}
