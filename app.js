const express = require("express");
const expressSession = require("express-session");
const {Pool} = require("pg");
const pgSession = require("connect-pg-simple")(expressSession);
const passport = require("./utils/passport.js");
require("dotenv").config();



const app = express();


app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.use(expressSession({
    store: new pgSession({
        pool: new Pool({
            connectionString: process.env.DATABASE_URL
        })
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7, // one week
        sameSite: "none",
        // secure: true
    }
}));

app.use(passport.initialize());
app.use(passport.session());


app.get("/", function(req, res) {
    res.json({result: "Hello world"});
});



const PORT = process.env.PORT;


app.listen(PORT, function() {
    console.log(`Server running on port ${PORT}`);
});