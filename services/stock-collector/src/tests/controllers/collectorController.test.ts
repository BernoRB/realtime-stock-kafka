import { Request, Response } from 'express';
import { startCollection, stopCollection, getCollectionStatus } from '../../controllers/collectorController';
import * as collectorService from '../../services/collectorService';

// Mock the collectorService
jest.mock('../../services/collectorService');

describe('Collector Controller', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnThis();
    
    mockReq = {};
    mockRes = {
      status: statusMock,
      json: jsonMock
    };

    jest.clearAllMocks();
  });

  describe('startCollection', () => {
    it('should start collection successfully', async () => {
      (collectorService.startDataCollection as jest.Mock).mockResolvedValue(undefined);

      await startCollection(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({ message: 'Data collection started' });
    });

    it('should handle errors', async () => {
      const error = new Error('Test error');
      (collectorService.startDataCollection as jest.Mock).mockRejectedValue(error);

      await startCollection(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Failed to start data collection' });
    });
  });

  describe('stopCollection', () => {
    it('should stop collection successfully', () => {
      stopCollection(mockReq as Request, mockRes as Response);

      expect(collectorService.stopDataCollection).toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({ message: 'Data collection stopped' });
    });
  });

  describe('getCollectionStatus', () => {
    it('should return status', () => {
      const mockStatus = { isRunning: true, interval: 60000, topic: 'stock-data' };
      (collectorService.getStatus as jest.Mock).mockReturnValue(mockStatus);

      getCollectionStatus(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(mockStatus);
    });
  });
});