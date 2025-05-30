import 'reflect-metadata';
import express from 'express';
import dotenv from 'dotenv';
import { DatabaseService } from './services/database';
import { KafkaService } from './services/kafka';
import { HealthController } from './controllers/healthController';

dotenv.config()

const PORT = process.env.PORT || 3002

async function bootstrap() {
  // Init database
  try {
    const databaseService = new DatabaseService()
    await databaseService.initialize()
    console.log('Database initialized')

    // Init Kafka consumer
    const kafkaService = new KafkaService(databaseService);
    await kafkaService.start()
    console.log('Kafka consumer started')

    // Init Express app
    const app = express()
    app.use(express.json())

    const healthController = new HealthController(kafkaService);

    // Routes
    app.get('/health', healthController.getHealth);
    app.get('/status', healthController.getStatus);

    // Start server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
      console.log('Consumer auto processing messages...')
    });

  } catch (error) {
    console.error('Failed to initialize services:', error)
    process.exit(1)
  }
}

bootstrap().catch((error) => {
  console.error('Application failed to start:', error)
})