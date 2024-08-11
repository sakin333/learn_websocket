const http = require("http");

const { WebSocketServer } = require("ws");

const url = require("url");
const uuidv4 = require("uuid").v4;

const server = http.createServer();
const wss = new WebSocketServer({ server });
const port = 8099;

const connections = {};
const users = {};

const broadcast = () => {
  Object.keys(connections).forEach((uuid) => {
    const connection = connections[uuid];
    const message = JSON.stringify(users);

    connection.send(message);
  });
};

const handleMessage = (bytes, uuid) => {
  //   console.log("Bytes: ", bytes);
  //   console.log(".toString(): ", bytes.toString());
  //   console.log("parse: ", JSON.parse(bytes.toString()));

  const message = JSON.parse(bytes.toString());

  const user = users[uuid];
  //   console.log("user: ", user);
  user.state = message;

  broadcast();
};

const handleClose = () => {};

wss.on("connection", (connection, request) => {
  //ws://localhost:8099?username=Alex

  const { username } = url.parse(request.url, true).query;
  const uuid = uuidv4();
  console.log(username);
  console.log(uuid);

  connections[uuid] = connection;

  users[uuid] = {
    username: username,
    state: {},
  };

  connection.on("message", (msg) => handleMessage(msg, uuid));
  connection.on("close", () => handleClose(uuid));
});

server.listen(port, () => {
  console.log(`Websocket server is running on port ${port}`);
});
