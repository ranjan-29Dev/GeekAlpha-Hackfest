const Investment = require("../models/investment.models");
const yahooFinance = require("yahoo-finance2").default;

exports.getUserInvestments = async (req, res) => {
  try {
    const investments = await Investment.find({ userId: req.user.id });
    res.json({ success: true, data: investments });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Error fetching investments" });
  }
};
exports.addInvestment = async (req, res) => {
  try {
    const {
      platform,
      type,
      name,
      amountInvested,
      currentValue,
      quantity,
      ticker,
      purchasePrice,
    } = req.body;
    const newInvestment = new Investment({
      userId: req.user.id,
      platform,
      type,
      name,
      amountInvested,
      currentValue,
      quantity,
      ticker,
      purchasePrice,
    });
    await newInvestment.save();
    res
      .status(201)
      .json({ success: true, message: "Investment added successfully" });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Error adding investment" });
  }
};
exports.getAggregatedHoldings = async (req, res) => {
  try {
    const investments = await Investment.find({ userId: req.user.id });
    let summary = {};

    investments.forEach((inv) => {
      if (!summary[inv.platform]) {
        summary[inv.platform] = { total: 0, assets: [] };
      }
      summary[inv.platform].total += inv.currentValue;
      summary[inv.platform].assets.push(`${inv.name}: ₹${inv.currentValue}`);
    });

    res.json({ success: true, data: summary });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Error fetching holdings" });
  }
};
exports.connectInvestmentAccount = async (req, res) => {
  try {
    const { platform, accountId } = req.body;

    console.log(`User ${req.user.id} linked ${platform} account: ${accountId}`);
    res.json({
      success: true,
      message: `${platform} account linked successfully!`,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error connecting investment account",
    });
  }
};
exports.fetchPlatformHoldings = async (req, res) => {
  try {
    const { platformId } = req.params;

    const investments = await Investment.find({
      userId: req.user.id,
      platform: platformId,
    });

    res.json({ success: true, data: investments });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error fetching platform holdings",
    });
  }
};
exports.removeInvestment = async (req, res) => {
  try {
    const { investmentId } = req.params;

    const deleted = await Investment.findOneAndDelete({
      _id: investmentId,
      userId: req.user.id,
    });

    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Investment not found" });
    }

    res.json({
      success: true,
      message: "Investment removed successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error removing investment",
    });
  }
};
exports.getPortfolioSummary = async (req, res) => {
  try {
    const investments = await Investment.find({ userId: req.user.id });

    let totalPortfolioValue = 0;
    let detailedSummary = [];

    for (let inv of investments) {
      try {
        let livePrice = inv.currentValue;

        if (inv.type === "Stock" && inv.ticker) {
          const quote = await yahooFinance.quote(inv.ticker);
          livePrice =
            quote?.regularMarketPrice || inv.purchasePrice || inv.currentValue;
        }

        const currentVal = inv.quantity
          ? inv.quantity * livePrice
          : inv.currentValue;

        totalPortfolioValue += currentVal;

        detailedSummary.push({
          name: inv.name,
          platform: inv.platform,
          type: inv.type,
          quantity: inv.quantity || "N/A",
          livePrice,
          currentVal: Math.round(currentVal),
        });
      } catch (yahooErr) {
        console.error(`❌ Error fetching data for ${inv.name}:`, yahooErr);
      }
    }

    res.json({
      success: true,
      totalValue: Math.round(totalPortfolioValue),
      detailedSummary,
    });
  } catch (err) {
    console.error("🔥 Error fetching portfolio summary:", err);
    res.status(500).json({
      success: false,
      message: "Error fetching live portfolio summary",
    });
  }
};
exports.getChartData = async (req, res) => {
  try {
    const investments = await Investment.find({ userId: req.user.id });

    const platformData = {};
    const typeData = {};
    const assetData = [];

    investments.forEach((inv) => {
      // Platform aggregation
      if (!platformData[inv.platform]) platformData[inv.platform] = 0;
      platformData[inv.platform] += inv.currentValue;

      // Type aggregation
      if (!typeData[inv.type]) typeData[inv.type] = 0;
      typeData[inv.type] += inv.currentValue;

      // Individual asset data
      assetData.push({
        name: inv.name,
        value: inv.currentValue,
        platform: inv.platform,
        type: inv.type,
      });
    });

    res.json({
      success: true,
      data: {
        byPlatform: platformData,
        byType: typeData,
        byAsset: assetData,
      },
    });
  } catch (err) {
    console.error("Error generating chart data:", err);
    res.status(500).json({
      success: false,
      message: "Error generating chart data",
    });
  }
};
