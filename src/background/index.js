const { toBackground } = require("../common/commands");
const {
  load,
  getInfo,
  play,
  pause,
  seek,
  setProgram,
  setDate,
} = require("./audio");
const { onCommand } = require("./onCommand");
const { showPageAction } = require("./showPageAction");

const updatePopups = () => {
  const views = chrome.extension.getViews({
    type: "popup",
  });

  const popups = views.map(({ document }) => ({
    togglePlay: document.querySelector("#audio-container .toggle-play"),
    progressBar: document.querySelector("#audio-container .progress"),
    current: document.querySelector("#audio-container .time .current"),
    length: document.querySelector("#audio-container .time .length"),
    name: document.querySelector("#audio-container .name"),
    dates: document.querySelector("#dates"),
    programs: document.querySelector("#programs"),
  }));

  setInterval(() => {
    const { inited, isPlaying, duration, currentTime, program, date } =
      getInfo();
    if (!inited) {
      return;
    }

    popups.forEach(
      ({ togglePlay, progressBar, current, length, name, dates, programs }) => {
        if (isPlaying) {
          togglePlay.classList.remove("play");
          togglePlay.classList.add("pause");
        } else {
          togglePlay.classList.remove("pause");
          togglePlay.classList.add("play");
        }

        if (date) {
          Array.from(dates.querySelectorAll(".date")).forEach((dateEle) => {
            if (dateEle.getAttribute("data-attr") === date) {
              dateEle.click();
            } else {
              dateEle.classList.remove("selected");
            }
          });
        }

        if (program) {
          Array.from(programs.querySelectorAll(".program")).forEach(
            (programEle) => {
              if (programEle.innerText === program) {
                programEle.classList.add("selected");
              } else {
                programEle.classList.remove("selected");
              }
            }
          );
        }

        progressBar.style.width = (currentTime / duration) * 100 + "%";
        current.textContent = getTimeCodeFromNum(currentTime);
        length.textContent = getTimeCodeFromNum(duration);
        name.innerText = program;
      }
    );
  }, 500);
};

function getTimeCodeFromNum(num) {
  let seconds = parseInt(num);
  let minutes = parseInt(seconds / 60);
  seconds -= minutes * 60;
  const hours = parseInt(minutes / 60);
  minutes -= hours * 60;

  if (hours === 0) return `${minutes}:${String(seconds % 60).padStart(2, 0)}`;
  return `${String(hours).padStart(2, 0)}:${minutes}:${String(
    seconds % 60
  ).padStart(2, 0)}`;
}

chrome.runtime.onInstalled.addListener(() => {
  showPageAction();
});

chrome.runtime.onStartup.addListener(() => {
  onCommand({
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
  });
});
