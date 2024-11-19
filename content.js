let audioContext = null;
let gainNode = null;

// Function to initialize audio processing
function initializeAudio() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    gainNode = audioContext.createGain();

    // Find and connect to all audio elements
    const audioElements = document.querySelectorAll("audio, video");
    audioElements.forEach(connectToGainNode);

    // Load saved volume and apply it
    chrome.storage.local.get(["volume"], function (result) {
      if (result.volume !== undefined) {
        const gainValue = result.volume / 100;
        if (gainNode) {
          gainNode.gain.value = gainValue;
        }
      }
    });

    // Use MediaElementAudioSourceNode for HTML5 audio/video elements
    function connectToGainNode(element) {
      const source = audioContext.createMediaElementSource(element);
      source.connect(gainNode);
      gainNode.connect(audioContext.destination);
    }

    // Monitor DOM for newly added audio/video elements
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeName === "AUDIO" || node.nodeName === "VIDEO") {
            connectToGainNode(node);
          }
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "setVolume") {
    if (!audioContext) initializeAudio();

    // Convert slider value (0-200) to gain (0-2)
    const gainValue = request.value / 100;
    if (gainNode) {
      gainNode.gain.value = gainValue;
    }
    sendResponse({ success: true });
  }
});

// Initialize audio context when page loads
document.addEventListener("DOMContentLoaded", function () {
  initializeAudio();
});
