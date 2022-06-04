import amqplib from "amqplib";

console.clear();
const recvQ = async () => {
  const connnection = await amqplib.connect("amqp://localhost");
  const channel = await connnection.createChannel();

  channel.assertExchange("notificationEx", "topic", { durable: false });
  const tmpQ = await channel.assertQueue("", { exclusive: true });

  channel.bindQueue(tmpQ.queue, "notificationEx", "upvote");
  channel.consume(
    tmpQ.queue,
    (msg) => {
      if (msg) {
        const recv = msg.content.toString();
        console.log("upvoted recv ", recv);
      }
    },
    {
      noAck: true,
    }
  );

  const tmpQ2 = await channel.assertQueue("", { exclusive: true });
  channel.assertExchange("notificationEx", "topic", { durable: false });
  channel.bindQueue(tmpQ2.queue, "notificationEx", "downvote");

  channel.consume(
    tmpQ2.queue,
    (msg) => {
      if (msg) {
        const prop = msg.properties;
        const replyTo = prop.replyTo;
        const correlationId = prop.correlationId;
        const recv = msg.content.toString();
        console.log("downvote recv", recv);
        channel.sendToQueue(replyTo, Buffer.from(recv.toUpperCase()), {
          correlationId: correlationId,
        });
      }
    },
    {
      noAck: true,
    }
  );
};

recvQ();
