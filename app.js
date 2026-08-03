const audio = document.getElementById("audio");
const playButton = document.getElementById("playButton");
const prevButton = document.getElementById("prevButton");
const nextButton = document.getElementById("nextButton");
const seekBar = document.getElementById("seekBar");
const volumeBar = document.getElementById("volumeBar");
const currentTimeLabel = document.getElementById("currentTime");
const durationLabel = document.getElementById("duration");
const trackTitle = document.getElementById("trackTitle");
const trackArtist = document.getElementById("trackArtist");
const trackList = document.getElementById("trackList");
const trackCount = document.getElementById("trackCount");

let currentTrackIndex = 0;
let hasLoadedTrack = false;

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remaining = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remaining}`;
}

function renderTrackList() {
  trackList.innerHTML = "";
  trackCount.textContent = `${tracks.length} track${tracks.length === 1 ? "" : "s"}`;

  tracks.forEach((track, index) => {
    const item = document.createElement("li");
    const button = document.createElement("button");
    button.className = "track";
    button.type = "button";
    button.dataset.index = index;
    button.innerHTML = `
      <span class="track-number">${String(index + 1).padStart(2, "0")}</span>
      <span>
        <span class="track-title">${track.title}</span>
        <span class="track-meta">${track.artist || "DREdiohead"}</span>
      </span>
      <span class="track-duration" id="duration-${index}">—:—</span>
    `;

    button.addEventListener("click", () => {
      loadTrack(index);
      audio.play().catch(() => {});
    });

    item.appendChild(button);
    trackList.appendChild(item);

    const probe = new Audio();
    probe.preload = "metadata";
    probe.src = track.file;
    probe.addEventListener("loadedmetadata", () => {
      const label = document.getElementById(`duration-${index}`);
      if (label) label.textContent = formatTime(probe.duration);
    });
  });
}

function updateActiveTrack() {
  document.querySelectorAll(".track").forEach((button, index) => {
    button.classList.toggle("active", index === currentTrackIndex && hasLoadedTrack);
  });
}

function loadTrack(index) {
  if (!tracks.length) return;
  currentTrackIndex = (index + tracks.length) % tracks.length;
  const track = tracks[currentTrackIndex];

  audio.src = track.file;
  trackTitle.textContent = track.title;
  trackArtist.textContent = track.artist || "DREdiohead";
  seekBar.value = 0;
  currentTimeLabel.textContent = "0:00";
  durationLabel.textContent = "0:00";
  hasLoadedTrack = true;
  updateActiveTrack();
}

function togglePlayback() {
  if (!tracks.length) return;
  if (!hasLoadedTrack) loadTrack(currentTrackIndex);

  if (audio.paused) {
    audio.play().catch(() => {});
  } else {
    audio.pause();
  }
}

playButton.addEventListener("click", togglePlayback);

prevButton.addEventListener("click", () => {
  loadTrack(currentTrackIndex - 1);
  audio.play().catch(() => {});
});

nextButton.addEventListener("click", () => {
  loadTrack(currentTrackIndex + 1);
  audio.play().catch(() => {});
});

audio.addEventListener("play", () => {
  playButton.textContent = "❚❚";
  playButton.setAttribute("aria-label", "Pause");
});

audio.addEventListener("pause", () => {
  playButton.textContent = "▶";
  playButton.setAttribute("aria-label", "Play");
});

audio.addEventListener("loadedmetadata", () => {
  durationLabel.textContent = formatTime(audio.duration);
});

audio.addEventListener("timeupdate", () => {
  currentTimeLabel.textContent = formatTime(audio.currentTime);
  if (audio.duration) {
    seekBar.value = (audio.currentTime / audio.duration) * 100;
  }
});

audio.addEventListener("ended", () => {
  loadTrack(currentTrackIndex + 1);
  audio.play().catch(() => {});
});

seekBar.addEventListener("input", () => {
  if (audio.duration) {
    audio.currentTime = (seekBar.value / 100) * audio.duration;
  }
});

volumeBar.addEventListener("input", () => {
  audio.volume = Number(volumeBar.value);
});

audio.volume = Number(volumeBar.value);
renderTrackList();
