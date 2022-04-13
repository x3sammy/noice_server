import amqplib from "amqplib";
import express from "express";
const app = express();

const sendQ = async (msg) => {
  try {
    const exchangeName = "testEx";
    const connection = await amqplib.connect("amqp://localhost:5672");
    const channel = await connection.createChannel();
    await channel.assertExchange(exchangeName, "fanout", { durable: true });

    channel.publish(exchangeName, "", Buffer.from(msg));

    setTimeout(() => {
      console.log("[x] SENT :", msg);
      connection.close();
    }, 200);
    return { success: true };
  } catch (e) {
    return { success: false };
  }
};

app
  .get("/msg", (req, resp) => {
    const { msg } = req.query;
    const res = sendQ(msg);
    resp.status(200).json(res);
  })
  .listen(8000);
