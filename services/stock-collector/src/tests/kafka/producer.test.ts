import { initKafkaProducer, producer } from '../../kafka/producer';
import { Kafka } from 'kafkajs';

// Mock kafkajs
jest.mock('kafkajs');

describe('Kafka Producer', () => {
  let mockConnect: jest.Mock;

  beforeEach(() => {

    // Mocks
    jest.clearAllMocks();

    mockConnect = jest.fn();

        const mockProducer = {
      connect: mockConnect
    };

        const mockKafka = {
      producer: jest.fn().mockReturnValue(mockProducer)
    };
    
    jest.doMock('kafkajs', () => ({
      Kafka: jest.fn().mockImplementation(() => mockKafka)
    }));
  });

  afterEach(() => {
    jest.resetModules();
  });

  describe('initKafkaProducer', () => {
    it('should connect successfully', async () => {
      // Importar después de configurar el mock
      const { initKafkaProducer } = require('../../kafka/producer');
      mockConnect.mockResolvedValue(undefined);

      const result = await initKafkaProducer();

      expect(mockConnect).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw error on connection failure', async () => {
      // Importar después de configurar el mock
      const { initKafkaProducer } = require('../../kafka/producer');
      const error = new Error('Connection failed');
      mockConnect.mockRejectedValue(error);

      await expect(initKafkaProducer()).rejects.toThrow('Connection failed');
    });
  });
});