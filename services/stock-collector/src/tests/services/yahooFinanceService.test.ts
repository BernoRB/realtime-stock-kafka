import { getStockQuotes } from '../../services/yahooFinanceService';

jest.mock('yahoo-finance2', () => ({
  quote: jest.fn(),
}));

import yahooFinance from 'yahoo-finance2';

describe('Yahoo Finance Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return stock quotes with correct structure', async () => {
    const mockQuote = {
      regularMarketPrice: 150.50,
      regularMarketVolume: 1000000,
      regularMarketChange: 2.50,
      regularMarketChangePercent: 1.69,
    };

    (yahooFinance.quote as jest.Mock).mockResolvedValue(mockQuote);

    const quotes = await getStockQuotes();

    expect(Array.isArray(quotes)).toBe(true);
    expect(quotes.length).toBeGreaterThan(0);

    const quote = quotes[0];
    expect(quote).toHaveProperty('symbol');
    expect(quote).toHaveProperty('price');
    expect(quote.price).toBe(150.50);
    expect(quote.timestamp instanceof Date).toBe(true);
  });

  it('should handle partial failures', async () => {
    (yahooFinance.quote as jest.Mock)
      .mockResolvedValueOnce({ regularMarketPrice: 100 })
      .mockRejectedValueOnce(new Error('API Error'))
      .mockResolvedValueOnce({ regularMarketPrice: 200 });

    const quotes = await getStockQuotes();

    const validQuotes = quotes.filter(q => q !== undefined);
    expect(validQuotes.length).toBeGreaterThan(0);
  });

  it('should handle missing data fields', async () => {
    const incompleteQuote = {
      regularMarketPrice: 150.50,
    };

    (yahooFinance.quote as jest.Mock).mockResolvedValue(incompleteQuote);

    const quotes = await getStockQuotes();
    const quote = quotes[0];

    expect(quote.price).toBe(150.50);
    expect(quote.volume).toBeNull();
    expect(quote.changeAmount).toBeNull();
    expect(quote.changePercent).toBeNull();
  });
});