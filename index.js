const express = require('express');
const mongoose = require('mongoose');
const cookieSession = require('cookie-session');
const passport = require('passport');
const keys = require('./config/keys');
const stripe = require('stripe')(keys.creds.stripeServerSecret);
const storeWallet = keys.creds.storeWalletAddress;
const webHookServerSecret = keys.creds.webHookServerSecret;

require('./models/gUser');
require('./models/gAuthorizedUser');
require('./models/UserPaymentIntentEntry');
require('./models/ProductSKU');
require('./models/ShoppingPaymentEntry');

// For All Auth Workflows
require('./services/passport');

mongoose.connect(keys.creds.mongoURI);
const app = express();

app.use(
    cookieSession({
        maxAge: 30 * 24 * 60 *60 * 1000, // 30 days in milliseconds
        keys: [keys.creds.cookieKey]
    })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());

require('./routes/authRoutes')(app);
require('./routes/paymentRoutes')(app,stripe);
require('./routes/shoppingRoutes')(app,storeWallet,webHookServerSecret);

if(process.env.NODE_ENV === "production")
{
  // Go into particular production asset
  app.use(express.static('client/build'));

  // Default to index.html file
  const  path = require('path');
  app.get('*', (req,res)=>{
    res.sendFile(path.resolve(__dirname,'client','build','index.html'));
  }
  );
}

// Test env is 3000 and PORT is Heroku
const PORT = process.env.PORT || 5000; 
app.listen(PORT);