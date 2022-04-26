import express from "express";
const testRouter = express.Router();
import amqplib from "amqplib";

const data = async (req, resp, next) => {
  try {
    const connection = await amqplib.connect("amqp://localhost");
    const channel = await connection.createChannel();
    resp.locals.channel = channel;
    next();
  } catch (e) {
    req.status(405).json({ success: false, msg: "server error" });
  }
};

testRouter.use(data);

testRouter.get("/test", (req, resp) => {
  const channel = resp.locals.channel;

  channel.sendToQueue("test", Buffer.from("this is just a message"));

  resp.json({ success: 1 });
});

export default testRouter;
