import { Kafka } from 'kafkajs';
import dotenv from 'dotenv';

dotenv.config();

const kafka = new Kafka({
  clientId: 'stock-collector',
  brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
});

const producer = kafka.producer();

export async function initKafkaProducer() {
  try {
    await producer.connect();
    console.log('Kafka producer connected');
    return producer;
  } catch (error) {
    console.error('Failed to connect Kafka producer:', error);
    throw error;
  }
}

export { producer };