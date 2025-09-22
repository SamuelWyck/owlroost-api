const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const db = require("../db/querys.js");
const bcrypt = require("bcryptjs");



async function verify(username, password, done) {
    const errorMsg = "Incorrect username or password";
    try {
        const user = await db.findUserByUsername(username);
        if (!user) {
            return done(null, false, {msg: errorMsg});
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return done(null, false, {msg: errorMsg});
        }

        delete user.password;
        delete user.email;
        return done(null, user);
    } catch (error) {
        return done(error);
    }
};

passport.use(new LocalStrategy(verify));

passport.deserializeUser(async function(userId, done) {
    try {
        const user = await db.findUserById(userId);
        done(null, user);
    } catch (error) {
        done(error);
    }
});

passport.serializeUser(function(user, done) {
    done(null, user.id);
});



module.exports = passport;