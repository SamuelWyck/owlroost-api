const {body} = require("express-validator");
const db = require("../db/queries.js");



async function isUniqueUsername(username) {
    const user = await db.findUserByUsername(username);
    if (user) {
        throw new Error("Username in use");
    }
    return true;
};

async function isUniqueEmail(email) {
    const user = await db.findUserByEmail(email);
    if (user) {
        throw new Error("Email in use");
    }
    return true;
};

function passwordsMatch(confirmedPassword, {req}) {
    return confirmedPassword === req.body.password;
};


const signupVal = [
    body("email").trim()
        .notEmpty().withMessage("Email required")
        .isEmail().withMessage("Invalid email")
        .isLength({max: 250}).withMessage("Max email length is 250 characters")
        .custom(isUniqueEmail).withMessage("Cannot use email"),
    body("username").trim()
        .notEmpty().withMessage("username required")
        .isLength({max: 250}).withMessage("Max username length is 250 characters")
        .custom(isUniqueUsername).withMessage("Cannot use username"),
    body("password")
        .notEmpty().withMessage("Password required")
        .isLength({min: 6}).withMessage("Minimum password length is 6"),
    body("confirm")
        .custom(passwordsMatch).withMessage("Passwords do not match")
];



module.exports = {
    signupVal
};