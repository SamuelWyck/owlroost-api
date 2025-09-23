const asyncHandler = require("express-async-handler");
const db = require("../db/queries.js");
const {validationResult} = require("express-validator");
const {signupVal} = require("../utils/validators.js");
const bcrypt = require("bcryptjs");
const passport = require("../utils/passport.js");



const signupPost = asyncHandler(async function(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }

    const username = req.body.username;
    const email = req.body.email;
    const pwdHash = await bcrypt.hash(req.body.password, 10);

    let user = null;
    try {
        user = await db.createUser(email, username, pwdHash);
    } catch (error) {
        return res.status(500).json(
            {errors: [{msg: "Unable to create user"}]}
        );
    }
    if (!user) {
        return res.status(400).json(
            {errors: [{msg: "Unable to create user"}]}
        );
    }

    return next();
});



const loginPost = asyncHandler(async function(req, res) {
    if (!req.body.username) {
        return res.status(400).json(
            {errors: [{msg: "Username required"}]}
        );
    }
    if (!req.body.password) {
        return res.status(400).json(
            {errors: [{msg: "Password required"}]}
        );
    }

    const authFunction = passport.authenticate("local", function(error, user, info) {
        if (error) {
            return res.status(500).json({
                errors: [{msg: "Unable to log in user"}]
            });
        }
        if (!user) {
            return res.status(400).json({errors: [info]});
        }

        req.login(user, function(error) {
            if (error) {
                return res.status(500).json(
                    {errors: [{msg: "Unable to log in user"}]}
                );
            }
            return res.json({user});
        });
    });
    authFunction(req, res);
});



function logoutPost(req, res) {
    req.logout(function(error) {
        if (error) {
            return res.status(500).json({
                errors: [{msg: "Unable to log out user"}]
            });
        }
        return res.json({result: "success"});
    });
};



function authStatusGet(req, res) {
    const authStatus = (req.user) ? true : false;
    return res.json({authenticated: authStatus, user: req.user});
};



module.exports = {
    signupPost: [
        signupVal,
        signupPost,
        loginPost
    ],
    loginPost,
    logoutPost,
    authStatusGet
};