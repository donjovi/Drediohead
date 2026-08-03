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

// Reads ?listener=something from the shared link.
const params = new URLSearchParams(window.location.search);
const listener = params.get("listener") || "general";

let currentTrackIndex = 0;
let hasLoadedTrack = false;
let playMethod = "unknown";
let milestonesReached = new Set();

function sendAnalytics(eventName, details = {}) {
  if (typeof gtag !== "function") return;

  gtag("event", eventName, {
    listener_code: listener,
    ...details
  });
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return "0:00";

  const minutes = Math.floor(seconds / 60);
  const remaining = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");

  return `${minutes}:${remaining}`;
}

function getCurrentTrack() {
  return tracks[currentTrackIndex];
}

function renderTrackList() {
  trackList.innerHTML = "";

  trackCount.textContent =
    `${tracks.length} track${tracks.length === 1 ? "" : "s"}`;

  tracks.forEach((track, index) => {
    const item = document.createElement("li");
    const button = document.createElement("button");

    button.className = "track";
    button.type = "button";
    button.dataset.index = index;

    button.innerHTML = `
      <span class="track-number">
        ${String(index + 1).padStart(2, "0")}
      </span>

      <span>
        <span class="track-title">${track.title}</span>
        <span class="track-meta">
          ${track.artist || "DREdiohead"}
        </span>
      </span>

      <span class="track-duration" id="duration-${index}">
        —:—
      </span>
    `;

    button.addEventListener("click", () => {
      playMethod = "track_list";
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

      if (label) {
        label.textContent = formatTime(probe.duration);
      }
    });
  });
}

function updateActiveTrack() {
  document.querySelectorAll(".track").forEach((button, index) => {
    button.classList.toggle(
      "active",
      index === currentTrackIndex && hasLoadedTrack
    );
  });
}

function loadTrack(index) {
  if (!tracks.length) return;

  currentTrackIndex = (index + tracks.length) % tracks.length;

  const track = getCurrentTrack();

  audio.src = track.file;
  trackTitle.textContent = track.title;
  trackArtist.textContent = track.artist || "DREdiohead";

  seekBar.value = 0;
  currentTimeLabel.textContent = "0:00";
  durationLabel.textContent = "0:00";

  milestonesReached = new Set();
  hasLoadedTrack = true;

  updateActiveTrack();
}

function togglePlayback() {
  if (!tracks.length) return;

  if (!hasLoadedTrack) {
    playMethod = "main_play_button";
    loadTrack(currentTrackIndex);
  }

  if (audio.paused) {
    playMethod = "main_play_button";
    audio.play().catch(() => {});
  } else {
    audio.pause();
  }
}

playButton.addEventListener("click", togglePlayback);

prevButton.addEventListener("click", () => {
  playMethod = "previous_button";
  loadTrack(currentTrackIndex - 1);
  audio.play().catch(() => {});
});

nextButton.addEventListener("click", () => {
  playMethod = "next_button";
  loadTrack(currentTrackIndex + 1);
  audio.play().catch(() => {});
});

audio.addEventListener("play", () => {
  playButton.textContent = "❚❚";
  playButton.setAttribute("aria-label", "Pause");

  const track = getCurrentTrack();

  sendAnalytics("track_play", {
    track_name: track.title,
    track_number: currentTrackIndex + 1,
    play_method: playMethod
  });
});

audio.addEventListener("pause", () => {
  playButton.textContent = "▶";
  playButton.setAttribute("aria-label", "Play");

  if (!hasLoadedTrack || audio.ended) return;

  const track = getCurrentTrack();

  sendAnalytics("track_pause", {
    track_name: track.title,
    track_number: currentTrackIndex + 1,
    listened_seconds: Math.round(audio.currentTime)
  });
});

audio.addEventListener("loadedmetadata", () => {
  durationLabel.textContent = formatTime(audio.duration);
});

audio.addEventListener("timeupdate", () => {
  currentTimeLabel.textContent = formatTime(audio.currentTime);

  if (!audio.duration) return;

  const percentage = (audio.currentTime / audio.duration) * 100;
  seekBar.value = percentage;

  [25, 50, 75, 90].forEach((milestone) => {
    if (
      percentage >= milestone &&
      !milestonesReached.has(milestone)
    ) {
      milestonesReached.add(milestone);

      const track = getCurrentTrack();

      sendAnalytics("track_progress", {
        track_name: track.title,
        track_number: currentTrackIndex + 1,
        progress_percent: milestone
      });
    }
  });
});

audio.addEventListener("ended", () => {
  const completedTrack = getCurrentTrack();

  sendAnalytics("track_complete", {
    track_name: completedTrack.title,
    track_number: currentTrackIndex + 1
  });

  playMethod = "automatic_next";
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

sendAnalytics("listener_visit", {
  page_title: document.title
});

renderTrackList();
