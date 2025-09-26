const asyncHandler = require("express-async-handler");
const db = require("../db/queries.js");
const {validationResult} = require("express-validator");
const {newCommentVal} = require("../utils/validators.js");



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
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }

    const userId = req.user.id;
    const postId = req.body.postId;
    const content = req.body.content;
    let comment = null;
    try {
        comment = await db.createComment(
            postId, userId, content
        );
    } catch (error) {
        console.log(error);
        return res.status(500).json(
            {errors: [{msg: "Unable to create comment"}]}
        );
    }
    if (!comment) {
        return res.status(400).json(
            {errors: [{msg: "Unable to create comment"}]}
        );
    }

    return res.json({comment});
});



const delCommentDelete = asyncHandler(async function(req, res) {
    if (!req.params || !req.params.commentId) {
        return res.status(400).json(
            {errors: [{msg: "Missing comment id param"}]}
        );
    }

    const commentId = req.params.commentId;
    const userId = req.user.id;
    let comment = null;
    try {
        comment = await db.deleteComment(commentId, userId);
    } catch (error) {
        console.log(error);
        return res.status(500).json(
            {errors: [{msg: "Unable to delete comment"}]}
        );
    }
    if (!comment) {
        return res.status(400).json(
            {errors: [{msg: "Unable to delete comment"}]}
        );
    }

    return res.json({comment});
});



module.exports = {
    commentsGet,
    createCommentPost: [
        newCommentVal,
        createCommentPost
    ],
    delCommentDelete
};