const asyncHandler = require("express-async-handler");
const db = require("../db/queries.js");
const {validationResult} = require("express-validator");
const {newPostVal} = require("../utils/validators.js");



const postsGet = asyncHandler(async function(req, res) {
    return res.json({user: req.user});
});



const newPostPost = asyncHandler(async function(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }

    const userId = req.user.id;
    const title = req.body.title;
    const content = req.body.content;

    let post = null;
    try {
        post = await db.createPost(userId, title, content);
    } catch (error) {
        console.log(error);
        return res.status(500).json(
            {errors: [{msg: "Unable to create post"}]}
        );
    }
    if (!post) {
        return res.status(400).json(
            {errors: [{msg: "Unable to create post"}]}
        );
    }

    return res.json({result: "success"});
});



module.exports = {
    postsGet,
    newPostPost: [
        newPostVal,
        newPostPost
    ]
};