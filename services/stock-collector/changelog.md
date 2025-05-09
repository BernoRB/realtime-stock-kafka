# CHANGELOG - Stock Collector

## [1.1.0] - 2025-05-09

### Added
- Integración completa con Yahoo Finance API para obtención de datos financieros
- Productor Kafka para publicación de datos en el topic "stock-data"
- Sistema de recolección periódica configurable mediante variables de entorno
- Endpoints REST para control del servicio:
  - `/collection/start` - Iniciar recolección
  - `/collection/stop` - Detener recolección
  - `/collection/status` - Estado actual de la recolección
- Configuración mediante variables de entorno (.env)
- Gestión de errores y reintentos para llamadas a la API
- Soporte para múltiples símbolos de acciones configurables
- Dockerfile para contenerización

## [1.0.0] - 2025-05-09
- Versión inicial con estructura básica del proyecto