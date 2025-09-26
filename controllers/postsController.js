const asyncHandler = require("express-async-handler");
const db = require("../db/queries.js");
const {validationResult} = require("express-validator");
const {newPostVal, editPostVal} = require("../utils/validators.js");
const pagination = require("../utils/paginationManager.js");



const postsGet = asyncHandler(async function(req, res) {
    const orderByLikes = (
    req.query.orderByLikes && req.query.orderByLikes === "true"
    ) ? true : false;
    const pageNum = (req.query.pageNum) ? 
    req.query.pageNum : 0;

    let posts = null;
    try {
        posts = await db.getPosts(
            orderByLikes,
            pagination.postTakeNum,
            pagination.calcPostSkip(pageNum)
        );
    } catch (error) {
        return res.status(500).json(
            {errors: [{msg: "Unable to find posts"}]}
        );
    }

    let morePosts = false;
    if (posts.length === pagination.postTakeNum) {
        posts.pop();
        morePosts = true;
    }

    return res.json({user: req.user, posts, morePosts});
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



const postGet = asyncHandler(async function(req, res) {
    if (!req.params || !req.params.postId) {
        return res.status(400).json(
            {errors: [{msg: "Missing post id param"}]}
        );
    }

    const postId = req.params.postId;
    const userId = (req.user) ? req.user.id : null;
    let post = null;
    let postLike = null;
    try {
        [post, postLike] = await Promise.all([
            db.getPost(postId),
            db.getUserPostLike(postId, userId)
        ]);
    } catch (error) {
        console.log(error);
        return res.status(500).json(
            {errors: [{msg: "Unable to get post"}]}
        );
    }
    if (!post) {
        return res.status(400).json(
            {errors: [{msg: "Unable to get post"}]}
        ); 
    }

    const userLikedPost = (postLike) ? true : false;
    return res.json({post, user: req.user, userLikedPost});
});



const postEditPut = asyncHandler(async function(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }

    const userId = req.user.id;
    const postId = req.params.postId;
    const title = req.body.title;
    const content = req.body.content;

    let post = null;
    try {
        post = await db.updatePost(
            title, content, postId, userId
        );
    } catch (error) {
        console.log(error);
        return res.status(500).json(
            {errors: [{msg: "Unable to update post"}]}
        );
    }
    if (!post) {
        return res.status(400).json(
            {errors: [{msg: "Unable to update post"}]}
        );
    }

    return res.json({post, user: req.user});
});



const deletePostDelete = asyncHandler(async function(req, res) {
    if (!req.params || !req.params.postId) {
        return res.status(400).json(
            {errors: [{msg: "Missing post id param"}]}
        );
    }

    const postId = req.params.postId;
    const userId = req.user.id;
    let post = null;
    try {
        post = await db.deletePost(postId, userId);
    } catch (error) {
        console.log(error);
        return res.status(500).json(
            {errors: [{msg: "Unable to delete post"}]}
        );
    }
    if (!post) {
        return res.status(400).json(
            {errors: [{msg: "Unable to delete post"}]}
        );
    }

    return res.json({user: req.user, post});
});



module.exports = {
    postsGet,
    newPostPost: [
        newPostVal,
        newPostPost
    ],
    postGet,
    postEditPut: [
        editPostVal,
        postEditPut
    ],
    deletePostDelete
};