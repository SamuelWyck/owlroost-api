const asyncHandler = require("express-async-handler");
const db = require("../db/queries.js");



const postsGet = asyncHandler(async function(req, res) {
    return res.json({user: req.user});
});



module.exports = {
    postsGet
};