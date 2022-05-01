const express = require('express');
const app = express();

app.get('/',(req,res)=>{
    res.send({name:'Aadharsh'});
});

// Test env is 3000 and PORT is Heroku
const PORT = process.env.PORT || 3000; 
app.listen(PORT);