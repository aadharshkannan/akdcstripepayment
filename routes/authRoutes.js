const passport = require('passport');
const mongoose = require('mongoose');
const gAuthUser = mongoose.model('googleAuthorizedUser');

module.exports=(app)=>{
    app.get('/auth/google',
    passport.authenticate('google', {
        scope:['profile','email']    
        })
    );

    app.get('/auth/google/callback',
    passport.authenticate('google'));

    app.get('/api/logout',(req,res)=>{
        req.logout();
        res.send({message:"Logged Out",
                  user:req.user});
    });

    app.get('/api/current_user',
    async (req,res)=>{

        if(!req.user)
        {
            res.send({message:"Nobody"});
        }
        else
        {
            const gAuthUserObj = await gAuthUser.findOne({googleId: req.user.googleId});
            res.send({user:req.user,auth:gAuthUserObj});
        }               
    });
};