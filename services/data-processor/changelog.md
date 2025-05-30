# CHANGELOG - Data Processor

## [1.0.0] - 2025-05-30
- Este servicio estaba originalmente hecho en Go (podés encontrarlo en la carpeta data-processor-go-deprecated). Lo re-hice en Node.
Contiene:
- Consumidor Kafka para consumir automáticamente datos del topic 'stock-data'
- Conexion con PostgreSQL
- Guardado de datos obtenidos de Kafka en la base de datos