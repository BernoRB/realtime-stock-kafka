import { Request, Response } from 'express';
import { startDataCollection, stopDataCollection, getStatus } from '../services/collectorService';

export async function startCollection(req: Request, res: Response) {
  try {
    await startDataCollection();
    res.status(200).json({ message: 'Data collection started' });
  } catch (error) {
    console.error('Error starting collection:', error);
    res.status(500).json({ error: 'Failed to start data collection' });
  }
}

export function stopCollection(req: Request, res: Response) {
  try {
    stopDataCollection();
    res.status(200).json({ message: 'Data collection stopped' });
  } catch (error) {
    console.error('Error stopping collection:', error);
    res.status(500).json({ error: 'Failed to stop data collection' });
  }
}

export function getCollectionStatus(req: Request, res: Response) {
  try {
    const status = getStatus();
    res.status(200).json(status);
  } catch (error) {
    console.error('Error getting status:', error);
    res.status(500).json({ error: 'Failed to get collection status' });
  }
}