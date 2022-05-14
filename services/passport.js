const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const keys = require('../config/keys');
const mongoose = require('mongoose');

const gUser = mongoose.model('googleUsers');

var gOptions = {
    clientID: keys.creds.googleClientID,
    clientSecret: keys.creds.googleClientSecret,
    callbackURL:'/auth/google/callback',
    proxy: true

}

passport.deserializeUser(async (id,done)=>{
    const gUserObj =await gUser.findById(id);
    if (!gUserObj) {
        // in case of a massive error
        done(null,{error:"Unauthorized User"});
    }

    done(null,gUserObj);
});

passport.serializeUser((user,done)=>{
    // mongo generated user id
    done(null,user.id);
});

passport.use(new GoogleStrategy(gOptions,
    async (accessToken,refreshToken,profile, done)=>{
    
    const existingUser = await gUser.findOne({googleId: profile.id});
    if(existingUser){
        done(null,existingUser);
    }
    else
    {
        const newUser = await new gUser({
            googleId: profile.id,
            googleDisplayName:profile.displayName,
            googleDisplayPicURL: profile._json.picture
        }).save();

        done(null,newUser); 
    }
}));

