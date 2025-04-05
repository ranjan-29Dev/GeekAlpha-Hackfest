const express = require("express");
const axios = require("axios");
require("dotenv").config();

const router = express.Router();
router.get("/stock/:symbol", async (req, res) => {
    const symbol = req.params.symbol.toUpperCase();
    
    try {
        const response = await axios.get(`https://yfapi.net/v8/finance/chart/${symbol}`, {
            headers: {
                "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
                "X-RapidAPI-Host": "yfapi.net",
            },
        });

        res.json(response.data);
    } catch (error) {
        console.error("Error fetching stock data:", error.message);
        res.status(500).json({ error: "Failed to fetch market data" });
    }
});

module.exports = router;