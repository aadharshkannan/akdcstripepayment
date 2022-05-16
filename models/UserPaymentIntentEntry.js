const mongoose = require("mongoose");
const {Schema} = mongoose;

const UserPaymentIntentEntry = new Schema({
    stripePaymentIntentId: String,
    googleId: String,
    amount: Number,
    currency:String,
    destWallet:String,
    clientSecret:String
});

mongoose.model('userPaymentIntentEntry',UserPaymentIntentEntry);