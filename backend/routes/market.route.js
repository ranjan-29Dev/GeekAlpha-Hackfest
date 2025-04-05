const express = require("express");
const { getStockData } = require("../controllers/market.controller");
const { userMiddleware } = require("../middlewares/user.middlewares");

const router = express.Router();


router.get("/stocks", userMiddleware, getStockData);

module.exports = router;
