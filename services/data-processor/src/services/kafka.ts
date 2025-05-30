import { Kafka, Consumer, EachMessagePayload } from 'kafkajs';
import { DatabaseService } from './database';
import { CreateMarketDataDto } from '../entities/MarketData';

export interface ConsumerStatus {
  running: boolean;
  topic: string;
  messagesProcessed: number;
}

export class KafkaService {
  private kafka: Kafka
  private consumer: Consumer
  private databaseService: DatabaseService
  private running: boolean = false
  private messagesProcessed: number = 0
  private topic: string

  constructor(databaseService: DatabaseService) {
    this.databaseService = databaseService
    this.topic = process.env.KAFKA_TOPIC_STOCK_DATA || 'stock-data'

    this.kafka = new Kafka({
      clientId: 'data-processor',
      brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
    })

    this.consumer = this.kafka.consumer({
      groupId: process.env.KAFKA_CONSUMER_GROUP || 'stock-processor',
    })
  }

  async start(): Promise<void> {
    if (this.running) {
      throw new Error('Consumer is already running...')
    }

    try {
      await this.consumer.connect()
      await this.consumer.subscribe({ topic: this.topic })

      await this.consumer.run({
        eachMessage: async (payload: EachMessagePayload) => {
          await this.processMessage(payload)
        },
      })

      this.running = true;
      console.log(`Consumer started, listening on topic: ${this.topic}`);
    } catch (error) {
      console.error('Error starting Kafka consumer:', error)
      throw error
    }
  }

  private async processMessage(payload: EachMessagePayload): Promise<void> {
    const { message } = payload
    
    if (!message.value) {
      console.log('Received empty message')
      return
    }

    console.log(`Message received from topic ${this.topic}: ${message.value.toString()}`)

    try {
      const data = JSON.parse(message.value.toString()) as any

      // Create MarketData object
      const marketData: CreateMarketDataDto = {
        symbol: data.symbol,
        price: data.price,
        volume: data.volume,
        changeAmount: data.changeAmount,
        changePercent: data.changePercent,
        dataType: 'stock',
        timestamp: new Date(),
      }

      // Save to database
      await this.databaseService.saveMarketData(marketData)

      this.messagesProcessed++
      console.log(`Data from ${marketData.symbol} saved in DB. Total processed: ${this.messagesProcessed}`)

    } catch (error) {
      console.error('Error processing message:', error)
    }
  }
  
  getStatus(): ConsumerStatus {
    return {
      running: this.running,
      topic: this.topic,
      messagesProcessed: this.messagesProcessed,
    }
  }

  async stop(): Promise<void> {
    if (!this.running) {
      return
    }

    try {
      await this.consumer.disconnect()
      this.running = false
      console.log('Kafka consumer stopped')
    } catch (error) {
      console.error('Error stopping Kafka consumer:', error)
      throw error
    }
  }
}