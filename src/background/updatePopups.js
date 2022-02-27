const { getInfo } = require("./audio");

function parseSecondsToHMS(num) {
  let seconds = parseInt(num);

  if (Number.isNaN(seconds)) {
    return '00:00';
  }

  let minutes = parseInt(seconds / 60);
  const hours = parseInt(minutes / 60);
  seconds -= minutes * 60;
  minutes -= hours * 60;

  const toTwoDigits = (num) => String(num).padStart(2, 0);

  return hours === 0
    ? `${minutes}:${toTwoDigits(seconds)}`
    : `${hours}:${toTwoDigits(minutes)}:${toTwoDigits(seconds)}`;
}

const updatePlayingStatus = (elements, isPlaying) => {
  if (isPlaying) {
    elements.togglePlay.classList.remove("play");
    elements.togglePlay.classList.add("pause");
  } else {
    elements.togglePlay.classList.remove("pause");
    elements.togglePlay.classList.add("play");
  }
};

const updateSelectedDate = (elements, selectedDate) => {
  if (selectedDate) {
    const dateItems = Array.from(elements.dates.querySelectorAll(".date"));

    dateItems.forEach((dateEle) => {
      if (dateEle.getAttribute("data-attr") === selectedDate) {
        dateEle.click();
      } else {
        dateEle.classList.remove("selected");
      }
    });
  }
};

const updateSelectedProgram = (elements, selectedProgram) => {
  if (selectedProgram) {
    const programItems = Array.from(
      elements.programs.querySelectorAll(".program")
    );

    programItems.forEach((programEle) => {
      if (programEle.innerText === selectedProgram) {
        programEle.classList.add("selected");
      } else {
        programEle.classList.remove("selected");
      }
    });
  }
};

const updateProgressBar = (
  elements,
  currentTime,
  duration,
  selectedProgram
) => {
  elements.progressBar.style.width = (currentTime / duration) * 100 + "%";
  elements.current.innerText = parseSecondsToHMS(currentTime);
  elements.length.innerText = parseSecondsToHMS(duration || 0);
  elements.name.innerText = duration ? selectedProgram : "loading";
};

const updatePopups = () => {
  const popups = chrome.extension
    .getViews({
      type: "popup",
    })
    .map(({ document }) => ({
      togglePlay: document.querySelector("#audio-container .toggle-play"),
      progressBar: document.querySelector("#audio-container .progress"),
      current: document.querySelector("#audio-container .time .current"),
      length: document.querySelector("#audio-container .time .length"),
      name: document.querySelector("#audio-container .name"),
      dates: document.querySelector("#dates"),
      programs: document.querySelector("#programs"),
    }));

  setInterval(() => {
    const audioInfo = getInfo();

    if (!audioInfo.inited) {
      return;
    }

    popups.forEach((elements) => {
      updateSelectedDate(elements, audioInfo.date);
      updateSelectedProgram(elements, audioInfo.program);
      updatePlayingStatus(elements, audioInfo.isPlaying);
      updateProgressBar(
        elements,
        audioInfo.currentTime,
        audioInfo.duration,
        audioInfo.program
      );
    });
  }, 500);
};

module.exports = {
  updatePopups,
};
