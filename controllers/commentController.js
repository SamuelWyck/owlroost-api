const asyncHandler = require("express-async-handler");
const db = require("../db/queries.js");



const commentsGet = asyncHandler(async function(req, res) {
    if (!req.params || !req.params.postId) {
        return res.status(400).json(
            {errors: [{msg: "Missing post id param"}]}
        );
    }


    const postId = req.params.postId;
    let comments = null;
    try {
        comments = await db.getPostComments(postId);
    } catch (error) {
        console.log(error);
        return res.status(500).json(
            {errors: [{msg: "Unable to get comments"}]}
        );
    }
    if (!comments) {
        return req.status(400).json(
            {errors: [{msg: "Unable to get comments"}]}
        );
    }

    return res.json({user: req.user, comments});
});



const createCommentPost = asyncHandler(async function(req, res) {
    
});



module.exports = {
    commentsGet
};