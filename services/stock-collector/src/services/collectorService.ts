import { producer } from '../kafka/producer'
import { getStockQuotes } from './yahooFinanceService';
import dotenv from 'dotenv';

dotenv.config();

const FETCH_INTERVAL = parseInt(process.env.FETCH_INTERVAL || '300000');
const KAFKA_TOPIC = process.env.KAFKA_TOPIC_STOCK_DATA || 'stock-data';

let isRunning = false;
let intervalId: NodeJS.Timeout;

export async function startDataCollection() {
  if(isRunning) {
    return;
  }

  isRunning = true;
  console.log(`Starting data collection every ${FETCH_INTERVAL}ms`)

  // First time execute inmediatly
  await collectAndPublishData();

  // Interval for future executions
  intervalId = setInterval(async () => {
    await collectAndPublishData();
  }, FETCH_INTERVAL);
}

export function stopDataCollection() {
  if (!isRunning) {
    return;
  }

  clearInterval(intervalId);
  isRunning = false;
  console.log('Stopped data collection');
}

async function collectAndPublishData() {
  try {
    const quotes = await getStockQuotes();

    if (quotes.length === 0) {
      console.warn('No stock quotes received');
      return;
    }

    console.log(`Collected ${quotes.length} stock quotes`);

    // Publish quotes in kafka
    await Promise.all(
      quotes.map(async (quote) => {
        await producer.send({
          topic: KAFKA_TOPIC,
          messages: [
            {
              key: quote.symbol,
              value: JSON.stringify(quote),
            },
          ],
        });
      })
    );
    console.log(`Published ${quotes.length} messages to Kafka`);
  } catch(error) {
    console.error('Error in collect and publish cycle: ', error);
  }
}

export function getStatus() {
  return {
    isRunning,
    interval: FETCH_INTERVAL,
    topic: KAFKA_TOPIC
  }
}