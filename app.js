const express = require("express");
const expressSession = require("express-session");
const pgSession = require("connect-pg-simple")(expressSession);
const cors = require("cors");
const {Pool} = require("pg");
const passport = require("./utils/passport.js");
require("dotenv").config();
const authRoute = require("./routes/authRoute.js");
const postsRoute = require("./routes/postsRoute.js");
const commentsRoute = require("./routes/commentsRoute.js");
const usersRoute = require("./routes/usersRoute.js");
const fs = require("node:fs");
const path = require("node:path");



const app = express();

app.use(cors({
    origin: process.env.FRONTEND_DOMAIN,
    credentials: true
}));

app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.set("trust proxy", 1);
app.use(expressSession({
    store: new pgSession({
        pool: new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: {
                require: true,
                ca: fs.readFileSync(path.join(__dirname, "./ca.pem")).toString()
            }
        })
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7, // one week
        sameSite: "none",
        secure: true
    }
}));

app.use(passport.initialize());
app.use(passport.session());


app.use("/auth", authRoute);
app.use("/posts", postsRoute);
app.use("/comments", commentsRoute);
app.use("/users", usersRoute);

app.use(function(req, res) {
    return res.status(404).json(
        {errors: [{msg: "Page not found"}]}
    );
});

app.use(function(error, req, res, next) {
    console.log(error);
    return res.status(500).json(
        {errors: [{msg: "Server error"}]}
    );
});



const PORT = process.env.PORT;


app.listen(PORT, function() {
    console.log(`Server running on port ${PORT}`);
});