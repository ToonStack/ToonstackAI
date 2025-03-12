document.addEventListener("DOMContentLoaded", () => {
    const storyElement = document.getElementById("story");

    // Fetch the story from an API
    fetch("/api/story")
        .then(response => response.json())
        .then(data => {
            storyElement.innerHTML = data.story; // Load story into the page
        });

    let timeout;
    storyElement.addEventListener("mousedown", (event) => {
        if (event.target.tagName === "SPAN") {
            timeout = setTimeout(() => {
                fetch(`/api/word-meaning?word=${event.target.textContent}`)
                    .then(response => response.json())
                    .then(data => {
                        document.getElementById("popup-word").textContent = data.word;
                        document.getElementById("popup-meaning").textContent = data.meaning;
                        document.getElementById("popup").style.display = "block";
                    });
            }, 2000); // Hold for 2 seconds
        }
    });

    storyElement.addEventListener("mouseup", () => {
        clearTimeout(timeout);
    });
});
