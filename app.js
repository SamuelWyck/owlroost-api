const express = require("express");
require("dotenv").config();



const app = express();


app.use(express.urlencoded({extended: true}));
app.use(express.json());



app.get("/", function(req, res) {
    res.json({result: "Hello world"});
});



const PORT = process.env.PORT;


app.listen(PORT, function() {
    console.log(`Server running on port ${PORT}`);
});