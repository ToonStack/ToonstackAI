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
        const response = await fetch(`https://shiny-rotary-phone-j7vgppw77xcw5-3000.app.github.dev/api/content/${storyId}`);
        const data = await response.json();
        const words = data.body.split(" ");
        storyElement.innerHTML = words.map(word => `<span class="word">${word}</span>`).join(" ");
    } catch (error) {
        console.error("Error fetching story:", error);
    }

    let timeout;

    // Fetch word meaning
    const fetchWordMeaning = async (word, target) => {
        try {
            // Position popup immediately before fetching
            positionPopup(target);
            
            // Show popup and spinner while loading
            popup.style.display = "block";
            wordSpan.innerText = word;
            meaningP.innerText = ""; // Clear previous meaning
            spinner.classList.remove("hidden");

            // Fetch meaning
            const response = await fetch("https://shiny-rotary-phone-j7vgppw77xcw5-3000.app.github.dev/api/content/word-meaning", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ word, storyId })
            });

            const data = await response.json();
            spinner.classList.add("hidden"); // Hide spinner after fetching

            if (data.error) {
                console.error("Error:", data.error);
                meaningP.innerText = "Meaning not found!";
                return;
            }

            // Display meaning
            meaningP.innerText = data.meaning;
            //speakButton.style.display = "block"; // Show the speak button

            // Set the text to be spoken
            // speakButton.onclick = () => 
            //speakText(data.meaning);

        } catch (error) {
            console.error("Error fetching word meaning:", error);
            meaningP.innerText = "Failed to load meaning.";
            spinner.classList.add("hidden"); // Ensure spinner hides on failure
        }
    };

    // Function to position popup
    const positionPopup = (target) => {
        const rect = target.getBoundingClientRect();
        const popupHeight = popup.offsetHeight;
        const popupWidth = popup.offsetWidth;
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;

        let left = rect.left + window.scrollX + rect.width / 2 - popupWidth / 2; // Center horizontally
        let top = rect.top + window.scrollY - popupHeight - 10; // Position above

        // Prevent overflow adjustments
        if (left + popupWidth > screenWidth) {
            left = screenWidth - popupWidth - 10;
        }
        if (left < 10) {
            left = 10;
        }

        // If there's no space above, show below
        if (top < 10) {
            top = rect.bottom + window.scrollY + 10;
        }

        popup.style.left = `${left}px`;
        popup.style.top = `${top}px`;
    };

    // Start timeout for long press
    const startTimeout = (event) => {
        const target = event.target;
        if (!target.classList.contains("word")) return;

        const word = target.innerText;
        timeout = setTimeout(() => fetchWordMeaning(word, target), 800);
    };

    // Prevent accidental long-press while scrolling
    const cancelTimeout = () => clearTimeout(timeout);

    storyElement.addEventListener("mousedown", startTimeout);
    storyElement.addEventListener("touchstart", startTimeout);
    storyElement.addEventListener("mouseup", cancelTimeout);
    storyElement.addEventListener("touchend", cancelTimeout);
    storyElement.addEventListener("touchmove", cancelTimeout); // Allow scrolling

    // Hide popup when clicking outside
    document.addEventListener("click", (event) => {
        if (!event.target.classList.contains("word")) {
            popup.style.display = "none";
        }
    });

    //     // Speak the meaning using Web Speech API
    // const speakText = (text) => {
    //     const utterance = new SpeechSynthesisUtterance(text);
    //     utterance.lang = "en-US";
    //     utterance.rate = 1.0; // Normal speed
    //     speechSynthesis.speak(utterance);
    //  };
});
