import { Request, Response } from 'express'
import { KafkaService } from '../services/kafka'

export class HealthController {
  constructor(private kafkaService: KafkaService) {}

  getHealth = (req: Request, res: Response): void => {
    res.json({
      status: 'OK Service up',
    })
  }

  getStatus = (req: Request, res: Response): void => {
    const status = this.kafkaService.getStatus()
    res.json(status)
  }
}
