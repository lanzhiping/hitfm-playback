const { listenToAudioCommands } = require("./listenToAudioCommands");
const { showPageAction } = require("./showPageAction");

chrome.runtime.onInstalled.addListener(() => {
  showPageAction();
  listenToAudioCommands();
});

chrome.runtime.onStartup.addListener(() => {
  listenToAudioCommands();
});
