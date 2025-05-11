package kafka

import (
    "context"
    "encoding/json"
    "fmt"
    "log"
    "strings"
    "time"
    
    "github.com/BernoRB/realtime-stock-kafka/data-processor/config"
    "github.com/BernoRB/realtime-stock-kafka/data-processor/internal/db"
    "github.com/BernoRB/realtime-stock-kafka/data-processor/internal/models"
    "github.com/segmentio/kafka-go"
)

// Consumer handles consumption of Kafka messages
type Consumer struct {
    reader            *kafka.Reader
    repo              db.Repository
    topic             string
    running           bool
    messagesProcessed int64
    ctx               context.Context
    cancel            context.CancelFunc
}

// ConsumerStatus represents the status of the consumer
type ConsumerStatus struct {
    Running           bool   `json:"running"`
    Topic             string `json:"topic"`
    MessagesProcessed int64  `json:"messagesProcessed"`
}

// NewConsumer creates a new Kafka consumer
func NewConsumer(config *config.KafkaConfig, repo db.Repository) (*Consumer, error) {
    reader := kafka.NewReader(kafka.ReaderConfig{
        Brokers:  strings.Split(config.Broker, ","),
        GroupID:  config.ConsumerGroup,
        Topic:    config.StockDataTopic,
        MinBytes: 10e3, // 10KB
        MaxBytes: 10e6, // 10MB
    })
    
    ctx, cancel := context.WithCancel(context.Background())
    
    return &Consumer{
        reader:            reader,
        repo:              repo,
        topic:             config.StockDataTopic,
        running:           false,
        messagesProcessed: 0,
        ctx:               ctx,
        cancel:            cancel,
    }, nil
}

// Start consuming messages
func (c *Consumer) Start() error {
    if c.running {
        return fmt.Errorf("Consumer is already running...")
    }
    
    c.running = true
    log.Printf("Consumer started, listening in topic: %s\n", c.topic)
    
    go func() {
        for c.running {
            msg, err := c.reader.ReadMessage(c.ctx)
            if err != nil {
                if err == context.Canceled {
                    break
                }
                log.Printf("Error reading message: %v\n", err)
                continue
            }
            
            c.processMessage(msg)
        }
        log.Println("Closing Kafka consumer")
        c.reader.Close()
    }()
    
    return nil
}

// processMessage process Kafka msg
func (c *Consumer) processMessage(msg kafka.Message) {
    log.Printf("Message received topic %s: %s\n", msg.Topic, string(msg.Value))
    
    var data map[string]interface{}
    if err := json.Unmarshal(msg.Value, &data); err != nil {
        log.Printf("Error parsing JSON msg: %v\n", err)
        return
    }
    
    // Create MarketData object
    marketData := &models.MarketData{
        Symbol:    getStringFromMap(data, "symbol"),
        Price:     getFloat64FromMap(data, "price"),
        DataType:  "stock",
        Timestamp: time.Now(),
    }
    
    // Handle additional fields
    if volume, ok := data["volume"].(float64); ok {
        volInt := int64(volume)
        marketData.Volume = &volInt
    }
    
    if changeAmount, ok := data["changeAmount"].(float64); ok {
        marketData.ChangeAmount = &changeAmount
    }
    
    if changePercent, ok := data["changePercent"].(float64); ok {
        marketData.ChangePercent = &changePercent
    }
    
    // Use timestamp if msg has it
    if timestampStr, ok := data["timestamp"].(string); ok {
        if parsedTime, err := time.Parse(time.RFC3339, timestampStr); err == nil {
            marketData.Timestamp = parsedTime
        }
    }
    
    // Save in database
    if err := c.repo.SaveMarketData(marketData); err != nil {
        log.Printf("Error saving in DB: %v\n", err)
        return
    }

    // c.repo.(*db.GormRepository).CheckData()  // Debug call
    
    c.messagesProcessed++
    log.Printf("Data from %s saved in DB. Total processed: %d\n",
        marketData.Symbol, c.messagesProcessed)
}


func getStringFromMap(data map[string]interface{}, key string) string {
    if value, ok := data[key].(string); ok {
        return value
    }
    return ""
}

func getFloat64FromMap(data map[string]interface{}, key string) float64 {
    if value, ok := data[key].(float64); ok {
        return value
    }
    return 0.0
}

// GetStatus returns current consumer status
func (c *Consumer) GetStatus() ConsumerStatus {
    return ConsumerStatus{
        Running:           c.running,
        Topic:             c.topic,
        MessagesProcessed: c.messagesProcessed,
    }
}

// Stop the consumer
func (c *Consumer) Stop() {
    if !c.running {
        return
    }
    
    c.running = false
    c.cancel()
}