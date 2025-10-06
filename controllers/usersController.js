const asyncHandler = require("express-async-handler");
const db = require("../db/queries.js");
const pagination = require("../utils/paginationManager.js");
const fs = require("node:fs/promises");
const path = require("node:path");
const {uploadProfileImage, deleteImage} = require("../utils/cloudinary.js");



const userPostsGet = asyncHandler(async function(req, res) {
    if (!req.params || !req.params.userId) {
        return res.status(400).json(
            {errors: [{msg: "Missing user id param"}]}
        );
    }

    const pageNum = (req.query && req.query.pageNum)
    ? Number(req.query.pageNum) : 0;
    const userId = req.params.userId;
    let posts = null;
    try {
        posts = await db.getUserPosts(
            userId,
            pagination.postTakeNum,
            pagination.calcPostSkip(pageNum)
        );
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

    let morePosts = false;
    if (posts.length === pagination.postTakeNum) {
        posts.pop();
        morePosts = true;
    }

    return res.json({posts, user: req.user, morePosts});
});



const userCommentsGet = asyncHandler(async function(req, res) {
    if (!req.params || !req.params.userId) {
        return res.status(400).json(
            {errors: [{msg: "Missing user id param"}]}
        );
    }

    const userId = req.params.userId;
    const pageNum = (req.query && req.query.pageNum)
    ? Number(req.query.pageNum) : 0;
    let comments = null;
    try {
        comments = await db.getUserComments(
            userId,
            pagination.commentTakeNum,
            pagination.calcCommentSkip(pageNum)
        );
    } catch (error) {
        console.log(error);
        return res.status(500).json(
            {errors: [{msg: "Unable to get comments"}]}
        );
    }

    let moreComments = false;
    if (comments.length === pagination.commentTakeNum) {
        comments.pop();
        moreComments = true;
    }

    return res.json({comments, user: req.user, moreComments});
});



const userFollowedPostsGet = asyncHandler(async function(req, res) {
    if (!req.params || !req.params.userId) {
        return res.status(400).json(
            {errors: [{msg: "Missing user id param"}]}
        );
    }

    const userId = req.params.userId;
    const pageNum = (req.query && req.query.pageNum)
    ? Number(req.query.pageNum) : 0;
    let posts = null;
    try {
        posts = await db.getUserFollowedPosts(
            userId,
            pagination.postTakeNum,
            pagination.calcPostSkip(pageNum)
        );
    } catch (error) {
        console.log(error);
        return res.status(500).json(
            {errors: [{msg: "Unable to get posts"}]}
        );
    }

    let morePosts = false;
    if (posts.length === pagination.postTakeNum) {
        posts.pop();
        morePosts = true;
    }

    return res.json({user: req.user, posts, morePosts});
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



const updateUserInfoPut = asyncHandler(async function(req, res) {
    if (!req.body || req.body.info === undefined) {
        return res.status(400).json(
            {errors: [{msg: "Missing info text"}]}
        );
    }
    if (req.body.info.trim().length > 3000) {
        return res.status(400).json(
            {errors: [{msg: "Info text is too long"}]}
        );
    }

    const userId = req.user.id;
    const info = req.body.info.trim();
    let user = null;
    try {
        user = await db.updateUserInfo(userId, info);
    } catch (error) {
        console.log(error);
        return res.status(500).json(
            {errors: [{msg: "Unable to update user info"}]}
        );
    }
    if (!user) {
        return res.status(400).json(
            {errors: [{msg: "Unable to update user info"}]}
        );
    }

    return res.json({result: "success"});
});



const rejectFollowDel = asyncHandler(async function(req, res) {
    if (!req.params.userId || !req.params.userId) {
        return res.status(400).json(
            {errors: [{msg: "Missing user id param"}]}
        );
    }

    const requestingUserId = req.params.userId;
    const receivingUserId = req.user.id;

    let request = null;
    try {
        request = await db.deleteFollowReq(
            receivingUserId, requestingUserId
        );
    } catch (error) {
        console.log(error);
        return res.status(500).json(
            {errors: [{msg: "Unable to delete request"}]}
        );
    }
    if (!req) {
        return res.status(400).json(
            {errors: [{msg: "Unable to delete request"}]}
        );
    }

    return res.json({request});
});



const acceptFollowPost = asyncHandler(async function(req, res) {
    if (!req.params.userId || !req.params.userId) {
        return res.status(400).json(
            {errors: [{msg: "Missing user id param"}]}
        );
    }

    const followedUserId = req.user.id;
    const followingUserId = req.params.userId;

    let follow = null;
    let request = null;
    try {
        [follow, request] = await Promise.all([
            db.createFollow(
                followedUserId, followingUserId
            ),
            db.deleteFollowReq(
                followedUserId, followingUserId
            )
        ]);
    } catch (error) {
        console.log(error);
        return res.status(500).json(
            {errors: [{msg: "Unable to follow user"}]}
        );
    }
    if (!follow) {
        return res.status(400).json(
            {errors: [{msg: "Unable to follow user"}]}
        );
    }

    return res.json({follow});
});



const uploadUserImgPost = asyncHandler(async function(req, res) {
    if (!req.file) {
        return res.status(400).json(
            {errors: [{msg: "Missing image file"}]}
        );
    }

    const userId = req.user.id;
    const filePath = path.resolve(req.file.path);
    let user = null;
    try {
        user = await db.findUserById(userId);
    } catch (error) {
        console.log(error);
        return res.status(500).json(
            {errors: [{msg: "Unable to get user"}]}
        );
    }
    if (!user) {
        return res.status(400).json(
            {errors: [{msg: "Unable to get user"}]}
        );
    }

    let imageInfo = null;
    let del = null;
    if (!user.profile_img_url) {
        imageInfo = await uploadProfileImage(filePath);
    } else {
        [imageInfo, del] = await Promise.all([
            uploadProfileImage(req.file.path),
            deleteImage(user.profile_public_id)
        ]);
    }
    await fs.unlink(filePath);
    if (imageInfo.errors || (del && del.errors)) {
        return res.status(500).json({
            errors: [{msg: "unable to upload image"}]
        });
    }

    let updatedUser = null;
    try {
        updatedUser = await db.updateUserProfileImage(
            userId, imageInfo.secure_url, imageInfo.public_id
        );
    } catch (error) {
        console.log(error);
        return res.status(500).json(
            {errors: [{msg: "Error updating image"}]}
        );
    }
    if (!updatedUser) {
        return res.status(400).json(
            {errors: [{msg: "Error updating image"}]}
        );
    }

    return res.json({
        user: updatedUser, 
        img_url: updatedUser.profile_img_url
    });
});



module.exports = {
    userPostsGet,
    userCommentsGet,
    userFollowedPostsGet,
    userProfileGet,
    usersGet,
    followUserPost,
    unfollowUserDel,
    updateUserInfoPut,
    rejectFollowDel,
    acceptFollowPost,
    uploadUserImgPost
};