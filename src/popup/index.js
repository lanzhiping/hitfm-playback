const { buildMessage, toBackground } = require("../common/commands");

const today = new Date();
const oneDayOffset = 24 * 60 * 60 * 1000;
const chinaTimeOffset = 8 * 60 * 60 * 1000;
const datesEle = document.querySelector("#dates");
const programsEle = document.querySelector("#programs");
const audioEle = document.querySelector("#audio-container");

const port = chrome.extension.connect({
  name: "Sample Communication",
});

const renderDates = () => {
  const datesStr = [
    new Date(today.getTime() + chinaTimeOffset).toISOString().split("T")[0],
    new Date(today.getTime() - oneDayOffset + chinaTimeOffset)
      .toISOString()
      .split("T")[0],
    new Date(today.getTime() - oneDayOffset * 2 + chinaTimeOffset)
      .toISOString()
      .split("T")[0],
    new Date(today.getTime() - oneDayOffset * 3 + chinaTimeOffset)
      .toISOString()
      .split("T")[0],
    new Date(today.getTime() - oneDayOffset * 4 + chinaTimeOffset)
      .toISOString()
      .split("T")[0],
    new Date(today.getTime() - oneDayOffset * 5 + chinaTimeOffset)
      .toISOString()
      .split("T")[0],
  ];

  const datesItems = datesStr
    .map(
      (dateStr) => `
      <div class="date" data-attr="${dateStr}">${dateStr}</div>
    `
    )
    .join("");
  datesEle.innerHTML = datesItems;
};

const buildUriFromDateAndProgram = (date, program) => {
  const programToTimeMap = {
    "hit music flow": "000000_060000",
    "morning hits": "060000_070000",
    "hit morning call": "070000_100000",
    "at work network": "100000_130000",
    "lazy afternoon": "130000_160000",
    "big drive home": "160000_190000",
    "new music express": "190000_220000",
    "hit fm dance": "220000_230000",
  };
  const programLowercase = program.toLowerCase();
  const programParam = programToTimeMap[programLowercase];
  const programStartHour = programParam.split("0000_")[0];
  const dateParam = date.replace(/-/g, "");

  return date <
    new Date(today.getTime() + chinaTimeOffset).toISOString().split("T")[0] ||
    programStartHour < today.getHours()
    ? `https://lcache.qtfm.cn/cache/${dateParam}/1007/1007_${dateParam}_${programParam}_24_0.m4a`
    : null;
};

const renderPrograms = (date) => {
  const programs = [
    "Hit Music Flow",
    "Morning Hits",
    "Hit Morning Call",
    "At Work Network",
    "Lazy Afternoon",
    "Big Drive Home",
    "New Music Express",
    "Hit FM Dance",
  ];

  const programItems = programs
    .map((programStr) => {
      const uri = buildUriFromDateAndProgram(date, programStr);
      return uri
        ? `<div class="program" data-attr="${uri}">${programStr}</div>`
        : `<span></span>`;
    })
    .join("");
  programsEle.innerHTML = programItems;
};

const registerDatesClickEvent = () => {
  datesEle.addEventListener("click", (event) => {
    const target = event.target;
    const date = target.getAttribute("data-attr");

    if (!target.classList.contains("date")) {
      return;
    }

    const currentSelectTarget = datesEle.querySelector(".selected");
    if (target === currentSelectTarget) {
      return;
    }

    Array.from(datesEle.querySelectorAll(".date")).map((dateEle) => {
      dateEle.classList.remove("selected");
    });

    target.classList.add("selected");
    renderPrograms(date);

    port.postMessage(buildMessage(toBackground.selectedDate, date));
  });
};

const registerProgramsClickEvents = () => {
  programsEle.addEventListener("click", async (event) => {
    const target = event.target;
    const uri = target.getAttribute("data-attr");

    if (!target.classList.contains("program")) {
      return;
    }

    const currentSelectTarget = programsEle.querySelector(".selected");
    if (target === currentSelectTarget) {
      return;
    }

    Array.from(programsEle.querySelectorAll(".program")).map((programEle) => {
      programEle.classList.remove("selected");
    });
    target.classList.add("selected");

    port.postMessage(buildMessage(toBackground.selected, uri));
    port.postMessage(
      buildMessage(toBackground.selectedProgram, target.innerText)
    );
  });
};

const registerAudioEvents = () => {
  audioEle.addEventListener("click", (event) => {
    const target = event.target;

    if (target.classList.contains("toggle-play")) {
      const isPlaying = target.classList.contains("pause");

      if (isPlaying) {
        port.postMessage(buildMessage(toBackground.pause));
      } else {
        port.postMessage(buildMessage(toBackground.play));
      }
      return;
    }

    if (target.classList.contains("timeline")) {
      const timelineWidth = window.getComputedStyle(target).width;
      const timeToSeek = event.offsetX / parseInt(timelineWidth);

      port.postMessage(buildMessage(toBackground.seek, timeToSeek));
      return;
    }
  });
};

renderDates();
registerDatesClickEvent();
registerProgramsClickEvents();
registerAudioEvents();

port.postMessage(buildMessage(toBackground.opened));
