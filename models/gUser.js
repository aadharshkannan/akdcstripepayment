const mongoose = require("mongoose");
const {Schema} = mongoose;

const gUserSchema = new Schema({
    googleId: String,
    googleDisplayName: String,
    googleDisplayPicURL: String
});

mongoose.model('googleUsers',gUserSchema);