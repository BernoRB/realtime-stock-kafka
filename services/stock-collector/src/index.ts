import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import * as collectorController from './controllers/collectorController';
import { initKafkaProducer } from './kafka/producer';

dotenv.config();
const PORT = process.env.PORT || 3001;

async function bootstrap() {
  // init kafka producer
  try {
    await initKafkaProducer();
  } catch(error) {
    console.error('Failed to init Kafka producer: ', error);
    process.exit(1);
  }

  // init express app
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  // routes
  app.get('/health', (req, res) => {
    res.status(200).json( { status: 'OK' });
  });
  app.post('/collection/start', collectorController.startCollection);
  app.post('/collection/stop', collectorController.stopCollection);
  app.get('/collection/status', collectorController.getCollectionStatus);


  // init server
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

bootstrap().catch((error) => {
  console.error('Application failed to start:', error);
});

