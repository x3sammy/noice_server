import amqplib from "amqplib";
import express from "express";
import { v4 as uuidv4 } from "uuid";

const uid = uuidv4();

const app = express();
console.clear();
app
  .get("/msg/:data", async (req, resp) => {
    const { data } = req.params;
    try {
      const connection = await amqplib.connect("amqp://localhost");
      const channel = await connection.createChannel();
      await channel.assertExchange("notificationEx", "topic", {
        durable: false,
      });

      const tmpQ = await channel.assertQueue("", { exclusive: true });

      channel.publish(
        "notificationEx",
        "downvote",
        Buffer.from(data.toString()),
        {
          replyTo: tmpQ.queue,
          correlationId: uid,
        }
      );
      console.log("{~] Published Msg : " + data);

      channel.consume(
        tmpQ.queue,
        (msg) => {
          if (msg) {
            const cred = msg.properties;
            const correlationId = cred.correlationId;
            if (correlationId == uid) {
              const recv = msg.content.toString();
              console.log(recv);
              setTimeout(() => {
                (async () => {
                  await channel.close();
                  await connection.close();
                  console.log("[x] Connection closed...");
                })();
              }, 500);
            }
          }
        },
        {
          noAck: true,
        }
      );

      // setTimeout(() => {
      //   (async () => {
      //     await channel.close();
      //     await connection.close();
      //     console.log("[x] Connection closed...");
      //   })();
      // }, 500);
    } catch (e) {
      console.log(e.message);
    }

    resp.send("ok");
  })
  .listen(8000);
