import amqplib from "amqplib";

const recvEx = async () => {
  const exchangeName = "testEx";

  const connection = await amqplib.connect("amqp://localhost:5672");

  const channel = await connection.createChannel();

  await channel.assertExchange(exchangeName, "fanout", { durable: true });

  const que = await channel.assertQueue("", { exclusive: true });

  channel.bindQueue(que.queue, exchangeName, "");
  console.log("[x] queue name :", que.queue);

  channel.consume(que.queue, (msg) => {
    if (msg.content) {
      console.log("[x] msg recv :", msg.content.toString());
      channel.ack(msg);
    }
  });
};

recvEx();
