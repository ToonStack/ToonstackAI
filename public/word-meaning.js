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
  let popupVisible = false;

  // Fetch word meaning and display popup
  const fetchWordMeaning = async (word, target) => {
    try {
      positionPopup(target);
      popup.style.display = "block";
      wordSpan.innerText = word;
      meaningP.innerText = "";
      spinner.classList.remove("hidden");
      speakButton.classList.add("hidden");

      popupVisible = true; // <== Mark visible to suppress premature hiding

      const response = await fetch("/api/content/word-meaning", {
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

      // Set up speak button click
      speakButton.onclick = () => playAudio(data.meaning);
    } catch (error) {
      console.error("Error fetching word meaning:", error);
      meaningP.innerText = "Failed to load meaning.";
      spinner.classList.add("hidden");
    }
  };

  // Position popup near the target word
  const positionPopup = (target) => {
    const rect = target.getBoundingClientRect();
    const popupHeight = popup.offsetHeight;
    const popupWidth = popup.offsetWidth;
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    let left = rect.left + window.scrollX + rect.width / 2 - popupWidth / 2;
    let top = rect.top + window.scrollY - popupHeight - 10;

    if (left + popupWidth > screenWidth) {
      left = screenWidth - popupWidth - 10;
    }
    if (left < 10) {
      left = 10;
    }
    if (top < 10) {
      top = rect.bottom + window.scrollY + 10;
    }

    popup.style.left = `${left}px`;
    popup.style.top = `${top}px`;
  };

  const playAudio = async (text) => {
    try {
      const response = await fetch('/api/audio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ text }),
      });

      if (!response.ok) throw new Error('Failed to fetch audio');

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      let audio = document.getElementById("popup-audio");
      if (!audio) {
        audio = document.createElement("audio");
        audio.id = "popup-audio";
        audio.hidden = true;
        document.body.appendChild(audio);
      }

      audio.src = audioUrl;
      audio.play();
    } catch (error) {
      console.error('Audio playback failed:', error);
    }
  };

  // Handle long-press on words
  const startTimeout = (event) => {
    const target = event.target;
    if (!target.classList.contains("word")) return;

    const word = target.innerText;
    popupVisible = false;
    timeout = setTimeout(() => fetchWordMeaning(word, target), 800);
  };

  const cancelTimeout = () => {
    clearTimeout(timeout);
    // Do NOT hide popup here — leave that to outside click handler
  };

  storyElement.addEventListener("mousedown", startTimeout);
  storyElement.addEventListener("touchstart", startTimeout);
  storyElement.addEventListener("mouseup", cancelTimeout);
  storyElement.addEventListener("touchend", cancelTimeout);
  storyElement.addEventListener("touchmove", cancelTimeout);

  // Only hide popup when clicking outside
  document.addEventListener("click", (event) => {
    if (
      !event.target.classList.contains("word") &&
      !popup.contains(event.target)
    ) {
      popup.style.display = "none";
      popupVisible = false;
    }
  });
});
