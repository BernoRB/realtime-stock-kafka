# CHANGELOG - Data Processor

## [1.0.0] - 2025-05-30
- Reemplazo el data-processor en Go por un data-processor en Node (mi stack principal), ya que este servicio fue hecho en Go por un propósito específico pero quiero que mi portfolio esté enfocado en Node. 

## [1.0.0] - 2025-05-11
- Versión inicial con estructura básica del proyecto
- Consumidor Kafka para consumir automáticamente datos del topic 'stock-data'
- Conexion con PostgreSQL
- Guardado de datos obtenidos de Kafka en la base de datos