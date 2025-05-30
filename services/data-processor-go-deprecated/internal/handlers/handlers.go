package handlers

import (
    "net/http"
    "github.com/gin-gonic/gin"
    "github.com/BernoRB/realtime-stock-kafka/data-processor/internal/kafka"
)

// Handler
type Handler struct {
    consumer *kafka.Consumer
}

// NewHandler
func NewHandler(consumer *kafka.Consumer) *Handler {
    return &Handler{
        consumer: consumer,
    }
}

// GetHealth
func (h *Handler) GetHealth(c *gin.Context) {
    status := h.consumer.GetStatus()
    
    c.JSON(http.StatusOK, gin.H{
        "status": "OK",
        "consumer": status,
    })
}

// StartProcessing
func (h *Handler) StartProcessing(c *gin.Context) {
    err := h.consumer.Start()
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{
            "error": err.Error(),
        })
        return
    }
    
    c.JSON(http.StatusOK, gin.H{
        "message": "Processing started",
    })
}

// StopProcessing
func (h *Handler) StopProcessing(c *gin.Context) {
    h.consumer.Stop()
    
    c.JSON(http.StatusOK, gin.H{
        "message": "Processing stopped",
    })
}

// GetStatus
func (h *Handler) GetStatus(c *gin.Context) {
    status := h.consumer.GetStatus()
    
    c.JSON(http.StatusOK, status)
}