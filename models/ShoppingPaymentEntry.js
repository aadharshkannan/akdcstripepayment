const mongoose = require("mongoose");
const {Schema} = mongoose;

const ShoppingPaymentEntry = new Schema({
    googleId: String,
    transactionHash: String,        
    currency:String,
    total: Number,
    prodIds: [String],
    qtys:[Number],
    //Denormalization that makes it easy
    prodNames:[String],
    prodUrls:[String],
    prodPrices:[Number],
    transactionStatus:String,
    finalityBlock:String,
    customerWallet:String
});

mongoose.model('shoppingPaymentEntry',ShoppingPaymentEntry);