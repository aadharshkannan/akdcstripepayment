const mongoose = require("mongoose");
const {Schema} = mongoose;

const PricingSchema = new Schema({
    currency:String,
    price:Number
});

const ProductSKU = new Schema({
    sku: String,
    name: String,
    brand:String,
    img:String,
    pricing:[PricingSchema]
});

mongoose.model('productSKU',ProductSKU);