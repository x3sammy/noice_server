import express from "express";
const followRoute = express.Router();
import conn from "../connect/connect.js";
import amqplib from "amqplib";

import { v4 as uuidv4 } from "uuid";

const uid = uuidv4();

const fwQ = async () => {
  return amqplib.connect("amqp://localhost");
};

followRoute.post("/:id/follow", (req, resp) => {
  try {
    const { id } = req.params;
    const { us_id } = req.cookies;
    const is_valid = id.search(/^[0-9]{1,13}$/);
    if (is_valid == 0) {
      fwQ()
        .then((e) => {
          (async () => {
            const followQ = "follow_user";
            const channel = await e.createChannel();
            await channel.assertQueue(followQ, { durable: true });
            const replyQ = await channel.assertQueue("", { exclusive: true });

            channel.sendToQueue(
              followQ,
              Buffer.from(JSON.stringify({ id: id, user_id: us_id })),
              {
                replyTo: replyQ.queue,
                correlationId: uid,
              }
            );
            channel.consume(
              replyQ.queue,
              (msg) => {
                if (msg.properties.correlationId == uid) {
                  channel.ack(msg);
                  const data = JSON.parse(msg.content.toString());
                  if (data["success"]) {
                    resp.status(200).json({ success: "ok", msg: "following" });
                  } else {
                    resp.status(200).json({ success: false, msg: "err" });
                  }
                  (async () => {
                    await e.close();
                  })();
                }
              },
              {
                noAck: false,
              }
            );
          })();
        })
        .catch((e) => {
          resp.status(400).json({ success: false });
        });
    } else {
      resp.status(405).end();
    }
  } catch (e) {
    console.log(e.message);
    resp.status(500).json({ success: false });
  }
});

followRoute.post("/:id/unfollow", (req, resp) => {
  try {
    const { id } = req.params;
    const { us_id } = req.cookies;
    const is_valid = id.search(/^[0-9]{1,13}$/);
    if (is_valid == 0) {
      fwQ()
        .then((e) => {
          (async () => {
            const followQ = "unfollow_user";
            const channel = await e.createChannel();
            await channel.assertQueue(followQ, { durable: true });
            const replyQ = await channel.assertQueue("", { exclusive: true });

            channel.sendToQueue(
              followQ,
              Buffer.from(JSON.stringify({ id: id, user_id: us_id })),
              {
                replyTo: replyQ.queue,
                correlationId: uid,
              }
            );
            channel.consume(
              replyQ.queue,
              (msg) => {
                if (msg.properties.correlationId == uid) {
                  channel.ack(msg);
                  const data = JSON.parse(msg.content.toString());
                  if (data["success"]) {
                    resp.status(200).json({ success: "ok", msg: "unfollowed" });
                  } else {
                    resp.status(200).json({ success: false, msg: "err" });
                  }
                  (async () => {
                    await e.close();
                  })();
                }
              },
              {
                noAck: false,
              }
            );
          })();
        })
        .catch((e) => {
          resp.status(400).json({ success: false });
        });
    } else {
      resp.status(405).end();
    }
  } catch (e) {
    console.log(e.message);
    resp.status(500).json({ success: false });
  }
});

export default followRoute;
