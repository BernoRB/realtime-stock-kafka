package config

import (
	"log"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

// 'Config' stores all app config
type Config struct {
	ServerPort int
	DB         DBConfig
	Kafka      KafkaConfig
}

// DB
type DBConfig struct {
	Host     string
	Port     int
	User     string
	Password string
	DBName   string
}

// Kafka
type KafkaConfig struct {
	Broker         string
	ConsumerGroup  string
	StockDataTopic string
}

// LoadConfig from env variables
func LoadConfig() *Config {
	// Cargar .env si existe
	err := godotenv.Load()
	if err != nil {
		log.Println("Archivo .env no encontrado")
	}

	// Server Port
	serverPort, _ := strconv.Atoi(getEnv("PORT", "3002"))

	// DB Port
	dbPort, _ := strconv.Atoi(getEnv("DB_PORT", "5432"))

	// Resto
	return &Config{
		ServerPort: serverPort,
		DB: DBConfig{
			Host:     getEnv("DB_HOST", "localhost"),
			Port:     dbPort,
			User:     getEnv("DB_USERNAME", "postgres"),
			Password: getEnv("DB_PASSWORD", "postgres"),
			DBName:   getEnv("DB_DATABASE", "postgres"),
		},
		Kafka: KafkaConfig{
			Broker:         getEnv("KAFKA_BROKER", "localhost:9092"),
			ConsumerGroup:  getEnv("KAFKA_CONSUMER_GROUP", "stock-processor"),
			StockDataTopic: getEnv("KAFKA_TOPIC_STOCK_DATA", "stock-data"),
		},
	}
}

// getEnv or return default value
func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}