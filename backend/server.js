require("dotenv").config();
console.log(process.env.MONGO_URL);
const express = require("express");
const mongoose = require("mongoose");



const app = express();
app.use(express.json());

async function main() {
    await mongoose.connect(process.env.MONGO_URL);
    app.listen(3000);
    console.log("listening on port 3000");
  }
  
  main();
  