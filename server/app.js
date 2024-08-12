const express = require("express");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 8088;
const server = app.listen(PORT, () => console.log(`Server on port ${PORT}`));

const { WebSocketServer } = require("ws");

const uuidv4 = require("uuid").v4;

const wss = new WebSocketServer({ server });

const connections = new Set();
const users = {};

const onConnected = (ws) => {
  console.log("Web socket created");
  const uuid = uuidv4();
  console.log("uuid: ", uuid);

  connections.add(uuid);

  wss.clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.send(
        JSON.stringify({ event: "clients-total", data: connections.size })
      );
    }
  });

  ws.on("close", () => {
    console.log("Socket disconnected", uuid);
    connections.delete(uuid);

    wss.clients.forEach((client) => {
      if (client.readyState === client.OPEN) {
        client.send(
          JSON.stringify({ event: "clients-total", data: connections.size })
        );
      }
    });
  });

  ws.on("message", (msg) => {
    const messageData = JSON.parse(msg.toString());

    if (messageData.event === "chat-message") {
      console.log("Data from client: ", messageData);
      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === client.OPEN) {
          client.send(
            JSON.stringify({ event: "chat-message", data: messageData })
          );
        }
      });
    } else if (messageData.event === "feedback") {
      console.log("Feedback data from client: ", messageData);
      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === client.OPEN) {
          client.send(
            JSON.stringify({ event: "feedback-event", data: messageData })
          );
        }
      });
    }
  });
};

wss.on("connection", (ws, req) => {
  onConnected(ws);
});

app.use(express.static(path.join(__dirname, "public")));
