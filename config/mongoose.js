// import mongoose from "mongoose";
const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/paystack");

module.exports = { mongoose };
