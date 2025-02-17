document.getElementById("send-button").addEventListener("click", async () => {
    const message = document.getElementById("user-message").value;
  
    if (!message.trim()) return;
  
    // Display user message
    displayMessage("You: " + message);
  
    // Send message to the backend
    const response = await fetch("https://shiny-rotary-phone-j7vgppw77xcw5-3000.app.github.dev/api/chat/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });
  
    const data = await response.json();
    const reply = data.reply;
  
    // Display bot response
    displayMessage("Toonstack: " + reply);
  
    // Clear input field
    document.getElementById("user-message").value = "";
  });
  
  function displayMessage(message) {
    const chatBox = document.getElementById("chat-box");
    chatBox.innerHTML += `<p>${message}</p>`;
    chatBox.scrollTop = chatBox.scrollHeight; // Scroll to the latest message
  }
  