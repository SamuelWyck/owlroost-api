const asyncHandler = require("express-async-handler");
const db = require("../db/queries.js");
const pagination = require("../utils/paginationManager.js");



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
    let followingUser = null;
    try {
        [profile, followingUser] = await Promise.all([
            db.getUserProfile(userId, requestingUser),
            db.isFollowingUser(reqUserId, userId)
        ]);
    } catch (error) {
        console.log(error);
        return res.status(500).json(
            {errors: [{msg: "Unable to get user profile"}]}
        );
    }

    return res.json({user: req.user, profile, followingUser});
});



const usersGet = asyncHandler(async function(req, res) {
    const pageNum = (req.query && req.query.pageNum) ?
    Number(req.query.pageNum) : 0;
    const nameSearch = (req.query && req.query.name) ?
    req.query.name : "";
    const userId = (req.user) ? req.user.id : null;

    let users = null;
    try {
        users = await db.getUsers(
            userId, 
            nameSearch,
            pagination.userTakeNum,
            pagination.calcUserSKip(pageNum)
        );
    } catch (error) {
        console.log(error);
        return res.status(500).json(
            {errors: [{msg: "Unable to get users"}]}
        );
    }

    let moreUsers = false;
    if (users.length === pagination.userTakeNum) {
        users.pop();
        moreUsers = true;
    }

    return res.json({user: req.user, users, moreUsers});
});



const followUserPost = asyncHandler(async function(req, res) {
    if (!req.params || !req.params.userId) {
        return res.status(400).json(
            {errors: [{msg: "Missing user id param"}]}
        );
    }

    const userId = req.params.userId;
    const reqUserId = req.user.id;
    let request = null;
    try {
        request = await db.createFollowReq(userId, reqUserId);
    } catch (error) {
        console.log(error);
        return res.status(500).json(
            {errors: [{msg: "Unable to create request"}]}
        );
    }
    if (!request) {
        return res.status(400).json(
            {errors: [{msg: "Unable to create request"}]}
        );
    }

    return res.json({request});
});



const unfollowUserDel = asyncHandler(async function(req, res) {
    if (!req.params || !req.params.userId) {
        return res.status(400).json(
            {errors: [{msg: "Missing user id param"}]}
        );
    }

    const userId = req.params.userId;
    const followingUserId = req.user.id;
    let follow = null;
    try {
        const [reqfollow, acceptedFollow] = await Promise.all([
            db.deleteFollowReq(userId, followingUserId),
            db.deleteFollow(userId, followingUserId)
        ]);
        
        if (reqfollow) {
            follow = reqfollow;
        } else {
            follow = acceptedFollow;
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json(
            {errors: [{msg: "Unable to unfollow user"}]}
        );
    }
    if (!follow) {
        return res.status(400).json(
            {errors: [{msg: "Unable to unfollow user"}]}
        );
    }

    return res.json({follow});
});



module.exports = {
    userPostsGet,
    userProfileGet,
    usersGet,
    followUserPost,
    unfollowUserDel
};