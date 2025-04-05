const yahooFinance = require("yahoo-finance2").default;

const getStockData = async (req, res) => {
  try {
    const symbols = ["AAPL", "MSFT", "NVDA", "AMZN", "GOOGL", "TSLA", "META"];

    const stockData = await Promise.all(
      symbols.map(async (symbol) => {
        const result = await yahooFinance.quote(symbol);
        return {
          symbol: result.symbol,
          name: result.shortName,
          price: result.regularMarketPrice,
          change: result.regularMarketChangePercent,
          marketCap: result.marketCap,
        };
      })
    );

    res.json({ stocks: stockData });
  } catch (error) {
    console.error("Error fetching stock data:", error);
    res.status(500).json({ message: "Failed to fetch market data" });
  }
};

module.exports = { getStockData };
