const WS_URL = "ws://localhost:8088";

const ws = new WebSocket(WS_URL);

const totalMembers = document.getElementById("totalMembers");
const messageContainer = document.getElementById("message-container");
const nameInput = document.getElementById("name-input");
const messageForm = document.getElementById("message-form");
const messageInput = document.getElementById("message-input");

function sendMessage() {
  console.log("Message input: ", messageInput.value);

  if (messageInput.value === "") return;

  const data = {
    username: nameInput.value,
    message: messageInput.value,
    dateTime: new Date(),
  };

  ws.send(JSON.stringify({ event: "chat-message", data }));
  addMessageElement(true, data);
  messageInput.value = "";
}

function addMessageElement(ownMessage, data) {
  clearFeedbackMessage();
  const messageElement = document.createElement("div");
  messageElement.className = `message ${
    ownMessage ? "message-right" : "message-left"
  }`;
  messageElement.innerHTML = `
    <div class="user">${data.username}:</div>
    <div class="text">${data.message}</div>
    `;
  messageContainer.appendChild(messageElement);
  scrollToBottom();
}

messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  sendMessage();
});

ws.onopen = () => {
  console.log("Connected to server");
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  if (message.event === "clients-total") {
    console.log("Number of clients connected: ", message.data);

    totalMembers.innerText = message.data;
  } else if (message.event === "chat-message") {
    console.log("Chat message: ", message.data);

    addMessageElement(false, message?.data?.data);
  } else if (message.event === "feedback-event") {
    console.log("Feedback message: ", message.data);
    clearFeedbackMessage();
    const feedbackElement = document.createElement("div");
    feedbackElement.className = "message-feedback";
    feedbackElement.innerHTML = `
    <p class="feedback" id="feedback">
        ${message.data.feedback}
    </p>
    `;
    messageContainer.appendChild(feedbackElement);
  }
};

ws.onclose = () => {
  console.log("Disconnected from the server");
};

function scrollToBottom() {
  messageContainer.scrollTo(0, messageContainer.scrollHeight);
}

function clearFeedbackMessage() {
  document.querySelectorAll("div.message-feedback").forEach((element) => {
    element.parentNode.removeChild(element);
  });
}

messageInput.addEventListener("focus", (e) => {
  ws.send(
    JSON.stringify({
      event: "feedback",
      feedback: `${nameInput.value} is typing...`,
    })
  );
});

messageInput.addEventListener("keypress", (e) => {
  ws.send(
    JSON.stringify({
      event: "feedback",
      feedback: `${nameInput.value} is typing...`,
    })
  );
});

messageInput.addEventListener("blur", (e) => {
  ws.send(JSON.stringify({ event: "feedback", feedback: "" }));
});
