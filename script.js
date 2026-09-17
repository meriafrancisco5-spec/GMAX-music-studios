let audioContext;
let beatAudio;
let beatSource;
let beatGain;
let vocalGain;

let mediaRecorder;
let recordedChunks = [];
let vocalBlob;
let vocalURL;

const beatFile = document.getElementById("beatFile");
const beatName = document.getElementById("beatName");

const startRecord = document.getElementById("startRecord");
const stopRecord = document.getElementById("stopRecord");
const recordStatus = document.getElementById("recordStatus");

const beatVolume = document.getElementById("beatVolume");
const vocalVolume = document.getElementById("vocalVolume");

const playMix = document.getElementById("playMix");
const stopMix = document.getElementById("stopMix");

const exportSong = document.getElementById("exportSong");
const exportStatus = document.getElementById("exportStatus");
const downloadLink = document.getElementById("downloadLink");

function setupAudio() {
  if (audioContext) return;

  audioContext = new (
    window.AudioContext ||
    window.webkitAudioContext
  )();

  beatGain = audioContext.createGain();
  vocalGain = audioContext.createGain();

  beatGain.connect(audioContext.destination);
  vocalGain.connect(audioContext.destination);
}

function updateVolumes() {
  if (!audioContext) return;

  beatGain.gain.value =
    Number(beatVolume.value) / 100;

  vocalGain.gain.value =
    Number(vocalVolume.value) / 100;
}

beatFile.addEventListener("change", function () {

  const file = beatFile.files[0];

  if (!file) return;

  setupAudio();

  beatName.textContent =
    "Beat: " + file.name;

  if (beatAudio) {
    beatAudio.pause();
  }

  const url = URL.createObjectURL(file);

  beatAudio = new Audio(url);
  beatAudio.loop = false;

  beatSource =
    audioContext.createMediaElementSource(beatAudio);

  beatSource.connect(beatGain);

  updateVolumes();
});

startRecord.addEventListener("click", async function () {

  try {

    setupAudio();

    if (audioContext.state === "suspended") {
      await audioContext.resume();
    }

    const stream =
      await navigator.mediaDevices.getUserMedia({
        audio: true
      });

    recordedChunks = [];

    mediaRecorder =
      new MediaRecorder(stream);

    mediaRecorder.ondataavailable = function (event) {

      if (event.data.size > 0) {
        recordedChunks.push(event.data);
      }

    };

    mediaRecorder.onstop = function () {

      vocalBlob =
        new Blob(
          recordedChunks,
          { type: "audio/webm" }
        );

      vocalURL =
        URL.createObjectURL(vocalBlob);

      recordStatus.textContent =
        "✅ Vocal recording ready";

    };

    mediaRecorder.start();

    startRecord.disabled = true;
    stopRecord.disabled = false;

    recordStatus.textContent =
      "🔴 Recording...";

  } catch (error) {

    recordStatus.textContent =
      "❌ Microphone permission denied.";

  }

});

stopRecord.addEventListener("click", function () {

  if (mediaRecorder) {
    mediaRecorder.stop();
  }

  startRecord.disabled = false;
  stopRecord.disabled = true;

});

playMix.addEventListener("click", async function () {

  if (!beatAudio) {
    alert("Please add a beat first.");
    return;
  }

  setupAudio();
  updateVolumes();

  if (audioContext.state === "suspended") {
    await audioContext.resume();
  }

  beatAudio.currentTime = 0;
  beatAudio.play();

  if (vocalURL) {

    const vocalAudio =
      new Audio(vocalURL);

    const vocalSource =
      audioContext.createMediaElementSource(
        vocalAudio
      );

    vocalSource.connect(vocalGain);

    vocalAudio.play();

  }

});

stopMix.addEventListener("click", function () {

  if (beatAudio) {
    beatAudio.pause();
    beatAudio.currentTime = 0;
  }

});

beatVolume.addEventListener(
  "input",
  updateVolumes
);

vocalVolume.addEventListener(
  "input",
  updateVolumes
);

exportSong.addEventListener("click", async function () {

  if (!beatAudio) {
    exportStatus.textContent =
      "❌ Add a beat first.";
    return;
  }

  if (!vocal
<button id="startRecording">🔴 Start Recording</button>

<button id="stopRecording">⏹ Stop Recording</button>

<p id="recordingStatus">Ready</p 
