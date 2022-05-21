
const mongoose = require('mongoose');
const ProductSKU = mongoose.model('productSKU');
const gAuthUser = mongoose.model('googleAuthorizedUser');
const ShopingPaymentEntry = mongoose.model('shoppingPaymentEntry');

module.exports=(app,walletInfo,webHookServerSecret)=>{

    app.get('/api/shopping/catalog',
    async (req,res)=>{
        if(!req.user)
        {
         res.redirect('/askhelp');
         return;   
        }

        var allDocumentsCount = await ProductSKU.countDocuments();
        var random = Math.floor(Math.random() * allDocumentsCount);
        var results = await ProductSKU.find().skip(random).limit(20);

        var pCount = results.length;
        var respObj = []

        for(var i=0;i<pCount;i++)
        {
            var product = results[i];
            var pricing = [];
            var pLen = product.pricing.length;
            var plist = product.pricing
            for (var j=0;j<pLen;j++)
            {
                pricing.push({
                    currency:plist[j].currency,
                    price:plist[j].price
                });
            }
            respObj.push({
                id:product.id,
                sku: product.sku,
                name:product.name,
                brand:product.brand,
                img:product.img,
                pricing:pricing
            });
        }

        res.send(respObj);        
    }
    );

    app.get('/api/shopping/storewallet',
    async(req,res)=>{
        res.send({storeWallet:walletInfo.storeWallet,
        usdcContract:walletInfo.usdcContract,
        akdcContract:walletInfo.akdcContract});
    });
    
    app.post('/api/shopping/purchase',
    async (req,res)=>{

        if(!req.user)
        {
         res.redirect('/askhelp');
         return;   
        }

        const userId = req.user.googleId;
        const gAuthUserObj = await gAuthUser.findOne({googleId:userId });

        if(!gAuthUserObj)
        {
            res.redirect('/askhelp');
            return;
        }

        var reqBody = req.body;
        var purchaseDBEntry = await new ShopingPaymentEntry({
            googleId: userId,            
            customerWallet:reqBody.customerWallet,
            transactionHash: reqBody.transactionHash,        
            currency:reqBody.currency,
            total: reqBody.total,
            prodIds: reqBody.metadata.prodIds,
            qtys:reqBody.metadata.qtys,
            prodNames:reqBody.metadata.prodNames,
            prodUrls: reqBody.metadata.prodUrls,
            prodPrices:reqBody.prodPrices,
            transactionStatus:"Pending"
        }).save();

        res.send({redirect:'/shopping/confirmation?txhash='.concat(purchaseDBEntry.transactionHash)});
    });

    app.get('/api/shopping/txstatus',
    async(req,res)=>{
        if(!req.user)
        {
         res.redirect('/askhelp');
         return;   
        }

        const userId = req.user.googleId;
        const gAuthUserObj = await gAuthUser.findOne({googleId:userId });

        if(!gAuthUserObj)
        {
            res.redirect('/askhelp');
            return;
        }
        const txhash = req.query.transactionHash;
        var txObjDB = await ShopingPaymentEntry.findOne({transactionHash:txhash});
        if(txObjDB && txObjDB.googleId !== userId)
        {
            res.status(403).send("You are not permitted to view this transaction");
            return;
        }

        res.send({
            googleId: txObjDB.googleId,
            transactionHash: txObjDB.transactionHash,        
            currency:txObjDB.currency,
            total: txObjDB.total,
            prodIds: txObjDB.prodIds,
            qtys:txObjDB.qtys,
            prodNames:txObjDB.prodNames,
            prodUrls: txObjDB.prodUrls,
            prodPrices:txObjDB.prodPrices,
            transactionStatus:txObjDB.transactionStatus,
            customerWallet:txObjDB.customerWallet
        });
    });

    app.get('/api/shopping/pendingtxs',
    async(req,res)=>{

        const webHookClientSecret = req.query.whsecret;

        if(webHookClientSecret!==webHookServerSecret)
        {
            res.status(403).send("You shall not pass!");
            return;
        }

        var pendingOnes = await ShopingPaymentEntry.find({transactionStatus:"Pending"});

        var respObj = [];
        var pendCount = pendingOnes.length;

        for(var i=0;i<pendCount;i++)
        {
            respObj.push(pendingOnes[i].transactionHash);
        }

        res.send({storeWallet:storeWallet,
        pendingTx:respObj});
        
    });

    app.get('/api/shopping/mytxs',
    async(req,res)=>{

        if(!req.user)
        {
         res.redirect('/askhelp');
         return;   
        }

        const userId = req.user.googleId;
        const gAuthUserObj = await gAuthUser.findOne({googleId:userId});

        if(!gAuthUserObj)
        {
            res.redirect('/askhelp');
            return;
        }

        var mytxs = await ShopingPaymentEntry.find({googleId:userId});

        var respObj = [];
        var txCnt = mytxs.length;

        for(var i=0;i<txCnt;i++)
        {
            respObj.push(
                {
                    transactionHash: mytxs[i].transactionHash,
                    transactionStatus: mytxs[i].transactionStatus
                });
        }

        res.send(respObj);        
    });

    app.post('/api/shopping/completedtxs',
    async(req,res)=>{
        const webHookClientSecret = req.query.whsecret;

        if(webHookClientSecret!==webHookServerSecret)
        {
            res.status(403).send("You shall not pass!");
            return;
        }

        var completedTxs = req.Body;

        for(var tx in completedTxs)
        {
            var record = ShopingPaymentEntry.findOne({transactionHash:tx.transactionHash});
            await record.overwrite({transactionStatus:tx.status,finalityBlock:tx.block}).save();
        }

        res.send("Success!");
    }
    );
};