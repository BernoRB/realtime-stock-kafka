package models

import (
    "time"
)

// MarketData for kafka consumer (no GORM)
type MarketData struct {
    ID            int64     `json:"id"`
    Symbol        string    `json:"symbol"`
    Price         float64   `json:"price"`
    Volume        *int64    `json:"volume"`
    ChangeAmount  *float64  `json:"changeamount"`
    ChangePercent *float64  `json:"changepercent"`
    Timestamp     time.Time `json:"timestamp"`
    DataType      string    `json:"datatype"`
}

// MarketDataGorm GORM
type MarketDataGorm struct {
    ID            int64      `gorm:"primaryKey;autoIncrement"`
    Symbol        string     `gorm:"type:varchar(20);not null;index"`
    Price         float64    `gorm:"type:decimal(12,4);not null"`
    Volume        *int64     `gorm:"type:bigint"`
    ChangeAmount  *float64   `gorm:"type:decimal(10,4);column:changeamount"`
    ChangePercent *float64   `gorm:"type:decimal(8,4);column:changepercent"`
    Timestamp     time.Time  `gorm:"type:timestamp with time zone;index;default:CURRENT_TIMESTAMP"`
    DataType      string     `gorm:"type:varchar(10);default:'stock'"`
    CreatedAt     time.Time  `gorm:"autoCreateTime"`
    UpdatedAt     time.Time  `gorm:"autoUpdateTime"`
}

func (MarketDataGorm) TableName() string {
    return "market_data"
}

// ToGorm parse MarketData to MarketDataGorm
func (m *MarketData) ToGorm() *MarketDataGorm {
    return &MarketDataGorm{
        ID:            m.ID,
        Symbol:        m.Symbol,
        Price:         m.Price,
        Volume:        m.Volume,
        ChangeAmount:  m.ChangeAmount,
        ChangePercent: m.ChangePercent,
        Timestamp:     m.Timestamp,
        DataType:      m.DataType,
    }
}

// FromGorm parse MarketDataGorm to MarketData
func (m *MarketData) FromGorm(gormData *MarketDataGorm) {
    m.ID = gormData.ID
    m.Symbol = gormData.Symbol
    m.Price = gormData.Price
    m.Volume = gormData.Volume
    m.ChangeAmount = gormData.ChangeAmount
    m.ChangePercent = gormData.ChangePercent
    m.Timestamp = gormData.Timestamp
    m.DataType = gormData.DataType
}