import { DataSource, Repository } from 'typeorm'
import { MarketData, CreateMarketDataDto } from '../entities/MarketData'

export class DatabaseService {
  private dataSource: DataSource
  private marketDataRepository!: Repository<MarketData>

  constructor() {
    this.dataSource = new DataSource({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_DATABASE || 'postgres',
      synchronize: true,
      entities: [MarketData]
    });
  }

  async initialize(): Promise<void> {
    try {
      await this.dataSource.initialize()
      this.marketDataRepository = this.dataSource.getRepository(MarketData)
      console.log('Database connection established and synchronized')
    } catch (error) {
      console.error('Error initializing database:', error)
      throw error
    }
  }

  async saveMarketData(data: CreateMarketDataDto): Promise<MarketData> {
    try {
      const marketData = this.marketDataRepository.create({
        ...data,
        dataType: data.dataType || 'stock'
      })
      
      const savedData = await this.marketDataRepository.save(marketData)
      console.log(`Data from ${savedData.symbol} saved in DB. ID: ${savedData.id}`)
      
      return savedData
    } catch (error) {
      console.error('Error saving market data:', error)
      throw error
    }
  }

  async close(): Promise<void> {
    if (this.dataSource.isInitialized) {
      await this.dataSource.destroy()
      console.log('Database connection closed')
    }
  }
}