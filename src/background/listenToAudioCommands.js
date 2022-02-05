const {
  load,
  getInfo,
  play,
  pause,
  seek,
  setProgram,
  setDate,
} = require("./audio");
const { updatePopups } = require("./updatePopups");
const { toBackground } = require("../common/commands");

const commandMap = {
  [toBackground.opened]: () => {
    updatePopups();
  },

  [toBackground.selected]: (uri) => {
    load(uri);
  },

  [toBackground.play]: () => {
    play();
  },

  [toBackground.pause]: () => {
    pause();
  },

  [toBackground.seek]: (timeToSeekOffset) => {
    const { duration } = getInfo();
    if (duration) {
      const timeToSeek = timeToSeekOffset * duration;
      seek(timeToSeek);
    }
  },

  [toBackground.selectedProgram]: (program) => {
    setProgram(program);
  },

  [toBackground.selectedDate]: (date) => {
    setDate(date);
  },
};

const listenToAudioCommands = () => {
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
  listenToAudioCommands,
};
