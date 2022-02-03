let audio;
let date;
let program;

const createAudio = (uri) => {
  audio = new Audio(uri);
  audio.controls = true;

  return new Promise((resolve) => {
    audio.addEventListener("loadeddata", () => {
      audio.play();
      resolve(audio);
    });
  });
};

const cleanUp = () => {
  audio.pause();
  audio.src = "";
  audio.load();

  audio = null;
};

module.exports = {
  play: () => {
    if (audio) {
      audio.play();
    }
  },

  pause: () => {
    if (audio) {
      audio.pause();
    }
  },

  getInfo: () => {
    return {
      inited: !!audio,
      isPlaying: audio && !audio.paused,
      duration: audio && audio.duration,
      currentTime: audio && audio.currentTime,
      date: audio && date,
      program: audio && program,
    };
  },

  load: (uri) => {
    if (audio) {
      cleanUp();
    }
    return createAudio(uri);
  },

  seek: (timeToSeek) => {
    if (audio) {
      audio.currentTime = timeToSeek;
    }
  },

  setProgram: (selectedProgram) => {
    program = selectedProgram;
  },

  setDate: (selectedDate) => {
    date = selectedDate;
  },
};
