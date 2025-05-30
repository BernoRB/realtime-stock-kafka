import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('market_data')
@Index(['symbol'])
@Index(['timestamp'])
export class MarketData {
  @PrimaryGeneratedColumn('increment')
  id!: number

  @Column({ type: 'varchar', length: 20 })
  symbol!: string

  @Column({ type: 'decimal', precision: 12, scale: 4 })
  price!: number

  @Column({ type: 'bigint', nullable: true })
  volume?: number

  @Column({ name: 'changeamount', type: 'decimal', precision: 10, scale: 4, nullable: true })
  changeAmount?: number

  @Column({ name: 'changepercent', type: 'decimal', precision: 8, scale: 4, nullable: true })
  changePercent?: number

  @Column({ type: 'timestamp with time zone' })
  timestamp!: Date

  @Column({ name: 'datatype', type: 'varchar', length: 10, default: 'stock' })
  dataType!: string

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt!: Date
}

export interface CreateMarketDataDto {
  symbol: string
  price: number
  volume?: number
  changeAmount?: number
  changePercent?: number
  timestamp: Date
  dataType?: string
}