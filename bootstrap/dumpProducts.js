require('dotenv').config()

const mongoose = require('mongoose');
const sampleProducts = require('./sampleProducts');

require('../models/ProductSKU');

mongoose.connect(process.env.MONGO_URI_PROD);
const ProductSKU = mongoose.model('productSKU');

console.log(sampleProducts.length)

async function main(){
    for(var i=0;i<sampleProducts.length;i++)
    {
        var dbEntry = await new ProductSKU(sampleProducts[i]).save();
        console.log(dbEntry.sku);
    }

    console.log("Done with all!")
}

main()