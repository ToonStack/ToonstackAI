document.getElementById("send-button").addEventListener("click", async () => {
    const message = document.getElementById("user-message").value;
  
    if (!message.trim()) return;
  
    // Display user message
    displayMessage("You: " + message);
  
    // Show typing animation while waiting for the bot's response
    document.getElementById("typing-indicator").style.display = "block";
  
    try {
      // Send message to the backend
      const response = await fetch("https://shiny-rotary-phone-j7vgppw77xcw5-3000.app.github.dev/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: message }),  // Send 'query' instead of 'message'
      });
  
      const data = await response.json();
      const reply = data.response;
  
      // Hide typing animation
      document.getElementById("typing-indicator").style.display = "none";
  
      // Display bot response
      displayMessage("Toonstack: " + reply);
    } catch (error) {
      // Hide typing animation if there's an error
      document.getElementById("typing-indicator").style.display = "none";
      console.error("Error:", error);
      displayMessage("Toonstack: Sorry, something went wrong.");
    }
  
    // Clear input field
    document.getElementById("user-message").value = "";
  });
  
  function displayMessage(message) {
    const chatBox = document.getElementById("chat-box");
    chatBox.innerHTML += `<p>${message}</p>`;
    chatBox.scrollTop = chatBox.scrollHeight; // Scroll to the latest message
  }
  