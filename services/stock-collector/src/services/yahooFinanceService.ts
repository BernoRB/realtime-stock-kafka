import yahooFinance from "yahoo-finance2";
import dotenv from 'dotenv';

dotenv.config();

const SYMBOLS = (process.env.STOCK_SYMBOLS || 'AAPL,MSFT,GOOGL').split(',')

export interface StockQuote {
  symbol: string;
  price: number;
  volume: number | null;
  changeAmount: number | null;
  changePercent: number | null;
  timestamp: Date;
}

export async function getStockQuotes(): Promise<StockQuote[]> {
  try {
    const quotes = await Promise.all(
      SYMBOLS.map(async (symbol) => {
        try {
          const quote = await yahooFinance.quote(symbol);
          return {
            symbol,
            price: quote.regularMarketPrice || 0,
            volume: quote.regularMarketVolume || null,
            changeAmount: quote.regularMarketChange || null,
            changePercent: quote.regularMarketChangePercent  || null,
            timestamp: new Date(),
          }
        } catch (error) {
          console.error(`Error fetching data for ${symbol}:`, error)
        }
      })
    )
    return quotes.filter((quote): quote is StockQuote => quote !== null);
  } catch (error) {
    console.error('Error fetching stock data: ', error);
    throw error;
  }
}