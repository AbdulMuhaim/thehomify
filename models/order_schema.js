const mongoose = require("mongoose");

const product = require("../models/product_schema");

const order_schema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  orderId: {
    type: String,
    
    required: true,
   // generate a custom order ID using uuid
  },
  deliveryAddress: {
    type: String,
  },
  date: {
    type: Date,
  },
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "product",
        required: true,
      },
      quantity: String,
      singleTotal: Number,
    },
  ],
  total: {
    type: Number,
  },
  paymentType: {
    type: String,
  },
  couponCode: {
    type: String,
  },
  discount: {
    type: Number,
  },
  status: {
    type: String,
    default: "Placed",
  },
});

const Order = mongoose.model("order", order_schema);
module.exports = Order;