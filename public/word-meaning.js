document.addEventListener("DOMContentLoaded", async () => {
  const storyElement = document.getElementById("story");
  const popup = document.getElementById("popup");
  const wordSpan = document.getElementById("popup-word");
  const meaningP = document.getElementById("popup-meaning");
  const spinner = document.getElementById("spinner");
  const speakButton = document.getElementById("speak-button");

  const urlParams = new URLSearchParams(window.location.search);
  const storyId = urlParams.get("storyId");

  if (!storyId) {
    storyElement.innerHTML = "<p>Error: No story selected.</p>";
    return;
  }

  // Fetch and display the story
  try {
    const response = await fetch(`/api/content/${storyId}`);
    const data = await response.json();
    const words = data.body.split(" ");
    storyElement.innerHTML = words.map(word => `<span class="word">${word}</span>`).join(" ");
  } catch (error) {
    console.error("Error fetching story:", error);
  }

  let timeout;
  const audioCache = {}; // Cache audio URLs

  const fetchWordMeaning = async (word, target) => {
    try {
      positionPopup(target);
      popup.style.display = "block";
      wordSpan.innerText = word;
      meaningP.innerText = "";
      spinner.classList.remove("hidden");
      speakButton.classList.add("hidden");

      const response = await fetch("/api/ai/word-meaning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word, storyId })
      });

      const data = await response.json();
      spinner.classList.add("hidden");

      if (data.error) {
        console.error("Error:", data.error);
        meaningP.innerText = "Meaning not found!";
        return;
      }

      meaningP.innerText = data.meaning;
      speakButton.classList.remove("hidden");

      // Auto-play audio
      playAudio(data.meaning);

      // Replay on click
      speakButton.onclick = () => {
        if (audioCache[data.meaning]) {
          playCachedAudio(audioCache[data.meaning]);
        } else {
          playAudio(data.meaning);
        }
      };
    } catch (error) {
      console.error("Error fetching word meaning:", error);
      meaningP.innerText = "Failed to load meaning.";
      spinner.classList.add("hidden");
    }
  };

  const positionPopup = (target) => {
    const rect = target.getBoundingClientRect();
    const popupHeight = popup.offsetHeight;
    const popupWidth = popup.offsetWidth;
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    let left = rect.left + window.scrollX + rect.width / 2 - popupWidth / 2;
    let top = rect.top + window.scrollY - popupHeight - 10;

    if (left + popupWidth > screenWidth) left = screenWidth - popupWidth - 10;
    if (left < 10) left = 10;
    if (top < 10) top = rect.bottom + window.scrollY + 10;

    popup.style.left = `${left}px`;
    popup.style.top = `${top}px`;
  };

  const playAudio = async (text) => {
    try {
      const response = await fetch('/api/ai/audio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ text }),
      });

      if (!response.ok) throw new Error('Failed to fetch audio');

      const { message, url } = await response.json();

      console.log('🎧 Audio message:', message);
      console.log('🎧 Audio URL:', url);

      if (message !== "Returned from cache") {
        audioCache[text] = url;
      }

      playCachedAudio(url);

    } catch (error) {
      console.error('🔴 Audio playback failed:', error);
    }
  };

  const playCachedAudio = (url) => {
    console.log("🔊 Playing audio from:", url);

    let audio = document.getElementById("popup-audio");
    if (!audio) {
      audio = document.createElement("audio");
      audio.id = "popup-audio";
      audio.hidden = true;
      document.body.appendChild(audio);
    }

    audio.src = url;
    audio.load();

    audio.oncanplaythrough = () => {
      audio.play().catch(err => {
        console.warn("⚠️ Autoplay blocked by browser:", err);
      });
    };

    audio.onerror = (e) => {
      console.error("❌ Failed to load audio:", e);
    };
  };

  // Handle long-press on words
  const startTimeout = (event) => {
    const target = event.target;
    if (!target.classList.contains("word")) return;

    const word = target.innerText;
    timeout = setTimeout(() => fetchWordMeaning(word, target), 800);
  };

  const cancelTimeout = () => {
    clearTimeout(timeout);
  };

  storyElement.addEventListener("mousedown", startTimeout);
  storyElement.addEventListener("touchstart", startTimeout);
  storyElement.addEventListener("mouseup", cancelTimeout);
  storyElement.addEventListener("touchend", cancelTimeout);
  storyElement.addEventListener("touchmove", cancelTimeout);

  // Hide popup on outside click
  document.addEventListener("click", (event) => {
    if (
      !event.target.classList.contains("word") &&
      !popup.contains(event.target)
    ) {
      popup.style.display = "none";
    }
  });
});
