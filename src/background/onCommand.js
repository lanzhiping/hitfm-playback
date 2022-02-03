const onCommand = (commandMap) => {
  chrome.extension.onConnect.addListener((port) => {
    console.log("Connected");

    port.onMessage.addListener((msg) => {
      console.log("message recieved: " + msg.command);

      const callback = commandMap[msg.command];

      if (callback && typeof callback === "function") {
        callback(msg.value);
      }
    });
  });
};

module.exports = {
  onCommand,
};
