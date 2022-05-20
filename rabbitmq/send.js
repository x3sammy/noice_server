import amqplib from "amqplib";
import express from "express";
const app = express();

const sendQ = async () => {
  try {
    const connection = await amqplib.connect("amqp://localhost");
    const channel = await connection.createChannel();
    await channel.assertQueue("holaam", { durable: false });
    channel.sendToQueue("holaam", Buffer.from("hello there".toString()));
    //const crTmp = channel.assertQueue('', {exclusive:true});
    console.log("[~] Msg Sent!");
  } catch (e) {
    console.log(e.message);
  }
};

sendQ();
