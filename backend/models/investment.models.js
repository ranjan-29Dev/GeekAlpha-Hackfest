const mongoose = require("mongoose");

const investmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  platform: { type: String, required: true }, 
  type: { type: String, enum: ["Stock", "Mutual Fund"], required: true },
  name: { type: String, required: true }, 
  ticker: {
    type: String,
    required: function () {
      return this.type === "Stock";
    },
  }, 
  quantity: {
    type: Number,
    required: function () {
      return this.type === "Stock";
    },
  },
  amountInvested: { type: Number, required: true },
  currentValue: { type: Number, required: true },
  purchasePrice: { type: Number },
  lastUpdated: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Investment", investmentSchema);
