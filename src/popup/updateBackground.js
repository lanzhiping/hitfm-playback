const port = chrome.extension.connect({
  name: "Sample Communication",
});

const updateBackground = (command, value) =>
  port.postMessage({
    command,
    value,
  });

module.exports = {
  updateBackground,
};
