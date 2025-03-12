document.addEventListener("DOMContentLoaded", async () => {
    const storyElement = document.getElementById("story");
    const popup = document.getElementById("popup");
    const wordSpan = document.getElementById("popup-word");
    const meaningP = document.getElementById("popup-meaning");

    const storyId = "67d19d7af9dea91949d338b2";

    // Fetch and display the story from API
    try {
        const response = await fetch("https://shiny-rotary-phone-j7vgppw77xcw5-3000.app.github.dev/api/content/67d19d7af9dea91949d338b2");
        const data = await response.json();
        const words = data.body.split(" ");
        storyElement.innerHTML = words.map(word => `<span class="word">${word}</span>`).join(" ");
    } catch (error) {
        console.error("Error fetching story:", error);
    }

    let timeout;

    // Handle word click-and-hold for 2 seconds
    storyElement.addEventListener("mousedown", event => {
        if (event.target.classList.contains("word")) {
            const word = event.target.innerText;

            timeout = setTimeout(async () => {
                try {
                    const response = await fetch("https://shiny-rotary-phone-j7vgppw77xcw5-3000.app.github.dev/api/content/word-meaning", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ word, storyId })
                    });

                    const data = await response.json();
                    if (data.error) {
                        console.error("Error:", data.error);
                        return;
                    }

                    console.log(data.meaning);

                    // Display meaning in popup
                    wordSpan.innerText = word;
                    meaningP.innerText = data.meaning;

                    popup.style.left = `${event.clientX}px`;
                    popup.style.top = `${event.clientY + window.scrollY}px`;
                    popup.style.display = "block";  // FIX: Make popup visible
                } catch (error) {
                    console.error("Error fetching word meaning:", error);
                }
            }, 2000); // 2 seconds hold
        }
    });

    // Cancel timeout on mouseup
    storyElement.addEventListener("mouseup", () => {
        clearTimeout(timeout);
    });

    // Hide popup on click outside
    document.addEventListener("click", event => {
        if (!event.target.classList.contains("word")) {
            popup.style.display = "none";  // FIX: Hide the popup properly
        }
    });
});
