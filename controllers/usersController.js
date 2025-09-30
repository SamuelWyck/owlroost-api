const asyncHandler = require("express-async-handler");
const db = require("../db/queries.js");



const userPostsGet = asyncHandler(async function(req, res) {
    if (!req.params || !req.params.userId) {
        return res.status(400).json(
            {errors: [{msg: "Missing user id param"}]}
        );
    }

    const userId = req.params.userId;
    let posts = null;
    try {
        posts = await db.getUserPosts(userId);
    } catch (error) {
        console.log(error);
        return res.status(500).json(
            {errors: [{msg: "Unable to get user posts"}]}
        );
    }
    if (!posts) {
        return res.status(400).json(
            {errors: [{msg: "Unable to get user posts"}]}
        ); 
    }

    return res.json({posts, user: req.user});
});



const userProfileGet = asyncHandler(async function(req, res) {
    if (!req.params || !req.params.userId) {
        return res.status(400).json(
            {errors: [{msg: "Missing user id param"}]}
        );
    }

    const userId = req.params.userId;
    const reqUserId = (req.user) ? req.user.id : null;
    const requestingUser = userId === reqUserId;
    let profile = null;
    try {
        profile = await db.getUserProfile(
            userId, requestingUser
        );
    } catch (error) {
        console.log(error);
        return res.status(500).json(
            {errors: [{msg: "Unable to get user profile"}]}
        );
    }

    return res.json({user: req.user, profile});
});



const usersGet = asyncHandler(async function(req, res) {
    const nameSearch = (req.query && req.query.name) ?
    req.query.name : "";
    const userId = (req.user) ? req.user.id : null;

    let users = null;
    try {
        users = await db.getUsers(userId, nameSearch);
    } catch (error) {
        console.log(error);
        return res.status(500).json(
            {errors: [{msg: "Unable to get users"}]}
        );
    }
    
    return res.json({user: req.user, users});
});



module.exports = {
    userPostsGet,
    userProfileGet,
    usersGet
};