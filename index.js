const express = require('express');
const mongoose = require('mongoose');
const cookieSession = require('cookie-session');
const passport = require('passport');
const keys = require('./config/keys');

// For Google Auth
require('./models/gUser');
require('./models/gAuthorizedUser');

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

require('./routes/authRoutes')(app);

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