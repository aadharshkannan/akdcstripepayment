const mongoose = require("mongoose");
const {Schema} = mongoose;

const googleAuthorizedUser = new Schema({
    googleId: String,
    authorizationString: String
});

mongoose.model('googleAuthorizedUser',googleAuthorizedUser);