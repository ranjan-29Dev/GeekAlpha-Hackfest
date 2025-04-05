require("dotenv").config();
console.log(process.env.MONGO_URL);
const express = require("express");
const mongoose = require("mongoose");
const userRouter = require("./routes/user.routes");
const investmentRoutes = require("./routes/investment.route");
const marketRoutes = require("./routes/market.route");

const app = express();
app.use(express.json());

app.use("/api/v1/user", userRouter);
app.use("/api/market", marketRoutes);
app.use("/api/investments", investmentRoutes);

async function main() {
  await mongoose.connect(process.env.MONGO_URL);
  app.listen(3000);
  console.log("listening on port 3000");
}

main();
