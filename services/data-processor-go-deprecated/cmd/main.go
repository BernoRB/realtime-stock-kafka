package main

import (
	"fmt"
	"log"

	"github.com/gin-gonic/gin"
	"github.com/BernoRB/realtime-stock-kafka/data-processor/config"
	"github.com/BernoRB/realtime-stock-kafka/data-processor/internal/db"
	"github.com/BernoRB/realtime-stock-kafka/data-processor/internal/handlers"
	"github.com/BernoRB/realtime-stock-kafka/data-processor/internal/kafka"
)

func main() {
	// Load config
	cfg := config.LoadConfig()

	// Start PostgreSQL repo
	repo, err := db.NewPostgresRepository(&cfg.DB)
	if err != nil {
		log.Fatalf("Error connecting to DB: %v", err)
	}
	defer repo.Close()

	// Start Kafka consumer
	consumer, err := kafka.NewConsumer(&cfg.Kafka, repo)
	if err != nil {
		log.Fatalf("Error creating Kafka consumer: %v", err)
	}

	// Start processing
	log.Println("Starting Kafka consumer...")
	if err := consumer.Start(); err != nil {
		log.Fatalf("Error starting Kafka consumer: %v", err)
	}

	// Start http handler
	handler := handlers.NewHandler(consumer)

	// Config router & routes
	router := gin.Default()
	router.GET("/health", handler.GetHealth)

	// Start http
	serverAddr := fmt.Sprintf(":%d", cfg.ServerPort)
	log.Printf("Server started... %s", serverAddr)
	log.Println("Consumer auto processing messages...")
	
	if err := router.Run(serverAddr); err != nil {
		log.Fatalf("Error starting server: %v", err)
	}
}