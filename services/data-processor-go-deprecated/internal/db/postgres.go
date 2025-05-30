package db

import (
    "fmt"
    "log"
    
    "gorm.io/driver/postgres"
    "gorm.io/gorm"
    "gorm.io/gorm/logger"
    
    "github.com/BernoRB/realtime-stock-kafka/data-processor/config"
    "github.com/BernoRB/realtime-stock-kafka/data-processor/internal/models"
)

// Repository interface
type Repository interface {
    SaveMarketData(*models.MarketData) error
    Close() error
}

// GormRepository for db
type GormRepository struct {
    db *gorm.DB
}

// New Grom repository
func NewPostgresRepository(config *config.DBConfig) (*GormRepository, error) {
    dsn := fmt.Sprintf(
        "host=%s user=%s password=%s dbname=%s port=%d sslmode=disable TimeZone=UTC",
        config.Host, config.User, config.Password, config.DBName, config.Port,
    )
    
    gormConfig := &gorm.Config{
        Logger: logger.Default.LogMode(logger.Info),
    }
    
    db, err := gorm.Open(postgres.Open(dsn), gormConfig)
    if err != nil {
        return nil, fmt.Errorf("Failed to connect to database: %w", err)
    }
    
    // Configurar connection pool
    sqlDB, err := db.DB()
    if err != nil {
        return nil, fmt.Errorf("Failed to get generic database object: %w", err)
    }
    
    sqlDB.SetMaxIdleConns(10)
    sqlDB.SetMaxOpenConns(100)
    
    // Auto-migración
    err = db.AutoMigrate(&models.MarketDataGorm{})
    if err != nil {
        return nil, fmt.Errorf("failed to migrate: %w", err)
    }
    
    log.Println("GORM: Conexión establecida y migración completada")
    
    return &GormRepository{db: db}, nil
}

// SaveMarketData guarda los datos usando GORM
func (r *GormRepository) SaveMarketData(data *models.MarketData) error {
    gormData := data.ToGorm()
    
    result := r.db.Create(gormData)
    if result.Error != nil {
        return fmt.Errorf("failed to save market data: %w", result.Error)
    }
    
    data.ID = gormData.ID
    return nil
}

// Debug method
/*
func (r *GormRepository) CheckData() {
    var count int64
    result := r.db.Model(&models.MarketDataGorm{}).Count(&count)
    log.Printf("VERIFY: Total de filas en market_data: %d (error: %v)", count, result.Error)
    
    var lastRecord models.MarketDataGorm
    result = r.db.Last(&lastRecord)
    if result.Error == nil {
        log.Printf("VERIFY: Último registro - ID: %d, Symbol: %s", lastRecord.ID, lastRecord.Symbol)
    } else {
        log.Printf("VERIFY: No se pudo obtener último registro: %v", result.Error)
    }
}
*/

// Close connection
func (r *GormRepository) Close() error {
    sqlDB, err := r.db.DB()
    if err != nil {
        return err
    }
    return sqlDB.Close()
}