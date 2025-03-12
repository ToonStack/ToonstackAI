document.addEventListener("DOMContentLoaded", async () => {
    const storyElement = document.getElementById("story");
    const popup = document.getElementById("popup");
    const wordSpan = document.getElementById("popup-word");
    const meaningP = document.getElementById("popup-meaning");

    const storyId = "67d19d7af9dea91949d338b2";

    // Fetch and display the story
    try {
        const response = await fetch("https://shiny-rotary-phone-j7vgppw77xcw5-3000.app.github.dev/api/content/67d19d7af9dea91949d338b2");
        const data = await response.json();
        const words = data.body.split(" ");
        storyElement.innerHTML = words.map(word => `<span class="word">${word}</span>`).join(" ");
    } catch (error) {
        console.error("Error fetching story:", error);
    }

    let timeout;

// Fetch word meaning
const fetchWordMeaning = async (word, x, y) => {
    try {
        // Show popup and spinner while loading
        popup.style.display = "block";
        wordSpan.innerText = word;
        meaningP.innerText = ""; // Clear previous meaning
        const spinner = document.getElementById("spinner");
        spinner.classList.remove("hidden");

        // Fetch meaning
        const response = await fetch("https://shiny-rotary-phone-j7vgppw77xcw5-3000.app.github.dev/api/content/word-meaning", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ word, storyId })
        });

        const data = await response.json();

        // Hide spinner after fetching
        spinner.classList.add("hidden");

        if (data.error) {
            console.error("Error:", data.error);
            meaningP.innerText = "Meaning not found!";
            return;
        }

        // Display meaning
        meaningP.innerText = data.meaning;

        // Adjust position to stay in viewport
        let left = x;
        let top = y;

        if (left + popup.offsetWidth > window.innerWidth) {
            left = window.innerWidth - popup.offsetWidth - 10; // Adjust if overflowing right
        }
        if (top + popup.offsetHeight > window.innerHeight) {
            top = window.innerHeight - popup.offsetHeight - 10; // Adjust if overflowing bottom
        }

        popup.style.left = `${left}px`;
        popup.style.top = `${top}px`;
    } catch (error) {
        console.error("Error fetching word meaning:", error);
        meaningP.innerText = "Failed to load meaning.";
        document.getElementById("spinner").classList.add("hidden"); // Ensure spinner hides on failure
    }
};

    // Start timeout for long press
    const startTimeout = (event, word) => {
        const x = event.pageX || event.touches[0].pageX;
        const y = event.pageY || event.touches[0].pageY;

        timeout = setTimeout(() => fetchWordMeaning(word, x, y), 1000);
    };

    // Handle touch and click events without blocking scrolling
    const handleEvent = (event) => {
        if (event.target.classList.contains("word")) {
            const word = event.target.innerText;
            startTimeout(event, word);
        }
    };

    // Only prevent default on long-press, not short taps
    storyElement.addEventListener("mousedown", handleEvent);
    storyElement.addEventListener("touchstart", (event) => {
        if (event.target.classList.contains("word")) {
            startTimeout(event, event.target.innerText);
        }
    });

    // Cancel timeout if user releases before timeout
    const cancelTimeout = () => clearTimeout(timeout);
    storyElement.addEventListener("mouseup", cancelTimeout);
    storyElement.addEventListener("touchend", cancelTimeout);
    storyElement.addEventListener("touchmove", cancelTimeout); // Allow scrolling

    // Hide popup when clicking outside
    document.addEventListener("click", (event) => {
        if (!event.target.classList.contains("word")) {
            popup.style.display = "none";
        }
    });
});
