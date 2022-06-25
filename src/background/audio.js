const Hls = require("hls.js");

let player;
let date;
let program;

const createAudioPlayer = (uri) => {
  player = new Audio(uri);
  player.controls = true;

  return new Promise((resolve) => {
    player.addEventListener("loadeddata", () => {
      player.play();
      resolve(player);
    });
  });
};

const createStreamPlayer = (uri) => {
  const hls = new Hls();
  const video = document.createElement("video");
  hls.loadSource(uri);
  hls.attachMedia(video);
  video.autoplay = true;
  player = video;
};

const cleanUp = () => {
  player.pause();
  player.src = "";
  player.load();

  player = null;
};

module.exports = {
  getInfo: () => ({
    inited: !!player,
    date: player && date,
    program: player && program,
    duration: player && player.duration,
    currentTime: player && player.currentTime,
    isPlaying: player && !player.paused,
  }),

  play: () => {
    if (player) {
      player.play();
    }
  },

  pause: () => {
    if (player) {
      player.pause();
    }
  },

  load: (uri) => {
    if (player) {
      cleanUp();
    }

    return /.m3u8$/.test(uri)
      ? createStreamPlayer(uri)
      : createAudioPlayer(uri);
  },

  seek: (timeToSeek) => {
    if (player) {
      player.currentTime = timeToSeek;
    }
  },

  setProgram: (selectedProgram) => {
    program = selectedProgram;
  },

  setDate: (selectedDate) => {
    date = selectedDate;
  },
};
