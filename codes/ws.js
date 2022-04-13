import { WebSocketServer } from "ws";
import http from "http";

const server = http
  .createServer(() => {
    console.log("created");
  })
  .listen(8000);

const websocket = new WebSocketServer({
  noServer: true,
});

const webSocketIds = {};

websocket.getUniqueID = function () {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + "-" + s4() + "-" + s4();
};

websocket.on("connection", (ws, req, id) => {
  console.log("id set for :", id);
  webSocketIds[id] = ws;

  ws.on("close", () => {
    console.log("connection closed by " + id);
    console.log("deleted ", id);
    delete webSocketIds[id];
  });

  ws.on("message", (recv) => {
    try {
      const { to, msg } = JSON.parse(recv);
      if (webSocketIds[to] == undefined) {
        webSocketIds[id].send(
          JSON.stringify({ success: "you are not allowed" })
        );
      } else {
        webSocketIds[to].send(JSON.stringify({ from: id, msg: msg }));
        webSocketIds[id].send(JSON.stringify({ success: "sent" }));
      }
    } catch (e) {
      console.log(e.message);
      webSocketIds[id].send(JSON.stringify({ success: "failed" }));
    }
  });

  ws.send(JSON.stringify({ success: "ok" }));
});

server.on("upgrade", async function upgrade(request, socket, head) {
  const cred = request.headers["sec-websocket-protocol"].split(",");

  //console.log(cred[0], cred[1]);
  const user_id = cred[0];
  if (cred[1] != " supersecrettoken") {
    return socket.end("HTTP/1.1 401 Unauthorized\r\n", "ascii");
  }
  // console.log(request.headers['sec-websocket-key']);

  websocket.handleUpgrade(request, socket, head, function done(ws) {
    websocket.emit("connection", ws, request, user_id);
  });
});
