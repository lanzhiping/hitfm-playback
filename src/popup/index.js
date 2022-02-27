const dayjs = require("dayjs");
const md5 = require('crypto-js/hmac-md5');

const {
  weekdayPlaylist,
  sundayPlaylist,
  saturdayPlaylist,
} = require("./playlist");
const { updateBackground } = require("./updateBackground");
const { sendEvent } = require("./googleAnalytics");
const { toBackground } = require("../common/commands");

const datesEle = document.querySelector("#dates");
const programsEle = document.querySelector("#programs");
const audioEle = document.querySelector("#audio-container");

const renderDates = () => {
  const datesStr = [
    dayjs().format("YYYY-MM-DD"),
    dayjs().subtract(1, "d").format("YYYY-MM-DD"),
    dayjs().subtract(2, "d").format("YYYY-MM-DD"),
    dayjs().subtract(3, "d").format("YYYY-MM-DD"),
    dayjs().subtract(4, "d").format("YYYY-MM-DD"),
    dayjs().subtract(5, "d").format("YYYY-MM-DD"),
  ];

  const datesItems = datesStr
    .map((date) => `<div class="date" data-attr="${date}">${date}</div>`)
    .join("");

  datesEle.innerHTML = datesItems;
};

const buildLiveUri = () => {
  const path = '/live/1007/64k.mp3';
  const timestamp = dayjs().add(1, 'hours').unix().toString(16);
  const sign = md5(`app_id=web&path=${encodeURIComponent(path)}&ts=${timestamp}`, 'Lwrpu$K5oP').toString();
  return `https://lhttp.qingting.fm${path}?app_id=web&ts=${timestamp}&sign=${sign}`;
};

const buildUri = (date, timeDuration) => {
  const dateParam = dayjs(date).format("YYYYMMDD");
  const [startHour, endHour] = timeDuration.split('_').map(s => s.replace('0000', ''));

  if (dayjs().isAfter(`${date} ${startHour}:00:00`)) {
    if (dayjs().isBefore(`${date} ${endHour}:00:00`)) {
      return 'live-uri';
    }
    return `https://lcache.qtfm.cn/cache/${dateParam}/1007/1007_${dateParam}_${timeDuration}_24_0.m4a`;
  }
  return null;
};

const renderPrograms = (date) => {
  const dayOfWeek = dayjs(date).get("d");
  const playlist =
    dayOfWeek === 0
      ? sundayPlaylist
      : dayOfWeek === 6
      ? saturdayPlaylist
      : weekdayPlaylist;
  const programs = Object.keys(playlist);

  const programItems = programs
    .map((program) => {
      const uri = buildUri(date, playlist[program]);

      return uri
        ? `<div class="program" data-attr="${uri}">${program}${uri === 'live-uri' ? '(live)' : ''}</div>`
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

    updateBackground(toBackground.selectedDate, date);

    sendEvent("click-date", date);
  });
};

const registerProgramsClickEvents = () => {
  programsEle.addEventListener("click", (event) => {
    const target = event.target;
    let uri = target.getAttribute("data-attr");

    if (uri === 'live-uri') {
      uri = buildLiveUri();
    }

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

    updateBackground(toBackground.selected, uri);
    updateBackground(toBackground.selectedProgram, target.innerText);

    sendEvent("click-program", target.innerText);
  });
};

const registerAudioEvents = () => {
  audioEle.addEventListener("click", (event) => {
    const target = event.target;

    if (target.classList.contains("toggle-play")) {
      const isPlaying = target.classList.contains("pause");

      if (isPlaying) {
        updateBackground(toBackground.pause);
        sendEvent("click-pause");
      } else {
        updateBackground(toBackground.play);
        sendEvent("click-play");
      }
      return;
    }

    if (
      target.classList.contains("timeline") ||
      target.classList.contains("progress")
    ) {
      const timelineWidth = window.getComputedStyle(target.parentElement).width;
      const timeToSeek = event.offsetX / parseInt(timelineWidth);

      updateBackground(toBackground.seek, timeToSeek);
      sendEvent("click-timeline");
      return;
    }
  });
};

renderDates();
registerDatesClickEvent();
registerProgramsClickEvents();
registerAudioEvents();

updateBackground(toBackground.opened);
