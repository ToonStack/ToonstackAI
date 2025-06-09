document.addEventListener("DOMContentLoaded", async () => {
    //const API_URL = "https://shiny-rotary-phone-j7vgppw77xcw5-3000.app.github.dev/api/content"
    const API_URL = "https://toonstack-ai-web-api-dev-adczcmgjeddabpd3.canadacentral-01.azurewebsites.net/api/content/stories";

    const container = document.getElementById("story-container");
    container.innerHTML = "<p>Loading stories...</p>";

    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Failed to fetch stories");
        
        const stories = await response.json(); // Assuming API returns an array of story objects

        container.innerHTML = ""; // Clear loading text

        stories.forEach(story => {
            const card = document.createElement("div");
            card.classList.add("story-card");
            card.innerHTML = `
                <img src="${story.img}" alt="${story.title}" class="story-img">
                <h3>${story.title}</h3>
                <p>${story.body.split(" ").slice(0, 10).join(" ") + "..."}</p>
                <button onclick="viewStory('${story._id}')">Read More</button>
            `;
            container.appendChild(card);
        });
    } catch (error) {
        container.innerHTML = `<p>Error loading stories: ${error.message}</p>`;
        console.error(error);
    }
});
function viewStory(storyId) {
    console.log("Story ID:", storyId);
    window.location.href = `https://shiny-rotary-phone-j7vgppw77xcw5-3000.app.github.dev/word-meaning?storyId=${storyId}`;
}
