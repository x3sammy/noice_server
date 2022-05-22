import amqplib from "amqplib";

const connectRabbit = async () => {
  try {
    const connection = await amqplib.connect("amqp://localhost");
    return connection;
  } catch (e) {
    return "err";
  }
};

export default connectRabbit;
