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
    passport.authenticate('google'),
    async (req,res)=>{
        const gAuthUserObj = await gAuthUser.findOne({googleId: req.user.googleId});
        
        if(gAuthUserObj){
            res.redirect('/payments');
        }
        else{
            res.redirect('/askhelp');
        }        
    }
    );

    app.get('/api/logout',(req,res)=>{
        req.logout();
        res.redirect("/");
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