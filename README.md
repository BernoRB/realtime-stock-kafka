# RealTimeStock

## Overview

![Descripción de la imagen](https://i.postimg.cc/7PQ9gyjm/diagrama-stock-kafka.png)

RealTimeStock is a system to collect and visualize stock market data. Developed to familiarize myself with Apache Kafka and Grafana. At first I also developed one of the two services in Go to learn it, but then I re-made it in Node (the Go service is finished and functional, you can find it in the 'data-processor-go-deprecated' folder).
The flow is as follows:
1. Stock Collector service (Node.js) fetches stock data using [Yahoo Finance API](https://www.npmjs.com/package/yahoo-finance2) every N seconds _(configurable by env both the frequency and the stock market companies to fetch)_
2. Stock Collector service then publishes data to Kafka topic "stock-data"
3. Data Processor service (Node.js) consumes messages from Kafka
4. Data Processor service processes and stores data in PostgreSQL
5. Grafana takes information from the database and generates dashboards based on it


## Architecture
- **Stock Collector** (Node.js): Fetches stock prices from Yahoo Finance using [yahoo-finance2](https://www.npmjs.com/package/yahoo-finance2)
- **Apache Kafka**: Message broker for streaming stock data
- **Data Processor** (Node.js): Consumes and processes stock data
- **PostgreSQL**: Database for storing stock data
- **Grafana**: Dashboards for data visualization

## Tech Stack
- **Backend**: Node.js (+Express +TypeScript)
- **Message Queue**: Apache Kafka
- **Database**: PostgreSQL
- **Visualization**: Grafana
- **Infrastructure**: Docker, Docker Compose


## Quick Start

### Installation

1. Clone the repository
```bash
git clone https://github.com/BernoRB/realtime-stock-kafka
cd realtime-stock-kafka
```

2. Create and complete environment files

3. Run with Docker Compose
```bash
docker-compose up
```

## Service Details

### Stock Collector
- **Function**: Fetches stock data from Yahoo Finance every N seconds and publish it to Kafka
- **Endpoints**:
  - `GET /health` - Health check
  - `POST /collection/start` - Start collection of data
  - `POST /collection/stop` - Stop collection of data
  - `GET /collection/status` - Collection status (running or not, interval and topic)

### Data Processor
- **Function**: Consumes Kafka messages and stores in PostgreSQL. No need to manually start.
- **Endpoints**:
  - `GET /health` - Health check (is running)
  - `GET /status` - Status of the processing (is running, topic, number of messages processed)


### Grafana Dashboards
Access Grafana at `http://localhost:3000`

**Default credentials**: admin/admin

Then you'll need to manually connect your database as a data source, and then you can create any dashboards and visualizations you want. For example, I created a dashboard with these three visualizations:
1. **Latest Stock Data** - Current prices
2. **Stock Rankings** - Top gainers/losers
3. **Price Trends** - Time series charts

![Grafana dashboard](https://i.postimg.cc/VLQ0tfzq/grafana-dash.jpg)

To get these, first create a dashboard, then add a visualization and paste the corresponding SQL query (you'll have to play around with the settings on the right to get the exact same visual result).
Here's a link to a pastebin with the three queries I used: https://pastebin.com/vr94yiLf


## Database Schema
```sql
CREATE TABLE market_data (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(20) NOT NULL,
    price DECIMAL(12,4) NOT NULL,
    volume BIGINT,
    changeamount DECIMAL(10,4),
    changepercent DECIMAL(8,4),
    timestamp TIMESTAMP WITH TIME ZONE,
    datatype VARCHAR(10) DEFAULT 'stock'
);
```

## Development

### Running Locally
1. Start infrastructure with Docker Compose
2. Run services locally for development:

**Stock Collector**:
```bash
cd services/stock-collector
npm install
npm start
```

**Data Processor**:
```bash
cd services/data-processor
npm install
npm start
```


## Monitoring local links
- Kafka UI: `http://localhost:8080`
- Grafana: `http://localhost:3000`
- Stock Collector API: `http://localhost:3002`
- Data Processor API: `http://localhost:3001`
