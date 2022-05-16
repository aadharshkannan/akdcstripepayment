
const mongoose = require('mongoose');
const gAuthUser = mongoose.model('googleAuthorizedUser');
const UserPaymentIntentEntry = mongoose.model('userPaymentIntentEntry');

module.exports=(app,stripe)=>{

    app.get('/api/payments/confirmation',
    async (req,res)=>{
        if(!req.user)
        {
         res.redirect('/askhelp');
         return;   
        }
        const pi_query = req.query.payment_intent;
        if(!pi_query)
        {
            res.status(400);
            res.send("Please include Payment Intent Query Parameter");
            return;
        }
        
        const userId = req.user.googleId;
        const paymentIntentDBEntry = await UserPaymentIntentEntry.findOne({stripePaymentIntentId:pi_query});

        if(!paymentIntentDBEntry || paymentIntentDBEntry.googleId!==userId)
        {
            res.send({message:"Record not found"});
            return;
        }

        res.send({stripePaymentIntentId: paymentIntentDBEntry.stripePaymentIntentId,
            googleId: userId,
            amount: (paymentIntentDBEntry.amount/100).toFixed(2),
            currency:paymentIntentDBEntry.currency,
            destWallet:paymentIntentDBEntry.destWallet,
            })
    }
    );  

    app.post('/api/payments/intent',
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

        const amt = req.body.amount;
        const walletAddress = req.body.walletAddress;

        const paymentIntent = await stripe.paymentIntents.create({
            amount:Math.round(amt*100),
            currency:'usd',
            metadata:{
                walletAddress:walletAddress
            }
        });

        const paymentIntentDBEntry = await new UserPaymentIntentEntry({
            stripePaymentIntentId: paymentIntent.id,
            googleId: userId,
            amount: paymentIntent.amount,
            currency:paymentIntent.currency,
            destWallet:paymentIntent.metadata.walletAddress,
            clientSecret:paymentIntent.client_secret
        }).save();

        res.send({clientSecret:paymentIntentDBEntry.clientSecret});

    });
};